import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireScope } from "../middleware/scope.middleware";
import { authorizeSubstation } from "../middleware/jurisdiction.middleware";

import {
  getSubstationById,
  getSubstationInstallations,
} from "../controllers/substation.controller";

const router = Router();

router.get(
  "/:substationId",
  authenticate,
  requireScope("analyst-read"),
  authorizeSubstation,
  getSubstationById
);

router.get(
  "/:substationId/installations",
  authenticate,
  requireScope("analyst-read"),
  authorizeSubstation,
  getSubstationInstallations
);

export default router;