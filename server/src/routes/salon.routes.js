const express = require("express");
const { getNearbySalons, getSalonDetail } = require("../controllers/salon.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, getNearbySalons);
router.get("/:id", authMiddleware, getSalonDetail);

module.exports = router;