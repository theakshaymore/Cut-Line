import express from "express";
import { getNearbySalons, getSalonDetail } from "../controllers/salon.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, getNearbySalons);
router.get("/:id", authMiddleware, getSalonDetail);

export default router;