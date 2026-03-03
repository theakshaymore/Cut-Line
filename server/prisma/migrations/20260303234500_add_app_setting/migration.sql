-- CreateTable
CREATE TABLE "AppSetting" (
  "id" INTEGER NOT NULL DEFAULT 1,
  "requireBarberInvite" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AppSetting_pkey" PRIMARY KEY ("id")
);

-- Seed singleton settings row (default OFF)
INSERT INTO "AppSetting" ("id", "requireBarberInvite", "createdAt", "updatedAt")
VALUES (1, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;