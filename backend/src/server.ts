import express from "express";
import "dotenv/config";
import { userRouter } from "@modules/users/routes";
import { tripRouter } from "@modules/trips/routes";
import { authRouter } from "@modules/auths/routes";
import { globalErrorHandler } from "@shared/middlewares/index";
import cookieParser from "cookie-parser";
const API_PATH = "/api/v1";

const app = express();
app.use(cookieParser());
app.use(express.json({ limit: "5kb" }));
app.use(`${API_PATH}/users`, userRouter);
app.use(`${API_PATH}/trips`, tripRouter);
app.use(`${API_PATH}/auth`, authRouter);
app.use(globalErrorHandler);
const PORT = process.env.PORT || 3000;

app.get("/api/v1/health", (req, res) => {
  const healthcheck = {
    status: "UP",
    uptime: process.uptime(),
    timestamp: Date.now(),
    message: "OK",
  };

  try {
    res.status(200).send(healthcheck);
  } catch (error) {
    healthcheck.status = "DOWN";
    healthcheck.message = "Service Unavailable";
    res.status(503).send(healthcheck);
  }
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
