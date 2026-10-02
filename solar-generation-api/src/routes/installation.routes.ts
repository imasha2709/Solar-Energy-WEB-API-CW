import { Router } from "express";

import {
  getInstallationById,
  getLastKnownReading,
  getInstallationReadings,
  createGenerationReading,
} from "../controllers/installation.controller";

const router = Router();

router.get(
  "/:installationId",
  getInstallationById
);

router.get(
  "/:installationId/last-known-reading",
  getLastKnownReading
);

router.get(
  "/:installationId/readings",
  getInstallationReadings
);

router.post(
  "/:installationId/readings",
  createGenerationReading
);

export default router;