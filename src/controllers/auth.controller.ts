import "dotenv/config";
import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../utils/jwt";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

function getScopes(role: string): string[] {
  switch (role) {
    case "NATIONAL_ANALYST":
    case "PROVINCE_ANALYST":
    case "DISTRICT_ANALYST":
      return ["analyst-read"];

    case "INSTALLATION_DEVICE":
      return ["installation-write"];

    default:
      return [];
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: "MISSING_CREDENTIALS",
        message: "Email and password are required.",
        detail: "Provide both email and password.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password.",
        detail: "The supplied credentials are incorrect.",
      });
    }

    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return res.status(401).json({
        code: "INVALID_CREDENTIALS",
        message: "Invalid email or password.",
        detail: "The supplied credentials are incorrect.",
      });
    }

    const scopes = getScopes(user.role);

    const token = createAccessToken({
      userId: user.id,
      role: user.role,
      scope: scopes,
      provinceId: user.provinceId ?? undefined,
      districtId: user.districtId ?? undefined,
      installationId: user.installationId ?? undefined,
    });

    return res.status(200).json({
      accessToken: token,
      tokenType: "Bearer",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        provinceId: user.provinceId,
        districtId: user.districtId,
        installationId: user.installationId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      code: "INTERNAL_SERVER_ERROR",
      message: "An internal server error occurred.",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}