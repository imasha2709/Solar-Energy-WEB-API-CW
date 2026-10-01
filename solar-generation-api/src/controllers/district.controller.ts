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