import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// TEMPORARY: replace with the Prisma string (starts with postgres://, contains pooled.db.prisma.io)
const HOSTED_URL = "postgres://e559a901095161d2b010a3ae2266e95c2801d8973f29cc35f8a09dbf27bd4139:sk_J1MonEao8esKe7IH8zpcx@pooled.db.prisma.io:5432/postgres?sslmode=require";

const raw = process.env.VERCEL ? HOSTED_URL : process.env.DATABASE_URL;
const connectionString = (raw ?? "").trim().replace(/^["']|["']$/g, "");

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
export default prisma;