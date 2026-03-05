import prisma from "../services/prisma.service.js";

const getChairs = async (req, res) => {
  try {
    const chairs = await prisma.chair.findMany({
      where: { salonId: req.user.salonId },
      include: {
        currentEntry: {
          include: { customer: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    });
    return res.json(chairs);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch chairs", error: error.message });
  }
};

const createChair = async (req, res) => {
  try {
    const { label } = req.body;
    const chair = await prisma.chair.create({
      data: {
        salonId: req.user.salonId,
        label,
      },
    });
    return res.status(201).json(chair);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create chair", error: error.message });
  }
};

const deleteChair = async (req, res) => {
  try {
    const { id } = req.params;
    const chair = await prisma.chair.findUnique({ where: { id } });
    if (!chair || chair.salonId !== req.user.salonId) {
      return res.status(404).json({ message: "Chair not found" });
    }
    if (chair.currentQueueEntryId) {
      return res.status(400).json({ message: "Cannot delete occupied chair" });
    }
    await prisma.chair.delete({ where: { id } });
    return res.json({ message: "Chair deleted" });
  } catch (error) {
    return res.status(400).json({ message: "Failed to delete chair", error: error.message });
  }
};

export { getChairs, createChair, deleteChair };
