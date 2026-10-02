import { Request, Response } from "express";
import bcrypt from "bcryptjs";

import { prisma } from "../lib/prisma";
import { createAccessToken } from "../utils/jwt";

export async function login(
  req: Request,
  res: Response
) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      code: "MISSING_CREDENTIALS",
      message: "Email and password are required.",
      detail: "Provide both email and password.",
    });
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return res.status(401).json({
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
      detail: "The supplied credentials are not valid.",
    });
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.passwordHash
  );

  if (!passwordMatches) {
    return res.status(401).json({
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
      detail: "The supplied credentials are not valid.",
    });
  }

 const scope: string[] = [];

if (
  user.role === "NATIONAL_ANALYST" ||
  user.role === "PROVINCE_ANALYST" ||
  user.role === "DISTRICT_ANALYST"
) {
  scope.push("analyst-read");
}

if (user.role === "INSTALLATION_DEVICE") { 
  scope.push("installation-write");
}
const token = createAccessToken({
  userId: user.id,
  installationId: user.installationId ?? undefined, 
  role: user.role,
  scope,
  provinceId: user.provinceId ?? undefined,
  districtId: user.districtId ?? undefined,
});
  return res.status(200).json({
    accessToken: token,
    tokenType: "Bearer",
    expiresIn: "1h",
    scope,
  });
}