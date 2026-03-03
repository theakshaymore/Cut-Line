const prisma = require("../services/prisma.service");
const {
  assignNextToChair,
  markChairDone,
  markChairIdle,
  markNoShow,
} = require("../services/queue.service");

const getBarberQueue = async (req, res) => {
  try {
    const entries = await prisma.queueEntry.findMany({
      where: {
        salonId: req.user.salonId,
        status: { in: ["waiting", "called", "seated"] },
      },
      orderBy: [{ status: "asc" }, { position: "asc" }],
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        assignedChair: true,
      },
    });
    return res.json(entries);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch barber queue", error: error.message });
  }
};

const assignChair = async (req, res) => {
  try {
    const data = await assignNextToChair({
      chairId: req.params.chairId,
      barberSalonId: req.user.salonId,
      io: req.app.get("io"),
    });
    return res.json({ message: "Assigned next customer", data });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const chairDone = async (req, res) => {
  try {
    await markChairDone({
      chairId: req.params.chairId,
      barberSalonId: req.user.salonId,
      io: req.app.get("io"),
    });
    return res.json({ message: "Chair marked done" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const chairIdle = async (req, res) => {
  try {
    await markChairIdle({
      chairId: req.params.chairId,
      barberSalonId: req.user.salonId,
      io: req.app.get("io"),
    });
    return res.json({ message: "Chair reset to idle" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

const queueNoShow = async (req, res) => {
  try {
    await markNoShow({
      entryId: req.params.entryId,
      barberSalonId: req.user.salonId,
      io: req.app.get("io"),
    });
    return res.json({ message: "Customer marked no-show" });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

module.exports = {
  getBarberQueue,
  assignChair,
  chairDone,
  chairIdle,
  queueNoShow,
};