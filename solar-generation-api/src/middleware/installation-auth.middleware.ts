import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export function requireOwnInstallation(
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

  const installationId = Number(
    req.params.installationId
  );

  if (
    !Number.isInteger(installationId)
  ) {
    return res.status(400).json({
      code: "INVALID_INSTALLATION_ID",
      message: "Installation ID must be an integer.",
      detail: "The installationId path parameter is invalid.",
    });
  }

  if (
    req.user.installationId !== installationId
  ) {
    return res.status(403).json({
      code: "INSTALLATION_ACCESS_DENIED",
      message: "Installation access denied.",
      detail:
        "This device is not authorized to write readings for this installation.",
    });
  }

  next();
}