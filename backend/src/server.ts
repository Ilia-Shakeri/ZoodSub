import "./config/env";
import express from "express";
import cors from "cors";
import { env } from "./config/env";
import routes from "./routes";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

app.get("/health", (_req, res) => res.json({ status: "ok" }));
app.use("/api", routes);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`ZoodSub backend running on port ${env.PORT}`);
});

export default app;
