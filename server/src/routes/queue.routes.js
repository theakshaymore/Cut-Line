import express from "express";
import { join, myStatus, leave } from "../controllers/queue.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { isCustomer } from "../middleware/role.middleware.js";

const router = express.Router();

router.post("/join", authMiddleware, isCustomer, join);
router.get("/my-status", authMiddleware, isCustomer, myStatus);
router.delete("/leave", authMiddleware, isCustomer, leave);

export default router;