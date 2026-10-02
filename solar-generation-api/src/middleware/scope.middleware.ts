import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.middleware";

export function requireScope(requiredScope: string) {
  return (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ) => {
    if (!req.user) {
      return res.status(401).json({
        code: "AUTHENTICATION_REQUIRED",
        message: "Authentication is required.",
        detail: "A valid authenticated user is required.",
      });
    }

    if (!req.user.scope.includes(requiredScope)) {
      return res.status(403).json({
        code: "INSUFFICIENT_SCOPE",
        message: "Insufficient permission.",
        detail: `The required scope '${requiredScope}' is missing.`,
      });
    }

    next();
  };
}