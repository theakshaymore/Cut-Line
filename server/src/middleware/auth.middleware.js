import jwt from "jsonwebtoken";
import prisma from "../services/prisma.service.js";
import { logger } from "../utils/logger.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { salon: true },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }
    if (user.isBanned) {
      logger.warn("Blocked banned user from auth middleware", { userId: user.id, requestId: req.requestId });
      return res.status(403).json({ message: "Your account is banned. Please contact support." });
    }
    req.user = {
      userId: user.id,
      role: user.role,
      salonId: user.salon?.id || null,
      email: user.email,
    };
    return next();
  } catch (error) {
    logger.error("Auth middleware failed", { requestId: req.requestId, error: error.message, stack: error.stack });
    return res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

export default authMiddleware;
