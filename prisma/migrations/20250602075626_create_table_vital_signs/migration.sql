-- CreateTable
CREATE TABLE "vital_signs" (
    "id" BIGSERIAL NOT NULL,
    "care_session_id" BIGINT NOT NULL,
    "height_cm" DECIMAL(5,2) NOT NULL,
    "weight_kg" DECIMAL(5,2) NOT NULL,
    "body_temperature_c" DECIMAL(4,2) NOT NULL,
    "blood_pressure" VARCHAR(15) NOT NULL,
    "heart_rate_bpm" INTEGER NOT NULL,
    "respiratory_rate_bpm" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vital_signs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vital_signs_care_session_id_key" ON "vital_signs"("care_session_id");

-- AddForeignKey
ALTER TABLE "vital_signs" ADD CONSTRAINT "vital_signs_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
