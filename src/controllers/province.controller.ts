import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { serializeData } from "../utils/serialize";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

export async function getProvinces(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    if (!req.user) {
      return res.status(401).json({
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
        detail: "A valid authenticated user is required.",
      });
    }

    let where = {};

    if (req.user.role === "NATIONAL_ANALYST") {
      where = {};
    }

    
    else if (req.user.role === "PROVINCE_ANALYST") {
      if (!req.user.provinceId) {
        return res.status(403).json({
          code: "JURISDICTION_NOT_ASSIGNED",
          message: "No province is assigned to this user.",
          detail: "The province analyst does not have a valid province assignment.",
        });
      }

      where = {
        id: req.user.provinceId,
      };
    }

   
    else if (req.user.role === "DISTRICT_ANALYST") {
      if (!req.user.districtId) {
        return res.status(403).json({
          code: "JURISDICTION_NOT_ASSIGNED",
          message: "No district is assigned to this user.",
          detail: "The district analyst does not have a valid district assignment.",
        });
      }

      const district = await prisma.district.findUnique({
        where: {
          id: req.user.districtId,
        },
        select: {
          provinceId: true,
        },
      });

      if (!district) {
        return res.status(403).json({
          code: "JURISDICTION_NOT_ASSIGNED",
          message: "Assigned district was not found.",
          detail: "The district assigned to this user does not exist.",
        });
      }

      where = {
        id: district.provinceId,
      };
    }

    else {
      return res.status(403).json({
        code: "JURISDICTION_ACCESS_DENIED",
        message: "Jurisdiction access denied.",
        detail: "This user is not authorized to read provinces.",
      });
    }

    const provinces = await prisma.province.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return res.status(200).json(
      serializeData(provinces)
    );
  } catch (error) {
    next(error);
  }
}


export async function getProvinceById(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const provinceId = Number(req.params.provinceId);

    if (!Number.isInteger(provinceId)) {
      return res.status(400).json({
        code: "INVALID_PROVINCE_ID",
        message: "Province ID must be an integer.",
        detail: "The provinceId path parameter is invalid.",
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
        detail: `No province exists with ID ${provinceId}.`,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
        detail: "A valid authenticated user is required.",
      });
    }

    
    if (req.user.role === "NATIONAL_ANALYST") {
      return res.status(200).json(
        serializeData(province)
      );
    }

    
    if (
      req.user.role === "PROVINCE_ANALYST" &&
      req.user.provinceId === provinceId
    ) {
      return res.status(200).json(
        serializeData(province)
      );
    }

    
    if (
      req.user.role === "DISTRICT_ANALYST" &&
      req.user.districtId
    ) {
      const district = await prisma.district.findUnique({
        where: {
          id: req.user.districtId,
        },
        select: {
          provinceId: true,
        },
      });

      if (district?.provinceId === provinceId) {
        return res.status(200).json(
          serializeData(province)
        );
      }
    }

    return res.status(403).json({
      code: "JURISDICTION_ACCESS_DENIED",
      message: "Jurisdiction access denied.",
      detail: "You are not authorized to access this province.",
    });
  } catch (error) {
    next(error);
  }
}


export async function getProvinceDistricts(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const provinceId = Number(req.params.provinceId);

    if (!Number.isInteger(provinceId)) {
      return res.status(400).json({
        code: "INVALID_PROVINCE_ID",
        message: "Province ID must be an integer.",
        detail: "The provinceId path parameter is invalid.",
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
        detail: `No province exists with ID ${provinceId}.`,
      });
    }

    if (!req.user) {
      return res.status(401).json({
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
        detail: "A valid authenticated user is required.",
      });
    }

    
    if (req.user.role === "NATIONAL_ANALYST") {
      const districts = await prisma.district.findMany({
        where: {
          provinceId,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json(
        serializeData(districts)
      );
    }

   
    if (
      req.user.role === "PROVINCE_ANALYST" &&
      req.user.provinceId === provinceId
    ) {
      const districts = await prisma.district.findMany({
        where: {
          provinceId,
        },
        orderBy: {
          name: "asc",
        },
      });

      return res.status(200).json(
        serializeData(districts)
      );
    }

   
    if (
      req.user.role === "DISTRICT_ANALYST" &&
      req.user.districtId
    ) {
      const district = await prisma.district.findUnique({
        where: {
          id: req.user.districtId,
        },
        select: {
          provinceId: true,
        },
      });

      if (district?.provinceId === provinceId) {
        const districts = await prisma.district.findMany({
          where: {
            id: req.user.districtId,
          },
          orderBy: {
            name: "asc",
          },
        });

        return res.status(200).json(
          serializeData(districts)
        );
      }
    }

    return res.status(403).json({
      code: "JURISDICTION_ACCESS_DENIED",
      message: "Jurisdiction access denied.",
      detail: "You are not authorized to access this province.",
    });
  } catch (error) {
    next(error);
  }
}