const express = require("express");
const {
  registerCustomer,
  login,
  barberRegisterWithToken,
  sendInvite,
  getBarberRegistrationPolicy,
  getAdminSettings,
  updateAdminSettings,
  getImageUploadAuth,
  getAdminUsersOverview,
} = require("../controllers/auth.controller");
const authMiddleware = require("../middleware/auth.middleware");
const { isAdmin } = require("../middleware/role.middleware");

const router = express.Router();

router.post("/register", registerCustomer);
router.post("/login", login);
router.get("/image-upload-auth", getImageUploadAuth);
router.get("/barber-registration-policy", getBarberRegistrationPolicy);
router.post("/barber-register", barberRegisterWithToken);
router.post("/barber-register/:token", barberRegisterWithToken);
router.post("/admin/send-invite", authMiddleware, isAdmin, sendInvite);
router.get("/admin/settings", authMiddleware, isAdmin, getAdminSettings);
router.patch("/admin/settings", authMiddleware, isAdmin, updateAdminSettings);
router.get("/admin/users-overview", authMiddleware, isAdmin, getAdminUsersOverview);

module.exports = router;
