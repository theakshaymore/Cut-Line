-- CreateEnum
CREATE TYPE "Role" AS ENUM ('customer', 'barber', 'admin');

-- CreateEnum
CREATE TYPE "ChairStatus" AS ENUM ('idle', 'occupied', 'done');

-- CreateEnum
CREATE TYPE "QueueStatus" AS ENUM ('waiting', 'called', 'seated', 'done', 'no_show');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('queue_update', 'your_turn', 'no_show_warning', 'position_changed');

-- CreateTable
CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "Role" NOT NULL DEFAULT 'customer',
  "fcmToken" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Salon" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "ownerId" TEXT NOT NULL,
  "avgServiceTime" INTEGER NOT NULL DEFAULT 20,
  "isVerified" BOOLEAN NOT NULL DEFAULT false,
  "registrationToken" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Salon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chair" (
  "id" TEXT NOT NULL,
  "salonId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "status" "ChairStatus" NOT NULL DEFAULT 'idle',
  "currentQueueEntryId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Chair_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QueueEntry" (
  "id" TEXT NOT NULL,
  "customerId" TEXT NOT NULL,
  "salonId" TEXT NOT NULL,
  "assignedChairId" TEXT,
  "position" INTEGER NOT NULL,
  "status" "QueueStatus" NOT NULL DEFAULT 'waiting',
  "service" TEXT NOT NULL,
  "estimatedWait" INTEGER NOT NULL,
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "calledAt" TIMESTAMP(3),
  "servedAt" TIMESTAMP(3),
  CONSTRAINT "QueueEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" "NotificationType" NOT NULL,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BarberInvite" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "salonName" TEXT NOT NULL,
  "token" TEXT NOT NULL,
  "usedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BarberInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "Salon_ownerId_key" ON "Salon"("ownerId");
CREATE UNIQUE INDEX "Salon_registrationToken_key" ON "Salon"("registrationToken");
CREATE UNIQUE INDEX "Chair_currentQueueEntryId_key" ON "Chair"("currentQueueEntryId");
CREATE INDEX "QueueEntry_salonId_status_idx" ON "QueueEntry"("salonId", "status");
CREATE UNIQUE INDEX "BarberInvite_token_key" ON "BarberInvite"("token");

-- AddForeignKey
ALTER TABLE "Salon" ADD CONSTRAINT "Salon_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Chair" ADD CONSTRAINT "Chair_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Chair" ADD CONSTRAINT "Chair_currentQueueEntryId_fkey" FOREIGN KEY ("currentQueueEntryId") REFERENCES "QueueEntry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_salonId_fkey" FOREIGN KEY ("salonId") REFERENCES "Salon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "QueueEntry" ADD CONSTRAINT "QueueEntry_assignedChairId_fkey" FOREIGN KEY ("assignedChairId") REFERENCES "Chair"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;