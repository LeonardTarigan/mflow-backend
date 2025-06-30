/*
  Warnings:

  - You are about to drop the `session_treatments` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "session_treatments" DROP CONSTRAINT "session_treatments_care_session_id_fkey";

-- DropForeignKey
ALTER TABLE "session_treatments" DROP CONSTRAINT "session_treatments_treatment_id_fkey";

-- DropTable
DROP TABLE "session_treatments";

-- CreateTable
CREATE TABLE "care_session_treatments" (
    "care_session_id" INTEGER NOT NULL,
    "treatment_id" INTEGER NOT NULL,
    "applied_price" INTEGER NOT NULL DEFAULT 0,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "care_session_treatments_pkey" PRIMARY KEY ("care_session_id","treatment_id")
);

-- AddForeignKey
ALTER TABLE "care_session_treatments" ADD CONSTRAINT "care_session_treatments_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "care_session_treatments" ADD CONSTRAINT "care_session_treatments_treatment_id_fkey" FOREIGN KEY ("treatment_id") REFERENCES "treatments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
