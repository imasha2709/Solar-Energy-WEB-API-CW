import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import provinceRoutes from "./routes/province.routes";
import districtRoutes from "./routes/district.routes";
import substationRoutes from "./routes/substation.routes";
import installationRoutes from "./routes/installation.routes";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    message: "Solar Generation API is running",
  });
});

app.use(
  "/api/v1/provinces",
  provinceRoutes
);

app.use(
  "/api/v1/districts",
  districtRoutes
);

app.use(
  "/api/v1/substations",
  substationRoutes
);

app.use(
  "/api/v1/installations",
  installationRoutes
);

export default app;