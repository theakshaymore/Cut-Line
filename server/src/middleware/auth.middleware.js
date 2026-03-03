const jwt = require("jsonwebtoken");
const prisma = require("../services/prisma.service");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Missing token" });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { salon: true },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }
    req.user = {
      userId: user.id,
      role: user.role,
      salonId: user.salon?.id || null,
      email: user.email,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized", error: error.message });
  }
};

module.exports = authMiddleware;
