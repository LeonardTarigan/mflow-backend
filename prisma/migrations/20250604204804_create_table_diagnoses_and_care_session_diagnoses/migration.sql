/*
  Warnings:

  - You are about to drop the column `diagnosis` on the `care_sessions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "vital_signs" DROP CONSTRAINT "vital_signs_care_session_id_fkey";

-- AlterTable
ALTER TABLE "care_sessions" DROP COLUMN "diagnosis";

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "care_session_diagnoses" (
    "careSessionId" INTEGER NOT NULL,
    "diagnosisId" INTEGER NOT NULL,

    CONSTRAINT "care_session_diagnoses_pkey" PRIMARY KEY ("careSessionId","diagnosisId")
);

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_session_diagnoses" ADD CONSTRAINT "care_session_diagnoses_careSessionId_fkey" FOREIGN KEY ("careSessionId") REFERENCES "care_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_session_diagnoses" ADD CONSTRAINT "care_session_diagnoses_diagnosisId_fkey" FOREIGN KEY ("diagnosisId") REFERENCES "diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
