import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { requireScope } from "../middleware/scope.middleware";
import { requireOwnInstallation } from "../middleware/installation-auth.middleware";

import {
  getInstallationById,
  getLastKnownReading,
  getInstallationReadings,
  createGenerationReading,
} from "../controllers/installation.controller";

const router = Router();

// Get installation details
router.get(
  "/:installationId",
  authenticate,
  requireScope("analyst-read"),
  getInstallationById
);

// Get last-known reading
router.get(
  "/:installationId/last-known-reading",
  authenticate,
  requireScope("analyst-read"),
  getLastKnownReading
);

// Get installation readings
router.get(
  "/:installationId/readings",
  authenticate,
  requireScope("analyst-read"),
  getInstallationReadings
);

// Device submits a reading
router.post(
  "/:installationId/readings",
  authenticate,
  requireScope("installation-write"),
  requireOwnInstallation,
  createGenerationReading
);

export default router;