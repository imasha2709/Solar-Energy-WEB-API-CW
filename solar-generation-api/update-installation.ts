import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

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

async function main() {
  const updated = await prisma.solarInstallation.update({
    where: {
      id: 1,
    },
    data: {
      capacityKw: 10.00,
    },
  });

  console.log("Installation updated successfully:");
  console.log(updated);
}

main()
  .catch((error) => {
    console.error("Update failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });