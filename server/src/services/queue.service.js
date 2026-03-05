import prisma from "./prisma.service.js";
import calcWaitTime from "../utils/calcWaitTime.js";
import {
  syncSalonQueueToRedis,
  syncSalonChairsToRedis,
} from "./redis.service.js";

const getSalonSnapshot = async (salonId) => {
  const [salon, waitingQueue, chairs] = await Promise.all([
    prisma.salon.findUnique({ where: { id: salonId } }),
    prisma.queueEntry.findMany({
      where: { salonId, status: "waiting" },
      orderBy: { position: "asc" },
      include: { customer: { select: { id: true, name: true } } },
    }),
    prisma.chair.findMany({
      where: { salonId },
      include: {
        currentEntry: {
          include: { customer: { select: { id: true, name: true } } },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return { salon, waitingQueue, chairs };
};

const getEstimatedWait = async (salonId) => {
  const { salon, waitingQueue, chairs } = await getSalonSnapshot(salonId);
  const activeChairs = chairs.filter((c) => c.status === "occupied").length;
  return calcWaitTime({
    activeChairs,
    waitingCount: waitingQueue.length,
    avgServiceTime: salon?.avgServiceTime || 20,
  });
};

const emitQueueAndChairUpdates = async (io, salonId) => {
  const { waitingQueue, chairs } = await getSalonSnapshot(salonId);
  const totalWait = await getEstimatedWait(salonId);
  await syncSalonQueueToRedis(salonId, waitingQueue);
  await syncSalonChairsToRedis(salonId, chairs);
  io.to(`salon:${salonId}`).emit("queue-updated", { queue: waitingQueue, totalWait });
  chairs.forEach((chair) => {
    io.to(`salon:${salonId}`).emit("chair-updated", {
      chairId: chair.id,
      status: chair.status,
      currentCustomer: chair.currentEntry?.customer || null,
    });
  });
};

const recalculateWaitingPositionsAndNotify = async (salonId, io) => {
  const { salon, waitingQueue, chairs } = await getSalonSnapshot(salonId);
  const activeChairs = chairs.filter((c) => c.status === "occupied").length;
  const avgServiceTime = salon?.avgServiceTime || 20;
  for (let i = 0; i < waitingQueue.length; i += 1) {
    const newPosition = i + 1;
    const estimatedWait =
      activeChairs <= 0
        ? newPosition * avgServiceTime
        : Math.ceil(newPosition / activeChairs) * avgServiceTime;
    await prisma.queueEntry.update({
      where: { id: waitingQueue[i].id },
      data: { position: newPosition, estimatedWait },
    });
    io.to(`customer:${waitingQueue[i].customerId}`).emit("position-changed", {
      newPosition,
      estimatedWait,
    });
  }
  await emitQueueAndChairUpdates(io, salonId);
};

const joinQueue = async ({ customerId, salonId, service, io }) => {
  const currentActive = await prisma.queueEntry.findFirst({
    where: {
      customerId,
      status: { in: ["waiting", "called", "seated"] },
    },
  });
  if (currentActive) {
    throw new Error("Customer already has an active queue entry");
  }
  const lastWaiting = await prisma.queueEntry.findFirst({
    where: { salonId, status: "waiting" },
    orderBy: { position: "desc" },
  });
  const position = (lastWaiting?.position || 0) + 1;
  const estimatedWait = await getEstimatedWait(salonId);
  const entry = await prisma.queueEntry.create({
    data: {
      customerId,
      salonId,
      service,
      position,
      estimatedWait: estimatedWait + 1,
      status: "waiting",
    },
    include: { customer: { select: { id: true, name: true } } },
  });
  await recalculateWaitingPositionsAndNotify(salonId, io);
  return entry;
};

const assignNextToChair = async ({ chairId, barberSalonId, io }) => {
  const chair = await prisma.chair.findUnique({ where: { id: chairId } });
  if (!chair || chair.salonId !== barberSalonId) {
    throw new Error("Chair not found");
  }
  if (chair.currentQueueEntryId) {
    throw new Error("Chair already occupied");
  }
  const nextEntry = await prisma.queueEntry.findFirst({
    where: { salonId: barberSalonId, status: "waiting" },
    orderBy: { position: "asc" },
    include: { customer: true, salon: true },
  });
  if (!nextEntry) throw new Error("Queue is empty");

  const chairsBeforeAssign = await prisma.chair.findMany({ where: { salonId: barberSalonId } });
  const wereAllIdle = chairsBeforeAssign.every((c) => c.status === "idle");

  const result = await prisma.$transaction(async (tx) => {
    const updatedEntry = await tx.queueEntry.update({
      where: { id: nextEntry.id },
      data: {
        status: "seated",
        assignedChairId: chairId,
        calledAt: new Date(),
      },
      include: { customer: true, salon: true },
    });
    const updatedChair = await tx.chair.update({
      where: { id: chairId },
      data: { status: "occupied", currentQueueEntryId: nextEntry.id },
      include: {
        currentEntry: { include: { customer: { select: { id: true, name: true } } } },
      },
    });
    return { updatedEntry, updatedChair };
  });

  io.to(`customer:${result.updatedEntry.customerId}`).emit("your-turn", {
    message: "It is your turn now",
    chairLabel: result.updatedChair.label,
    salonName: result.updatedEntry.salon.name,
  });
  io.to(`salon:${barberSalonId}`).emit("chair-updated", {
    chairId: chairId,
    status: "occupied",
    currentCustomer: {
      id: result.updatedEntry.customer.id,
      name: result.updatedEntry.customer.name,
    },
  });

  if (wereAllIdle) {
    const salon = await prisma.salon.findUnique({ where: { id: barberSalonId } });
    setTimeout(() => {
      io.to(`barber:${salon.ownerId}`).emit("chair-service-suggestion", {
        chairId,
        message: `Avg service time elapsed for chair ${result.updatedChair.label}`,
      });
    }, (salon.avgServiceTime || 20) * 60 * 1000);
  }

  await recalculateWaitingPositionsAndNotify(barberSalonId, io);
  return result;
};

const markChairDone = async ({ chairId, barberSalonId, io }) => {
  const chair = await prisma.chair.findUnique({
    where: { id: chairId },
    include: { currentEntry: true },
  });
  if (!chair || chair.salonId !== barberSalonId) throw new Error("Chair not found");
  if (!chair.currentQueueEntryId) throw new Error("No active queue entry on chair");
  await prisma.$transaction(async (tx) => {
    await tx.queueEntry.update({
      where: { id: chair.currentQueueEntryId },
      data: { status: "done", servedAt: new Date() },
    });
    await tx.chair.update({
      where: { id: chairId },
      data: { status: "done", currentQueueEntryId: null },
    });
  });
  await emitQueueAndChairUpdates(io, barberSalonId);
};

const markChairIdle = async ({ chairId, barberSalonId, io }) => {
  const chair = await prisma.chair.findUnique({ where: { id: chairId } });
  if (!chair || chair.salonId !== barberSalonId) throw new Error("Chair not found");
  await prisma.chair.update({ where: { id: chairId }, data: { status: "idle" } });
  await emitQueueAndChairUpdates(io, barberSalonId);
};

const markNoShow = async ({ entryId, barberSalonId, io }) => {
  const entry = await prisma.queueEntry.findUnique({ where: { id: entryId } });
  if (!entry || entry.salonId !== barberSalonId) throw new Error("Queue entry not found");
  await prisma.queueEntry.update({
    where: { id: entryId },
    data: { status: "no_show" },
  });
  io.to(`customer:${entry.customerId}`).emit("kicked-from-queue", {
    reason: "Marked as no-show by barber",
  });
  await recalculateWaitingPositionsAndNotify(barberSalonId, io);
};

const leaveQueue = async ({ customerId, io }) => {
  const entry = await prisma.queueEntry.findFirst({
    where: {
      customerId,
      status: { in: ["waiting", "called"] },
    },
  });
  if (!entry) throw new Error("No active queue entry found");
  await prisma.queueEntry.delete({ where: { id: entry.id } });
  await recalculateWaitingPositionsAndNotify(entry.salonId, io);
};

const hydrateRedisFromPostgres = async () => {
  const salons = await prisma.salon.findMany({
    include: {
      chairs: {
        include: {
          currentEntry: {
            include: { customer: { select: { id: true, name: true } } },
          },
        },
      },
      queueEntries: {
        where: { status: "waiting" },
        orderBy: { position: "asc" },
        include: { customer: { select: { id: true, name: true } } },
      },
    },
  });
  await Promise.all(
    salons.map((salon) =>
      Promise.all([
        syncSalonQueueToRedis(salon.id, salon.queueEntries),
        syncSalonChairsToRedis(salon.id, salon.chairs),
      ])
    )
  );
};

export {
  getEstimatedWait,
  emitQueueAndChairUpdates,
  recalculateWaitingPositionsAndNotify,
  joinQueue,
  assignNextToChair,
  markChairDone,
  markChairIdle,
  markNoShow,
  leaveQueue,
  hydrateRedisFromPostgres,
};
