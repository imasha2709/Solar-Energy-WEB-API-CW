import { Router } from "express";

import {
  getDistrictById,
  getDistrictSubstations,
} from "../controllers/district.controller";

const router = Router();

router.get("/:districtId", getDistrictById);

router.get(
  "/:districtId/substations",
  getDistrictSubstations
);

export default router;