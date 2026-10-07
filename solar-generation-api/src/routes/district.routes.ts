import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireScope } from "../middleware/scope.middleware";
import { authorizeDistrict } from "../middleware/jurisdiction.middleware";

import {
  getDistrictById,
  getDistrictSubstations,
} from "../controllers/district.controller";

const router = Router();

router.get(
  "/:districtId",
  authenticate,
  requireScope("analyst-read"),
  authorizeDistrict,
  getDistrictById
);

router.get(
  "/:districtId/substations",
  authenticate,
  requireScope("analyst-read"),
  authorizeDistrict,
  getDistrictSubstations
);

export default router;