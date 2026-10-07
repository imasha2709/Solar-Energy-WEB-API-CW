import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AuthenticatedRequest } from "./auth.middleware";

export async function authorizeProvince(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required.",
      detail: "A valid authenticated user is required.",
    });
  }

  const provinceId = Number(req.params.provinceId);

  if (!Number.isInteger(provinceId)) {
    return res.status(400).json({
      code: "INVALID_PROVINCE_ID",
      message: "Province ID must be an integer.",
      detail: "The provinceId path parameter is invalid.",
    });
  }

  
  if (req.user.role === "NATIONAL_ANALYST") {
    return next();
  }

  
  if (
    req.user.role === "PROVINCE_ANALYST" &&
    req.user.provinceId === provinceId
  ) {
    return next();
  }

  return res.status(403).json({
    code: "JURISDICTION_ACCESS_DENIED",
    message: "Jurisdiction access denied.",
    detail: "You are not authorized to access this province.",
  });
}


export async function authorizeDistrict(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required.",
      detail: "A valid authenticated user is required.",
    });
  }

  const districtId = Number(req.params.districtId);

  if (!Number.isInteger(districtId)) {
    return res.status(400).json({
      code: "INVALID_DISTRICT_ID",
      message: "District ID must be an integer.",
      detail: "The districtId path parameter is invalid.",
    });
  }

  if (req.user.role === "NATIONAL_ANALYST") {
    return next();
  }

  
  if (
    req.user.role === "DISTRICT_ANALYST" &&
    req.user.districtId === districtId
  ) {
    return next();
  }

  
  if (req.user.role === "PROVINCE_ANALYST") {
    const district = await prisma.district.findUnique({
      where: { id: districtId },
      select: { provinceId: true },
    });

    if (!district) {
      return res.status(404).json({
        code: "DISTRICT_NOT_FOUND",
        message: "District not found.",
        detail: `No district exists with ID ${districtId}.`,
      });
    }

    if (district.provinceId === req.user.provinceId) {
      return next();
    }
  }

  return res.status(403).json({
    code: "JURISDICTION_ACCESS_DENIED",
    message: "Jurisdiction access denied.",
    detail: "You are not authorized to access this district.",
  });
}


export async function authorizeSubstation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required.",
      detail: "A valid authenticated user is required.",
    });
  }

  const substationId = Number(req.params.substationId);

  if (!Number.isInteger(substationId)) {
    return res.status(400).json({
      code: "INVALID_SUBSTATION_ID",
      message: "Substation ID must be an integer.",
      detail: "The substationId path parameter is invalid.",
    });
  }

  if (req.user.role === "NATIONAL_ANALYST") {
    return next();
  }

  const substation = await prisma.gridSubstation.findUnique({
    where: { id: substationId },
    select: {
      district: {
        select: {
          id: true,
          provinceId: true,
        },
      },
    },
  });

  if (!substation) {
    return res.status(404).json({
      code: "SUBSTATION_NOT_FOUND",
      message: "Substation not found.",
      detail: `No substation exists with ID ${substationId}.`,
    });
  }

  
  if (
    req.user.role === "PROVINCE_ANALYST" &&
    substation.district.provinceId === req.user.provinceId
  ) {
    return next();
  }

  
  if (
    req.user.role === "DISTRICT_ANALYST" &&
    substation.district.id === req.user.districtId
  ) {
    return next();
  }

  return res.status(403).json({
    code: "JURISDICTION_ACCESS_DENIED",
    message: "Jurisdiction access denied.",
    detail: "You are not authorized to access this substation.",
  });
}


export async function authorizeInstallation(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required.",
      detail: "A valid authenticated user is required.",
    });
  }

  const installationId = Number(req.params.installationId);

  if (!Number.isInteger(installationId)) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  if (req.user.role === "NATIONAL_ANALYST") {
    return next();
  }

  const installation = await prisma.solarInstallation.findUnique({
    where: { id: installationId },
    select: {
      substation: {
        select: {
          district: {
            select: {
              id: true,
              provinceId: true,
            },
          },
        },
      },
    },
  });

  if (!installation) {
    return res.status(404).json({
      code: "INSTALLATION_NOT_FOUND",
      message: "Installation not found.",
      detail: `No installation exists with ID ${installationId}.`,
    });
  }

  const district = installation.substation.district;

  
  if (
    req.user.role === "PROVINCE_ANALYST" &&
    district.provinceId === req.user.provinceId
  ) {
    return next();
  }

  
  if (
    req.user.role === "DISTRICT_ANALYST" &&
    district.id === req.user.districtId
  ) {
    return next();
  }

  return res.status(403).json({
    code: "JURISDICTION_ACCESS_DENIED",
    message: "Jurisdiction access denied.",
    detail: "You are not authorized to access this installation.",
  });
}