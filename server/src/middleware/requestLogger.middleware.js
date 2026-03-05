import { randomUUID } from "crypto";
import { logger } from "../utils/logger.js";

const requestLogger = (req, res, next) => {
  const requestId = randomUUID();
  const startedAt = Date.now();
  req.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  logger.info("Incoming request", {
    requestId,
    method: req.method,
    path: req.originalUrl,
    ip: req.ip,
  });

  res.on("finish", () => {
    logger.info("Request completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Date.now() - startedAt,
    });
  });
  next();
};

export default requestLogger;
