-- DropForeignKey
ALTER TABLE "drug_orders" DROP CONSTRAINT "drug_orders_care_session_id_fkey";

-- AlterTable
ALTER TABLE "drug_orders" ADD COLUMN     "dose" VARCHAR(255) NOT NULL DEFAULT '';

-- AddForeignKey
ALTER TABLE "drug_orders" ADD CONSTRAINT "drug_orders_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
