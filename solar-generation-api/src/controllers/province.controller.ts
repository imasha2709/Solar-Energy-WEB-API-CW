import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { serializeData } from "../utils/serialize";

export async function getProvinces(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const provinces = await prisma.province.findMany({
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(
      serializeData(provinces)
    );
  } catch (error) {
    next(error);
  }
}

export async function getProvinceById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const provinceId = Number(req.params.provinceId);

    if (!Number.isInteger(provinceId)) {
      return res.status(400).json({
        code: "INVALID_PROVINCE_ID",
        message: "Province ID must be an integer.",
        detail: "The provinceId path parameter is invalid."
      });
    }

    const province = await prisma.province.findUnique({
      where: {
        id: provinceId,
      },
    });

    if (!province) {
      return res.status(404).json({
        code: "PROVINCE_NOT_FOUND",
        message: "Province not found.",
        detail: `No province exists with ID ${provinceId}.`
      });
    }

    res.status(200).json(
      serializeData(province)
    );
  } catch (error) {
    next(error);
  }
}

export async function getProvinceDistricts(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const provinceId = Number(req.params.provinceId);

    if (!Number.isInteger(provinceId)) {
      return res.status(400).json({
        code: "INVALID_PROVINCE_ID",
        message: "Province ID must be an integer.",
        detail: "The provinceId path parameter is invalid."
      });
    }

    const province = await prisma.province.findUnique({
      where: {
        id: provinceId,
      },
    });

    if (!province) {
      return res.status(404).json({
        code: "PROVINCE_NOT_FOUND",
        message: "Province not found.",
        detail: `No province exists with ID ${provinceId}.`
      });
    }

    const districts = await prisma.district.findMany({
      where: {
        provinceId,
      },
      orderBy: {
        name: "asc",
      },
    });

    res.status(200).json(
      serializeData(districts)
    );
  } catch (error) {
    next(error);
  }
}