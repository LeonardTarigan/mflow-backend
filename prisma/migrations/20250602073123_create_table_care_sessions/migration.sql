-- CreateTable
CREATE TABLE "CareSession" (
    "id" BIGSERIAL NOT NULL,
    "status" "QueueStatus" NOT NULL,
    "complaints" VARCHAR(255) NOT NULL,
    "diagnosis" VARCHAR(255) NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID NOT NULL,
    "room_id" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CareSession_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CareSession" ADD CONSTRAINT "CareSession_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareSession" ADD CONSTRAINT "CareSession_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CareSession" ADD CONSTRAINT "CareSession_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
