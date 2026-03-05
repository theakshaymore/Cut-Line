import express from "express";
import {
  getBarberQueue,
  assignChair,
  chairDone,
  chairIdle,
  queueNoShow,
  getMySalon,
  updateSalonPhoto,
} from "../controllers/barber.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { isBarber } from "../middleware/role.middleware.js";

const router = express.Router();

router.get("/queue", authMiddleware, isBarber, getBarberQueue);
router.get("/salon", authMiddleware, isBarber, getMySalon);
router.patch("/salon/photo", authMiddleware, isBarber, updateSalonPhoto);
router.patch("/chair/:chairId/assign", authMiddleware, isBarber, assignChair);
router.patch("/chair/:chairId/done", authMiddleware, isBarber, chairDone);
router.patch("/chair/:chairId/idle", authMiddleware, isBarber, chairIdle);
router.patch("/queue/:entryId/noshow", authMiddleware, isBarber, queueNoShow);

export default router;