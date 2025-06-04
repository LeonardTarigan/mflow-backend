/*
  Warnings:

  - A unique constraint covering the columns `[medical_record_number]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "medical_record_number" VARCHAR(16);

-- CreateIndex
CREATE UNIQUE INDEX "patients_medical_record_number_key" ON "patients"("medical_record_number");
