import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { serializeData } from "../utils/serialize";

export async function getSubstationById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const substationId = Number(
      req.params.substationId
    );

    if (!Number.isInteger(substationId)) {
      return res.status(400).json({
        code: "INVALID_SUBSTATION_ID",
        message: "Substation ID must be an integer.",
        detail: "The substationId path parameter is invalid."
      });
    }

    const substation =
      await prisma.gridSubstation.findUnique({
        where: {
          id: substationId,
        },
      });

    if (!substation) {
      return res.status(404).json({
        code: "SUBSTATION_NOT_FOUND",
        message: "Grid substation not found.",
        detail: `No grid substation exists with ID ${substationId}.`
      });
    }

    res.status(200).json(
      serializeData(substation)
    );
  } catch (error) {
    next(error);
  }
}

export async function getSubstationInstallations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const substationId = Number(
      req.params.substationId
    );

    if (!Number.isInteger(substationId)) {
      return res.status(400).json({
        code: "INVALID_SUBSTATION_ID",
        message: "Substation ID must be an integer.",
        detail: "The substationId path parameter is invalid."
      });
    }

    const substation =
      await prisma.gridSubstation.findUnique({
        where: {
          id: substationId,
        },
      });

    if (!substation) {
      return res.status(404).json({
        code: "SUBSTATION_NOT_FOUND",
        message: "Grid substation not found.",
        detail: `No grid substation exists with ID ${substationId}.`
      });
    }

    const installations =
      await prisma.solarInstallation.findMany({
        where: {
          substationId,
        },
        orderBy: {
          name: "asc",
        },
      });

    res.status(200).json(
      serializeData(installations)
    );
  } catch (error) {
    next(error);
  }
}