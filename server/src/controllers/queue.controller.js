const prisma = require("../services/prisma.service");
const { joinQueue, leaveQueue } = require("../services/queue.service");
const { setJoinRateLimit } = require("../services/redis.service");

const join = async (req, res) => {
  try {
    const { salonId, service } = req.body;
    const customerId = req.user.userId;
    const allowed = await setJoinRateLimit(customerId, 5);
    if (!allowed) return res.status(429).json({ message: "Please wait before joining again" });
    const entry = await joinQueue({
      customerId,
      salonId,
      service,
      io: req.app.get("io"),
    });
    return res.status(201).json(entry);
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const myStatus = async (req, res) => {
  try {
    const entry = await prisma.queueEntry.findFirst({
      where: {
        customerId: req.user.userId,
        status: { in: ["waiting", "called", "seated"] },
      },
      include: {
        salon: true,
        assignedChair: true,
      },
      orderBy: { joinedAt: "desc" },
    });
    if (!entry) return res.json({ active: false, message: "No active queue" });
    return res.json({ active: true, entry });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch status", error: error.message });
  }
};

const leave = async (req, res) => {
  try {
    await leaveQueue({ customerId: req.user.userId, io: req.app.get("io") });
    return res.json({ message: "Left queue" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = { join, myStatus, leave };