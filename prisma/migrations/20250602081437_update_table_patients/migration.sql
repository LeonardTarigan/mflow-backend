/*
  Warnings:

  - A unique constraint covering the columns `[nik]` on the table `patients` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nik` to the `patients` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "nik" VARCHAR(16) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "patients_nik_key" ON "patients"("nik");
