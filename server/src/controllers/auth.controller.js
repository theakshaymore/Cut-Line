import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import prisma from "../services/prisma.service.js";
import generateToken from "../utils/generateToken.js";
import { sendBarberInviteEmail } from "../services/mail.service.js";
import { getImageKitAuthParams } from "../services/imagekit.service.js";
import { logger } from "../utils/logger.js";

const getOrCreateAppSetting = async () => {
  return prisma.appSetting.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, requireBarberInvite: false },
  });
};

const sanitizeUser = (user) => ({
  id: user.id,
  name: user.name,
  phone: user.phone,
  email: user.email,
  role: user.role,
  salonId: user.salon?.id || null,
});

const registerCustomer = async (req, res) => {
  try {
    const { name, phone, email, password, role } = req.body;
    if (role && role !== "customer") {
      return res.status(400).json({ message: "Only customer registration allowed here" });
    }
    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, phone, email, passwordHash, role: "customer" },
      include: { salon: true },
    });
    const token = generateToken({ userId: user.id, role: user.role, salonId: null });
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    return res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { salon: true },
    });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });
    if (user.isBanned) {
      return res.status(403).json({ message: "Your account is banned. Please contact support." });
    }
    const token = generateToken({
      userId: user.id,
      role: user.role,
      salonId: user.salon?.id || null,
    });
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
    logger.error("Login failed", { requestId: req.requestId, error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Login failed", error: error.message });
  }
};

const barberRegisterWithToken = async (req, res) => {
  try {
    const { token } = req.params;
    const { name, phone, email, password, salonName, address, lat, lng, avgServiceTime, imageUrl } = req.body;
    const settings = await getOrCreateAppSetting();
    let invite = null;

    if (settings.requireBarberInvite) {
      if (!token) {
        return res.status(400).json({ message: "Invite token required for barber registration" });
      }
      invite = await prisma.barberInvite.findUnique({ where: { token } });
      if (!invite || invite.usedAt) {
        return res.status(400).json({ message: "Invalid or used invite token" });
      }
      if (invite.email.toLowerCase() !== email.toLowerCase()) {
        return res.status(400).json({ message: "Invite token does not match this email" });
      }
    }

    if (!salonName && !invite?.salonName) {
      return res.status(400).json({ message: "Salon name is required" });
    }

    const existing = await prisma.user.findFirst({
      where: { OR: [{ email }, { phone }] },
    });
    if (existing) return res.status(409).json({ message: "User already exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await prisma.$transaction(async (tx) => {
      const barber = await tx.user.create({
        data: { name, phone, email, passwordHash, role: "barber" },
      });
      const salon = await tx.salon.create({
        data: {
          name: salonName || invite?.salonName,
          address,
          imageUrl: imageUrl || null,
          latitude: Number(lat),
          longitude: Number(lng),
          ownerId: barber.id,
          avgServiceTime: Number(avgServiceTime || 20),
          registrationToken: null,
          isVerified: true,
        },
      });
      if (invite) {
        await tx.barberInvite.update({
          where: { token },
          data: { usedAt: new Date() },
        });
      }
      return { barber: { ...barber, salon: { id: salon.id } }, salon };
    });

    const jwtToken = generateToken({
      userId: result.barber.id,
      role: "barber",
      salonId: result.salon.id,
    });
    return res.status(201).json({ token: jwtToken, user: sanitizeUser(result.barber) });
  } catch (error) {
    return res.status(500).json({ message: "Barber registration failed", error: error.message });
  }
};

const sendInvite = async (req, res) => {
  try {
    const { email, salonName } = req.body;
    const token = uuidv4();
    await prisma.barberInvite.create({
      data: { email, salonName, token },
    });
    await sendBarberInviteEmail({ email, token, salonName });
    return res.status(201).json({ message: "Invite sent" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to send invite", error: error.message });
  }
};

const getBarberRegistrationPolicy = async (_req, res) => {
  try {
    const settings = await getOrCreateAppSetting();
    return res.json({ requireBarberInvite: settings.requireBarberInvite });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch registration policy", error: error.message });
  }
};

const getAdminSettings = async (_req, res) => {
  try {
    const settings = await getOrCreateAppSetting();
    return res.json({ requireBarberInvite: settings.requireBarberInvite });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin settings", error: error.message });
  }
};

const updateAdminSettings = async (req, res) => {
  try {
    const { requireBarberInvite } = req.body;
    if (typeof requireBarberInvite !== "boolean") {
      return res.status(400).json({ message: "requireBarberInvite must be boolean" });
    }
    const settings = await prisma.appSetting.upsert({
      where: { id: 1 },
      update: { requireBarberInvite },
      create: { id: 1, requireBarberInvite },
    });
    return res.json({ requireBarberInvite: settings.requireBarberInvite });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update admin settings", error: error.message });
  }
};

const getImageUploadAuth = async (_req, res) => {
  try {
    if (!process.env.IMAGEKIT_PUBLIC_KEY || !process.env.IMAGEKIT_PRIVATE_KEY || !process.env.IMAGEKIT_URL_ENDPOINT) {
      return res.status(500).json({ message: "ImageKit environment is not configured" });
    }
    return res.json(getImageKitAuthParams());
  } catch (error) {
    return res.status(500).json({ message: "Failed to initialize ImageKit auth", error: error.message });
  }
};

const getAdminUsersOverview = async (_req, res) => {
  try {
    const [users, salons] = await Promise.all([
      prisma.user.findMany({
        include: {
          salon: {
            select: { id: true, name: true, address: true, imageUrl: true, isListed: true, createdAt: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.salon.findMany({
        select: { id: true, name: true, address: true, isListed: true, imageUrl: true, ownerId: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    const customers = users
      .filter((u) => u.role === "customer")
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        isBanned: u.isBanned,
        createdAt: u.createdAt,
      }));

    const barbers = users
      .filter((u) => u.role === "barber")
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        isBanned: u.isBanned,
        createdAt: u.createdAt,
        salon: u.salon,
      }));

    return res.json({ customers, barbers, salons });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin users overview", error: error.message });
  }
};

const banUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isBanned, reason } = req.body;
    if (typeof isBanned !== "boolean") {
      return res.status(400).json({ message: "isBanned must be boolean" });
    }
    const updated = await prisma.user.update({
      where: { id },
      data: {
        isBanned,
        bannedAt: isBanned ? new Date() : null,
        bannedReason: isBanned ? reason || "Banned by admin" : null,
      },
    });
    return res.json({
      message: isBanned ? "User banned successfully" : "User unbanned successfully",
      user: sanitizeUser(updated),
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update ban status", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const target = await prisma.user.findUnique({
      where: { id },
      include: { salon: true },
    });
    if (!target) return res.status(404).json({ message: "User not found" });
    if (target.role === "admin") {
      return res.status(400).json({ message: "Deleting admin is not allowed from this endpoint" });
    }

    await prisma.$transaction(async (tx) => {
      if (target.salon?.id) {
        await tx.queueEntry.deleteMany({ where: { salonId: target.salon.id } });
        await tx.chair.deleteMany({ where: { salonId: target.salon.id } });
        await tx.salon.delete({ where: { id: target.salon.id } });
      }
      await tx.notification.deleteMany({ where: { userId: id } });
      await tx.queueEntry.deleteMany({ where: { customerId: id } });
      await tx.user.delete({ where: { id } });
    });
    return res.json({ message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete user", error: error.message });
  }
};

const setSalonListing = async (req, res) => {
  try {
    const { id } = req.params;
    const { isListed } = req.body;
    if (typeof isListed !== "boolean") {
      return res.status(400).json({ message: "isListed must be boolean" });
    }
    const salon = await prisma.salon.update({
      where: { id },
      data: { isListed },
    });
    return res.json({
      message: isListed ? "Salon relisted successfully" : "Salon delisted successfully",
      salon,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update salon listing", error: error.message });
  }
};

const deleteSalon = async (req, res) => {
  try {
    const { id } = req.params;
    const salon = await prisma.salon.findUnique({ where: { id } });
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    await prisma.$transaction(async (tx) => {
      await tx.queueEntry.deleteMany({ where: { salonId: id } });
      await tx.chair.deleteMany({ where: { salonId: id } });
      await tx.salon.delete({ where: { id } });
    });
    return res.json({ message: "Salon deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete salon", error: error.message });
  }
};

export {
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
};
