import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const provinces = [
  { name: "Western Province", code: "WP" },
  { name: "Central Province", code: "CP" },
  { name: "Southern Province", code: "SP" },
  { name: "Northern Province", code: "NP" },
  { name: "Eastern Province", code: "EP" },
  { name: "North Western Province", code: "NWP" },
  { name: "North Central Province", code: "NCP" },
  { name: "Uva Province", code: "UP" },
  { name: "Sabaragamuwa Province", code: "SGP" },
];

const districtsByProvince: Record<string, string[]> = {
  WP: ["Colombo", "Gampaha", "Kalutara"],
  CP: ["Kandy", "Matale", "Nuwara Eliya"],
  SP: ["Galle", "Matara", "Hambantota"],
  NP: ["Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"],
  EP: ["Batticaloa", "Ampara", "Trincomalee"],
  NWP: ["Kurunegala", "Puttalam"],
  NCP: ["Anuradhapura", "Polonnaruwa"],
  UP: ["Badulla", "Monaragala"],
  SGP: ["Ratnapura", "Kegalle"],
};

const substationNames = [
  "Central Grid Substation",
  "Regional Grid Substation",
  "North Grid Substation",
  "South Grid Substation",
  "East Grid Substation",
  "West Grid Substation",
];

function randomBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function generateSolarPower(
  capacityKw: number,
  date: Date
): number {
  const hour =
    date.getHours() + date.getMinutes() / 60;

  if (hour < 6 || hour >= 18) {
    return 0;
  }

  const solarProgress =
    ((hour - 6) / 12) * Math.PI;

  const solarFactor = Math.sin(solarProgress);
  const variation = randomBetween(0.85, 1.05);

  const power =
    capacityKw *
    solarFactor *
    variation;

  return Math.max(
    0,
    Number(power.toFixed(3))
  );
}

async function main() {
  console.log("Starting database seed...");

 
  await prisma.$executeRawUnsafe(`
  TRUNCATE TABLE
    "GenerationReading",
    "User",
    "SolarInstallation",
    "GridSubstation",
    "District",
    "Province"
  RESTART IDENTITY CASCADE;
`);

  
  const createdProvinces = [];

  for (const provinceData of provinces) {
    const province =
      await prisma.province.create({
        data: provinceData,
      });

    createdProvinces.push(province);
  }

  console.log(
    `Created ${createdProvinces.length} provinces.`
  );

  const createdDistricts = [];

  for (const province of createdProvinces) {
    const districtNames =
      districtsByProvince[province.code];

    for (const districtName of districtNames) {
      const district =
        await prisma.district.create({
          data: {
            name: districtName,
            code: `${province.code}-${districtName
              .replace(/\s+/g, "")
              .substring(0, 5)
              .toUpperCase()}`,
            provinceId: province.id,
          },
        });

      createdDistricts.push(district);
    }
  }

  console.log(
    `Created ${createdDistricts.length} districts.`
  );

  
  const createdSubstations = [];

  for (const district of createdDistricts) {
    for (let i = 1; i <= 2; i++) {
      const substation =
        await prisma.gridSubstation.create({
          data: {
            name: `${district.name} ${
              substationNames[i - 1]
            }`,
            code: `GS-${district.code}-${String(
              i
            ).padStart(2, "0")}`,
            districtId: district.id,
          },
        });

      createdSubstations.push(substation);
    }
  }

  console.log(
    `Created ${createdSubstations.length} substations.`
  );

 
  const createdInstallations = [];

  for (const substation of createdSubstations) {
    for (let i = 1; i <= 10; i++) {
      const capacityKw =
        randomBetween(2.5, 10);

      const installation =
        await prisma.solarInstallation.create({
          data: {
            name: `${substation.code} Solar Installation ${String(
              i
            ).padStart(2, "0")}`,

            meterId:
              `MTR-${substation.code}-${String(
                i
              ).padStart(3, "0")}`,

            inverterId:
              `INV-${substation.code}-${String(
                i
              ).padStart(3, "0")}`,

            capacityKw:
              Number(capacityKw.toFixed(2)),

            latitude:
              Number(
                randomBetween(5.9, 9.8).toFixed(6)
              ),

            longitude:
              Number(
                randomBetween(79.7, 81.9).toFixed(6)
              ),

            active: true,

            substationId: substation.id,
          },
        });

      createdInstallations.push(
        installation
      );
    }
  }

  console.log(
    `Created ${createdInstallations.length} solar installations.`
  );

  
  const now = new Date();

  const startDate = new Date(now);

  startDate.setDate(
    startDate.getDate() - 7
  );

  startDate.setHours(0, 0, 0, 0);

  const batchSize = 5000;
  let readingBatch: {
    installationId: number;
    timestamp: Date;
    powerKw: number;
    cumulativeKwh: number;
    voltage: number;
  }[] = [];

  let totalReadings = 0;

  for (const installation of createdInstallations) {
    let cumulativeEnergy = 0;

    const capacityKw =
      Number(installation.capacityKw);

    for (
      let minutes = 0;
      minutes < 7 * 24 * 60;
      minutes += 15
    ) {
      const timestamp =
        new Date(
          startDate.getTime() +
            minutes * 60 * 1000
        );

      const powerKw =
        generateSolarPower(
          capacityKw,
          timestamp
        );

      const intervalEnergy =
        powerKw * 0.25;

      cumulativeEnergy +=
        intervalEnergy;

      const voltage =
        powerKw === 0
          ? randomBetween(220, 235)
          : randomBetween(225, 245);

      readingBatch.push({
        installationId:
          installation.id,

        timestamp,

        powerKw:
          Number(
            powerKw.toFixed(3)
          ),

        cumulativeKwh:
          Number(
            cumulativeEnergy.toFixed(3)
          ),

        voltage:
          Number(
            voltage.toFixed(2)
          ),
      });

      totalReadings++;

      if (
        readingBatch.length >=
        batchSize
      ) {
        await prisma.generationReading.createMany(
          {
            data: readingBatch,
          }
        );

        readingBatch = [];

        console.log(
          `Inserted ${totalReadings} readings...`
        );
      }
    }
  }

 
  if (readingBatch.length > 0) {
    await prisma.generationReading.createMany(
      {
        data: readingBatch,
      }
    );
  }

  console.log(
    `Created ${totalReadings} generation readings.`
  );

  
  const passwordHash =
    await bcrypt.hash(
      "Password123!",
      10
    );

 
  await prisma.user.create({
    data: {
      name: "National Analyst",
      email:
        "national@slsea.gov.lk",
      passwordHash,
      role:
        UserRole.NATIONAL_ANALYST,
    },
  });

  
  const westernProvince =
    createdProvinces.find(
      (province) =>
        province.code === "WP"
    );

  if (westernProvince) {
    await prisma.user.create({
      data: {
        name:
          "Western Province Analyst",
        email:
          "western@slsea.gov.lk",
        passwordHash,
        role:
          UserRole.PROVINCE_ANALYST,
        provinceId:
          westernProvince.id,
      },
    });
  }

  const colomboDistrict =
    createdDistricts.find(
      (district) =>
        district.name === "Colombo"
    );

  if (colomboDistrict) {
    await prisma.user.create({
      data: {
        name:
          "Colombo District Analyst",
        email:
          "colombo@slsea.gov.lk",
        passwordHash,
        role:
          UserRole.DISTRICT_ANALYST,
        districtId:
          colomboDistrict.id,
      },
    });
  }

 
  const installationOne =
    createdInstallations[0];

  if (!installationOne) {
    throw new Error(
      "Installation 1 was not created."
    );
  }

  await prisma.user.create({
    data: {
      name:
        "Installation 1 Meter",
      email:
        "meter1@slsea.gov.lk",
      passwordHash,
      role: UserRole.INSTALLATION_DEVICE,
      installationId:
        installationOne.id,
    },
  });

  console.log(
    "Created demo users:"
  );

  console.log(
    "  national@slsea.gov.lk"
  );

  console.log(
    "  western@slsea.gov.lk"
  );

  console.log(
    "  colombo@slsea.gov.lk"
  );

  console.log(
    "  meter1@slsea.gov.lk"
  );

  console.log(
    "Seed completed successfully."
  );
}

main()
  .catch((error) => {
    console.error(
      "Seed failed:",
      error
    );

    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });