-- CreateEnum
CREATE TYPE "TaskEnergy" AS ENUM ('FOCUS', 'CREATIVE', 'ADMIN', 'MEETING', 'CHORE');

-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "actualEnd" TIMESTAMP(3),
ADD COLUMN     "actualStart" TIMESTAMP(3),
ADD COLUMN     "completed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dueDate" TIMESTAMP(3),
ADD COLUMN     "energy" "TaskEnergy",
ADD COLUMN     "plannedEnd" TIMESTAMP(3),
ADD COLUMN     "plannedStart" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "weekly_receipts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "weekStart" TIMESTAMP(3) NOT NULL,
    "plannedHours" DOUBLE PRECISION NOT NULL,
    "actualHours" DOUBLE PRECISION NOT NULL,
    "truthScore" DOUBLE PRECISION NOT NULL,
    "aiSummary" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "weekly_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "weekly_receipts_userId_idx" ON "weekly_receipts"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_receipts_userId_weekStart_key" ON "weekly_receipts"("userId", "weekStart");

-- CreateIndex
CREATE INDEX "tasks_plannedStart_idx" ON "tasks"("plannedStart");

-- AddForeignKey
ALTER TABLE "weekly_receipts" ADD CONSTRAINT "weekly_receipts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
