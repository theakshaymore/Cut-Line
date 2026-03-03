const express = require("express");
const {
  getBarberQueue,
  assignChair,
  chairDone,
  chairIdle,
  queueNoShow,
  getMySalon,
  updateSalonPhoto,
} = require("../controllers/barber.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { isBarber } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/queue", authMiddleware, isBarber, getBarberQueue);
router.get("/salon", authMiddleware, isBarber, getMySalon);
router.patch("/salon/photo", authMiddleware, isBarber, updateSalonPhoto);
router.patch("/chair/:chairId/assign", authMiddleware, isBarber, assignChair);
router.patch("/chair/:chairId/done", authMiddleware, isBarber, chairDone);
router.patch("/chair/:chairId/idle", authMiddleware, isBarber, chairIdle);
router.patch("/queue/:entryId/noshow", authMiddleware, isBarber, queueNoShow);

module.exports = router;
