-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('NATIONAL_ANALYST', 'PROVINCE_ANALYST', 'DISTRICT_ANALYST');

-- CreateTable
CREATE TABLE "Province" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Province_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "provinceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GridSubstation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "districtId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GridSubstation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolarInstallation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "meterId" TEXT NOT NULL,
    "inverterId" TEXT,
    "capacityKw" DECIMAL(10,2) NOT NULL,
    "latitude" DECIMAL(9,6) NOT NULL,
    "longitude" DECIMAL(9,6) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "substationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolarInstallation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GenerationReading" (
    "id" BIGSERIAL NOT NULL,
    "installationId" INTEGER NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "powerKw" DECIMAL(10,3) NOT NULL,
    "cumulativeKwh" DECIMAL(12,3) NOT NULL,
    "voltage" DECIMAL(8,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GenerationReading_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "provinceId" INTEGER,
    "districtId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Province_name_key" ON "Province"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Province_code_key" ON "Province"("code");

-- CreateIndex
CREATE UNIQUE INDEX "District_code_key" ON "District"("code");

-- CreateIndex
CREATE INDEX "District_provinceId_idx" ON "District"("provinceId");

-- CreateIndex
CREATE UNIQUE INDEX "GridSubstation_code_key" ON "GridSubstation"("code");

-- CreateIndex
CREATE INDEX "GridSubstation_districtId_idx" ON "GridSubstation"("districtId");

-- CreateIndex
CREATE UNIQUE INDEX "SolarInstallation_meterId_key" ON "SolarInstallation"("meterId");

-- CreateIndex
CREATE UNIQUE INDEX "SolarInstallation_inverterId_key" ON "SolarInstallation"("inverterId");

-- CreateIndex
CREATE INDEX "SolarInstallation_substationId_idx" ON "SolarInstallation"("substationId");

-- CreateIndex
CREATE INDEX "GenerationReading_installationId_timestamp_idx" ON "GenerationReading"("installationId", "timestamp");

-- CreateIndex
CREATE INDEX "GenerationReading_timestamp_idx" ON "GenerationReading"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "GenerationReading_installationId_timestamp_key" ON "GenerationReading"("installationId", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_provinceId_idx" ON "User"("provinceId");

-- CreateIndex
CREATE INDEX "User_districtId_idx" ON "User"("districtId");

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GridSubstation" ADD CONSTRAINT "GridSubstation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolarInstallation" ADD CONSTRAINT "SolarInstallation_substationId_fkey" FOREIGN KEY ("substationId") REFERENCES "GridSubstation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GenerationReading" ADD CONSTRAINT "GenerationReading_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "SolarInstallation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_provinceId_fkey" FOREIGN KEY ("provinceId") REFERENCES "Province"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
