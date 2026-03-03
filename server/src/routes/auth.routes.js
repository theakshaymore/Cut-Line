const express = require("express");
const {
  registerCustomer,
  login,
  barberRegisterWithToken,
  sendInvite,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", login);
router.post("/barber-register/:token", barberRegisterWithToken);
router.post("/admin/send-invite", authMiddleware, isAdmin, sendInvite);

module.exports = router;