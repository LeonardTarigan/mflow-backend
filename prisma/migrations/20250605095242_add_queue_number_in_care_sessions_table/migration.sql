/*
  Warnings:

  - A unique constraint covering the columns `[queue_number,created_at]` on the table `care_sessions` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `queue_number` to the `care_sessions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "care_sessions" ADD COLUMN     "queue_number" VARCHAR(10) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "care_sessions_queue_number_created_at_key" ON "care_sessions"("queue_number", "created_at");
