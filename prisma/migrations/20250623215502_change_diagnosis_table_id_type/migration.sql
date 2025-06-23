/*
  Warnings:

  - The primary key for the `care_session_diagnoses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `diagnoses` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "care_session_diagnoses" DROP CONSTRAINT "care_session_diagnoses_diagnosis_id_fkey";

-- AlterTable
ALTER TABLE "care_session_diagnoses" DROP CONSTRAINT "care_session_diagnoses_pkey",
ALTER COLUMN "diagnosis_id" SET DATA TYPE TEXT,
ADD CONSTRAINT "care_session_diagnoses_pkey" PRIMARY KEY ("care_session_id", "diagnosis_id");

-- AlterTable
ALTER TABLE "diagnoses" DROP CONSTRAINT "diagnoses_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "diagnoses_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "diagnoses_id_seq";

-- AddForeignKey
ALTER TABLE "care_session_diagnoses" ADD CONSTRAINT "care_session_diagnoses_diagnosis_id_fkey" FOREIGN KEY ("diagnosis_id") REFERENCES "diagnoses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
