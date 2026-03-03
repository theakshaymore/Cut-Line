const express = require("express");
const { join, myStatus, leave } = require("../controllers/queue.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { isCustomer } = require("../middleware/role.middleware");

const router = express.Router();

router.post("/join", authMiddleware, isCustomer, join);
router.get("/my-status", authMiddleware, isCustomer, myStatus);
router.delete("/leave", authMiddleware, isCustomer, leave);

module.exports = router;