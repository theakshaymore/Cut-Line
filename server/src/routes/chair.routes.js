const express = require("express");
const { getChairs, createChair, deleteChair } = require("../controllers/chair.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { isBarber } = require("../middleware/role.middleware");

const router = express.Router();

router.get("/", authMiddleware, isBarber, getChairs);
router.post("/", authMiddleware, isBarber, createChair);
router.delete("/:id", authMiddleware, isBarber, deleteChair);

module.exports = router;