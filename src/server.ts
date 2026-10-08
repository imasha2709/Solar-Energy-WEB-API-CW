import app from "./app";
import installationRoutes from "./routes/installation.routes";

app.use(
  "/api/v1/installations",
  installationRoutes
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(
    `Solar Generation API running on port ${PORT}`
  );
});