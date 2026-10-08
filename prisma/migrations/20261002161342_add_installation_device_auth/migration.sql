-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'INSTALLATION_DEVICE';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "installationId" INTEGER;

-- CreateIndex
CREATE INDEX "User_installationId_idx" ON "User"("installationId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_installationId_fkey" FOREIGN KEY ("installationId") REFERENCES "SolarInstallation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
