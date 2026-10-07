import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { requireScope } from "../middleware/scope.middleware";
import { requireOwnInstallation } from "../middleware/installation-auth.middleware";
import { authorizeInstallation } from "../middleware/jurisdiction.middleware";

import {
  getInstallationById,
  getLastKnownReading,
  getInstallationReadings,
  createGenerationReading,
} from "../controllers/installation.controller";

const router = Router();

router.get(
  "/:installationId",
  authenticate,
  requireScope("analyst-read"),
  authorizeInstallation,
  getInstallationById
);

router.get(
  "/:installationId/last-known-reading",
  authenticate,
  requireScope("analyst-read"),
  authorizeInstallation,
  getLastKnownReading
);

router.get(
  "/:installationId/readings",
  authenticate,
  requireScope("analyst-read"),
  authorizeInstallation,
  getInstallationReadings
);

router.post(
  "/:installationId/readings",
  authenticate,
  requireScope("installation-write"),
  requireOwnInstallation,
  createGenerationReading
);

export default router;