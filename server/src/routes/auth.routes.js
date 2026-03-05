import express from "express";
import {
  registerCustomer,
  login,
  barberRegisterWithToken,
  sendInvite,
  getBarberRegistrationPolicy,
  getAdminSettings,
  updateAdminSettings,
  getImageUploadAuth,
  getAdminUsersOverview,
  banUser,
  deleteUser,
  setSalonListing,
  deleteSalon,
} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/role.middleware.js";

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
router.patch("/admin/users/:id/ban", authMiddleware, isAdmin, banUser);
router.delete("/admin/users/:id", authMiddleware, isAdmin, deleteUser);
router.patch("/admin/salons/:id/listing", authMiddleware, isAdmin, setSalonListing);
router.delete("/admin/salons/:id", authMiddleware, isAdmin, deleteSalon);

export default router;
