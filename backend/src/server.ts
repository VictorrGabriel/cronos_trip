import express from "express";
import "dotenv/config";

const app = express();

const PORT = process.env.PROT || 3000;

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
    healthcheck.message = "Service Unavailable"
    res.status(503).send(healthcheck);
  }
});

app.listen(PORT, () => console.log(`Server is running on ${PORT}`));
