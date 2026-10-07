import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import swaggerUi from "swagger-ui-express";
import { swaggerDocument } from "./swagger";
import authRoutes from "./routes/auth.routes";
import provinceRoutes from "./routes/province.routes";
import districtRoutes from "./routes/district.routes";
import substationRoutes from "./routes/substation.routes";
import installationRoutes from "./routes/installation.routes";

dotenv.config();

const app = express();

app.set("etag", true);
app.use(cors());
app.use(express.json());


app.use("/api/v1/auth", authRoutes);

app.use("/api/v1/provinces", provinceRoutes);

app.use("/api/v1/districts", districtRoutes);

app.use("/api/v1/substations", substationRoutes);

app.use("/api/v1/installations", installationRoutes);

app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument)
);

export default app;