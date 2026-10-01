import { Router } from "express";

import {
  getSubstationById,
  getSubstationInstallations,
} from "../controllers/substation.controller";

const router = Router();

router.get(
  "/:substationId",
  getSubstationById
);

router.get(
  "/:substationId/installations",
  getSubstationInstallations
);

export default router;