/*
  Warnings:

  - The primary key for the `care_sessions` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `care_sessions` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `drug_orders` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `drug_orders` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `care_session_id` on the `drug_orders` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - The primary key for the `vital_signs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `vital_signs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - You are about to alter the column `care_session_id` on the `vital_signs` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.
  - Changed the type of `gender` on the `patients` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- DropForeignKey
ALTER TABLE "drug_orders" DROP CONSTRAINT "drug_orders_care_session_id_fkey";

-- DropForeignKey
ALTER TABLE "vital_signs" DROP CONSTRAINT "vital_signs_care_session_id_fkey";

-- AlterTable
ALTER TABLE "care_sessions" DROP CONSTRAINT "care_sessions_pkey",
ALTER COLUMN "id" SET DATA TYPE INTEGER USING "id"::integer,
ADD CONSTRAINT "care_sessions_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "drug_orders" DROP CONSTRAINT "drug_orders_pkey",
ALTER COLUMN "id" SET DATA TYPE INTEGER USING "id"::integer,
ALTER COLUMN "care_session_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "drug_orders_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "patients" DROP COLUMN "gender",
ADD COLUMN     "gender" "Gender" NOT NULL;

-- AlterTable
ALTER TABLE "vital_signs" DROP CONSTRAINT "vital_signs_pkey",
ALTER COLUMN "id" SET DATA TYPE INTEGER USING "id"::integer,
ALTER COLUMN "care_session_id" SET DATA TYPE INTEGER,
ADD CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id");

-- AddForeignKey
ALTER TABLE "drug_orders" ADD CONSTRAINT "drug_orders_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
