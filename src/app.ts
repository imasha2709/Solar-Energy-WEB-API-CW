import express from "express";
import cors from "cors";
import dotenv from "dotenv";
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

app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Solar Generation API is running",
    documentation: "/api-docs",
    version: "1.0.0",
  });
});

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/provinces", provinceRoutes);
app.use("/api/v1/districts", districtRoutes);
app.use("/api/v1/substations", substationRoutes);
app.use("/api/v1/installations", installationRoutes);

app.get("/api-docs.json", (_req, res) => {
  res.json(swaggerDocument);
});

app.get("/api-docs", (_req, res) => {
  res.type("html").send(`<!DOCTYPE html>
<html>
  <head>
    <title>Solar Generation API Docs</title>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.onload = function () {
        window.ui = SwaggerUIBundle({
          url: "/api-docs.json",
          dom_id: "#swagger-ui"
        });
      };
    </script>
  </body>
</html>`);
});

export default app;