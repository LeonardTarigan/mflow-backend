/*
  Warnings:

  - You are about to drop the `CareSession` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CareSession" DROP CONSTRAINT "CareSession_doctor_id_fkey";

-- DropForeignKey
ALTER TABLE "CareSession" DROP CONSTRAINT "CareSession_patient_id_fkey";

-- DropForeignKey
ALTER TABLE "CareSession" DROP CONSTRAINT "CareSession_room_id_fkey";

-- DropTable
DROP TABLE "CareSession";

-- CreateTable
CREATE TABLE "care_sessions" (
    "id" BIGSERIAL NOT NULL,
    "status" "QueueStatus" NOT NULL,
    "complaints" VARCHAR(255) NOT NULL,
    "diagnosis" VARCHAR(255) NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "room_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_sessions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "care_sessions" ADD CONSTRAINT "care_sessions_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_sessions" ADD CONSTRAINT "care_sessions_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_sessions" ADD CONSTRAINT "care_sessions_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
