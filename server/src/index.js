import dotenv from "dotenv";
import express from "express";
import http from "http";
import cors from "cors";
import helmet from "helmet";
import { Server } from "socket.io";
import authRoutes from "./routes/auth.routes.js";
import salonRoutes from "./routes/salon.routes.js";
import queueRoutes from "./routes/queue.routes.js";
import chairRoutes from "./routes/chair.routes.js";
import barberRoutes from "./routes/barber.routes.js";
import { apiRateLimiter } from "./middleware/rateLimit.middleware.js";
import requestLogger from "./middleware/requestLogger.middleware.js";
import registerSocketHandlers from "./socket/socket.handler.js";
import { initRedis } from "./services/redis.service.js";
import { hydrateRedisFromPostgres } from "./services/queue.service.js";
import { logger } from "./utils/logger.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH", "DELETE"],
  },
});

app.set("io", io);
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(apiRateLimiter);
app.use(requestLogger);

app.get("/health", (_req, res) => res.json({ status: "ok" }));

app.use("/api/auth", authRoutes);
app.use("/api/salons", salonRoutes);
app.use("/api/queue", queueRoutes);
app.use("/api/barber/chairs", chairRoutes);
app.use("/api/barber", barberRoutes);

app.use((err, req, res, _next) => {
  logger.error("Unhandled express error", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    error: err.message,
    stack: err.stack,
  });
  res.status(500).json({ message: "Internal server error", requestId: req.requestId });
});

registerSocketHandlers(io);

const start = async () => {
  try {
    await initRedis();
    await hydrateRedisFromPostgres();
    const port = Number(process.env.PORT || 5000);
    server.listen(port, () => {
      logger.info("NextCut server started", { port });
    });
  } catch (error) {
    logger.error("Server startup failed", { error: error.message, stack: error.stack });
    process.exit(1);
  }
};

start();

process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled promise rejection", { reason: String(reason) });
});

process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error: error.message, stack: error.stack });
});
