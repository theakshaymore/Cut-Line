const prisma = require("../services/prisma.service");
const { getEstimatedWait } = require("../services/queue.service");

const toRad = (v) => (v * Math.PI) / 180;
const distanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getNearbySalons = async (req, res) => {
  try {
    const lat = Number(req.query.lat);
    const lng = Number(req.query.lng);
    const radius = Number(req.query.radius || 5);

    const salons = await prisma.salon.findMany({
      where: { isVerified: true },
      include: {
        chairs: true,
        queueEntries: {
          where: { status: "waiting" },
        },
      },
    });

    const withDistance = await Promise.all(
      salons
        .map((salon) => {
          const distance = distanceKm(lat, lng, salon.latitude, salon.longitude);
          return { salon, distance };
        })
        .filter((x) => x.distance <= radius)
        .map(async ({ salon, distance }) => {
          const estimatedWait = await getEstimatedWait(salon.id);
          return {
            id: salon.id,
            name: salon.name,
            address: salon.address,
            imageUrl: salon.imageUrl,
            latitude: salon.latitude,
            longitude: salon.longitude,
            distanceKm: Number(distance.toFixed(2)),
            queueCount: salon.queueEntries.length,
            estimatedWait,
            availableChairs: salon.chairs.filter((c) => c.status === "idle").length,
            rating: 4.7,
          };
        })
    );

    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);
    return res.json(withDistance);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch salons", error: error.message });
  }
};

const getSalonDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const salon = await prisma.salon.findUnique({
      where: { id },
      include: {
        chairs: {
          include: {
            currentEntry: {
              include: { customer: { select: { id: true, name: true } } },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        queueEntries: {
          where: { status: "waiting" },
          orderBy: { position: "asc" },
          include: { customer: { select: { id: true, name: true } } },
        },
      },
    });
    if (!salon) return res.status(404).json({ message: "Salon not found" });
    const estimatedWait = await getEstimatedWait(id);
    return res.json({
      ...salon,
      activeQueueLength: salon.queueEntries.length,
      estimatedWait,
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch salon", error: error.message });
  }
};

module.exports = { getNearbySalons, getSalonDetail };
