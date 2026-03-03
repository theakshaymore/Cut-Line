const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const prisma = require("../services/prisma.service");
const generateToken = require("../utils/generateToken");
const { sendBarberInviteEmail } = require("../services/mail.service");
const { getImageKitAuthParams } = require("../services/imagekit.service");

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
    const token = generateToken({
      userId: user.id,
      role: user.role,
      salonId: user.salon?.id || null,
    });
    return res.json({ token, user: sanitizeUser(user) });
  } catch (error) {
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
    const users = await prisma.user.findMany({
      include: {
        salon: {
          select: { id: true, name: true, address: true, imageUrl: true, createdAt: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const customers = users
      .filter((u) => u.role === "customer")
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt,
      }));

    const barbers = users
      .filter((u) => u.role === "barber")
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        phone: u.phone,
        createdAt: u.createdAt,
        salon: u.salon,
      }));

    return res.json({ customers, barbers });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch admin users overview", error: error.message });
  }
};

module.exports = {
  registerCustomer,
  login,
  barberRegisterWithToken,
  sendInvite,
  getBarberRegistrationPolicy,
  getAdminSettings,
  updateAdminSettings,
  getImageUploadAuth,
  getAdminUsersOverview,
};
