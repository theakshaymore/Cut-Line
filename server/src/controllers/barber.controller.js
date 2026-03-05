import prisma from "../services/prisma.service.js";
import {
  assignNextToChair,
  markChairDone,
  markChairIdle,
  markNoShow,
} from "../services/queue.service.js";

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

const getMySalon = async (req, res) => {
  try {
    const salon = await prisma.salon.findUnique({
      where: { id: req.user.salonId },
      include: { chairs: true },
    });
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    return res.json(salon);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch salon", error: error.message });
  }
};

const updateSalonPhoto = async (req, res) => {
  try {
    const { imageUrl } = req.body;
    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({ message: "imageUrl is required" });
    }
    const salon = await prisma.salon.update({
      where: { id: req.user.salonId },
      data: { imageUrl },
    });
    return res.json({ message: "Salon image updated", salon });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update salon image", error: error.message });
  }
};

export {
  getBarberQueue,
  assignChair,
  chairDone,
  chairIdle,
  queueNoShow,
  getMySalon,
  updateSalonPhoto,
};
