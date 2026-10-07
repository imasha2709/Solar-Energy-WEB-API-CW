import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { serializeData } from "../utils/serialize";


export async function getDistrictById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const districtId = Number(req.params.districtId);

    if (!Number.isInteger(districtId)) {
      return res.status(400).json({
        code: "INVALID_DISTRICT_ID",
        message: "District ID must be an integer.",
        detail: "The districtId path parameter is invalid."
      });
    }

    const district = await prisma.district.findUnique({
      where: {
        id: districtId,
      },
    });

    if (!district) {
      return res.status(404).json({
        code: "DISTRICT_NOT_FOUND",
        message: "District not found.",
        detail: `No district exists with ID ${districtId}.`
      });
    }

    res.status(200).json(
      serializeData(district)
    );
  } catch (error) {
    next(error);
  }
}

export async function getDistrictSubstations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const districtId = Number(req.params.districtId);

    if (!Number.isInteger(districtId)) {
      return res.status(400).json({
        code: "INVALID_DISTRICT_ID",
        message: "District ID must be an integer.",
        detail: "The districtId path parameter is invalid."
      });
    }

    const district = await prisma.district.findUnique({
      where: {
        id: districtId,
      },
    });

    if (!district) {
      return res.status(404).json({
        code: "DISTRICT_NOT_FOUND",
        message: "District not found.",
        detail: `No district exists with ID ${districtId}.`
      });
    }

    const substations =
      await prisma.gridSubstation.findMany({
        where: {
          districtId,
        },
        orderBy: {
          name: "asc",
        },
      });

    res.status(200).json(
      serializeData(substations)
    );
  } catch (error) {
    next(error);
  }
}

export async function getDistrictGenerationSummary(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const districtId = Number(req.params.districtId);

    if (!Number.isInteger(districtId)) {
      return res.status(400).json({
        code: "INVALID_DISTRICT_ID",
        message: "District ID must be an integer.",
        detail: "The districtId path parameter is invalid.",
      });
    }

    const district = await prisma.district.findUnique({
      where: {
        id: districtId,
      },
      select: {
        id: true,
        name: true,
        code: true,
        province: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
    });

    if (!district) {
      return res.status(404).json({
        code: "DISTRICT_NOT_FOUND",
        message: "District not found.",
        detail: `No district exists with ID ${districtId}.`,
      });
    }

    const installations =
      await prisma.solarInstallation.findMany({
        where: {
          substation: {
            districtId,
          },
        },
        select: {
          id: true,
          capacityKw: true,
          active: true,
        },
      });

    const installationIds = installations.map(
      (installation) => installation.id
    );

    const readingCount =
      installationIds.length === 0
        ? 0
        : await prisma.generationReading.count({
            where: {
              installationId: {
                in: installationIds,
              },
            },
          });

    const latestReadings =
      installationIds.length === 0
        ? []
        : await prisma.generationReading.findMany({
            where: {
              installationId: {
                in: installationIds,
              },
            },
            orderBy: {
              timestamp: "desc",
            },
            take: installationIds.length,
          });

    const totalCapacityKw = installations.reduce(
      (total, installation) =>
        total + Number(installation.capacityKw),
      0
    );

    const activeInstallations = installations.filter(
      (installation) => installation.active
    ).length;

    const latestPowerKw = latestReadings.reduce(
      (total, reading) =>
        total + Number(reading.powerKw),
      0
    );

    const averageLatestPowerKw =
      latestReadings.length > 0
        ? latestPowerKw / latestReadings.length
        : 0;

    const latestTimestamp =
      latestReadings.length > 0
        ? latestReadings[0].timestamp
        : null;

    const summary = {
      district: {
        id: district.id,
        name: district.name,
        code: district.code,
      },

      province: district.province,

      installations: {
        total: installations.length,
        active: activeInstallations,
        inactive:
          installations.length - activeInstallations,
      },

      capacity: {
        totalKw: Number(totalCapacityKw.toFixed(2)),
      },

      readings: {
        total: readingCount,
      },

      latestGeneration: {
        totalPowerKw: Number(
          latestPowerKw.toFixed(3)
        ),
        averagePowerKw: Number(
          averageLatestPowerKw.toFixed(3)
        ),
        timestamp: latestTimestamp,
      },
    };

    return res.status(200).json(
      serializeData(summary)
    );
  } catch (error) {
    next(error);
  }
}