import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { serializeData } from "../utils/serialize";

export async function getInstallationById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const installationId = Number(
      req.params.installationId
    );

    if (!Number.isInteger(installationId)) {
      return res.status(400).json({
        code: "INVALID_INSTALLATION_ID",
        message: "Installation ID must be an integer.",
        detail: "The installationId path parameter is invalid."
      });
    }

    const installation =
      await prisma.solarInstallation.findUnique({
        where: {
          id: installationId,
        },
        include: {
          substation: {
            include: {
              district: {
                include: {
                  province: true,
                },
              },
            },
          },
        },
      });

    if (!installation) {
      return res.status(404).json({
        code: "INSTALLATION_NOT_FOUND",
        message: "Solar installation not found.",
        detail: `No installation exists with ID ${installationId}.`
      });
    }

    res.status(200).json(
      serializeData(installation)
    );
  } catch (error) {
    next(error);
  }
}

export async function getLastKnownReading(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const installationId = Number(
      req.params.installationId
    );

    if (!Number.isInteger(installationId)) {
      return res.status(400).json({
        code: "INVALID_INSTALLATION_ID",
        message: "Installation ID must be an integer.",
        detail: "The installationId path parameter is invalid."
      });
    }

    const installation =
      await prisma.solarInstallation.findUnique({
        where: {
          id: installationId,
        },
      });

    if (!installation) {
      return res.status(404).json({
        code: "INSTALLATION_NOT_FOUND",
        message: "Solar installation not found.",
        detail: `No installation exists with ID ${installationId}.`
      });
    }

    const reading =
      await prisma.generationReading.findFirst({
        where: {
          installationId,
        },
        orderBy: {
          timestamp: "desc",
        },
      });

    if (!reading) {
      return res.status(404).json({
        code: "READING_NOT_FOUND",
        message: "No generation reading exists.",
        detail: `Installation ${installationId} has no generation readings.`
      });
    }

    res.status(200).json(
      serializeData(reading)
    );
  } catch (error) {
    next(error);
  }
}

export async function getInstallationReadings(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const installationId = Number(
      req.params.installationId
    );

    if (!Number.isInteger(installationId)) {
      return res.status(400).json({
        code: "INVALID_INSTALLATION_ID",
        message: "Installation ID must be an integer.",
        detail: "The installationId path parameter is invalid."
      });
    }

    const installation =
      await prisma.solarInstallation.findUnique({
        where: {
          id: installationId,
        },
      });

    if (!installation) {
      return res.status(404).json({
        code: "INSTALLATION_NOT_FOUND",
        message: "Solar installation not found.",
        detail: `No installation exists with ID ${installationId}.`
      });
    }

    const readings =
      await prisma.generationReading.findMany({
        where: {
          installationId,
        },
        orderBy: {
          timestamp: "asc",
        },
      });

    res.status(200).json(
      serializeData(readings)
    );
  } catch (error) {
    next(error);
  }
}