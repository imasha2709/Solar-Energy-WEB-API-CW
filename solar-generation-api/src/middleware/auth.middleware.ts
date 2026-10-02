import { NextFunction, Request, Response } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

export function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.status(401).json({
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required.",
      detail: "Provide a valid Bearer token in the Authorization header.",
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({
      code: "INVALID_AUTHORIZATION_HEADER",
      message: "Invalid authorization header.",
      detail: "Use the format: Bearer <token>.",
    });
  }

  try {
    const payload = verifyAccessToken(token);

    req.user = payload;

    next();
  } catch {
    return res.status(401).json({
      code: "INVALID_TOKEN",
      message: "Invalid or expired access token.",
      detail: "The supplied JWT could not be verified.",
    });
  }
}