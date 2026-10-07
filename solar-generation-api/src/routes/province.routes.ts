import { Router } from "express";

import { authenticate } from "../middleware/auth.middleware";
import { requireScope } from "../middleware/scope.middleware";
import { authorizeProvince } from "../middleware/jurisdiction.middleware";

import {
  getProvinces,
  getProvinceById,
  getProvinceDistricts,
} from "../controllers/province.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  requireScope("analyst-read"),
  getProvinces
);

router.get(
  "/:provinceId",
  authenticate,
  requireScope("analyst-read"),
  authorizeProvince,
  getProvinceById
);

router.get(
  "/:provinceId/districts",
  authenticate,
  requireScope("analyst-read"),
  authorizeProvince,
  getProvinceDistricts
);

export default router;