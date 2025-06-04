/*
  Warnings:

  - The primary key for the `care_session_diagnoses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `careSessionId` on the `care_session_diagnoses` table. All the data in the column will be lost.
  - You are about to drop the column `diagnosisId` on the `care_session_diagnoses` table. All the data in the column will be lost.
  - Added the required column `care_session_id` to the `care_session_diagnoses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diagnosis_id` to the `care_session_diagnoses` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "care_session_diagnoses" DROP CONSTRAINT "care_session_diagnoses_careSessionId_fkey";

-- DropForeignKey
ALTER TABLE "care_session_diagnoses" DROP CONSTRAINT "care_session_diagnoses_diagnosisId_fkey";

-- AlterTable
ALTER TABLE "care_session_diagnoses" DROP CONSTRAINT "care_session_diagnoses_pkey",
DROP COLUMN "careSessionId",
DROP COLUMN "diagnosisId",
ADD COLUMN     "care_session_id" INTEGER NOT NULL,
ADD COLUMN     "diagnosis_id" INTEGER NOT NULL,
ADD CONSTRAINT "care_session_diagnoses_pkey" PRIMARY KEY ("care_session_id", "diagnosis_id");

-- AddForeignKey
ALTER TABLE "care_session_diagnoses" ADD CONSTRAINT "care_session_diagnoses_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_session_diagnoses" ADD CONSTRAINT "care_session_diagnoses_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
