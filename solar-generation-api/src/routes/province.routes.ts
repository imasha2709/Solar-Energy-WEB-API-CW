import { Router } from "express";

import {
  getProvinces,
  getProvinceById,
  getProvinceDistricts,
} from "../controllers/province.controller";

const router = Router();

router.get("/", getProvinces);

router.get("/:provinceId", getProvinceById);

router.get(
  "/:provinceId/districts",
  getProvinceDistricts
);

export default router;