import express from "express";
import { getChairs, createChair, deleteChair } from "../controllers/chair.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { isBarber } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/", authMiddleware, isBarber, getChairs);
router.post("/", authMiddleware, isBarber, createChair);
router.delete("/:id", authMiddleware, isBarber, deleteChair);

export default router;