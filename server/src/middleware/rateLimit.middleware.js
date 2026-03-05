import rateLimit from "express-rate-limit";

const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 180,
  standardHeaders: true,
  legacyHeaders: false,
});

export { apiRateLimiter };
