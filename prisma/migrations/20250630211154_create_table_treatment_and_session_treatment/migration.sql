/*
  Warnings:

  - You are about to drop the column `session_fee` on the `care_sessions` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "care_sessions" DROP COLUMN "session_fee";

-- CreateTable
CREATE TABLE "treatments" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "price" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "treatments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "session_treatments" (
    "care_session_id" INTEGER NOT NULL,
    "treatment_id" INTEGER NOT NULL,
    "applied_price" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "session_treatments_pkey" PRIMARY KEY ("care_session_id","treatment_id")
);

-- AddForeignKey
ALTER TABLE "session_treatments" ADD CONSTRAINT "session_treatments_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "session_treatments" ADD CONSTRAINT "session_treatments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
