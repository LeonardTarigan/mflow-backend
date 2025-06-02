-- CreateTable
CREATE TABLE "drug_orders" (
    "id" BIGSERIAL NOT NULL,
    "care_session_id" BIGINT NOT NULL,
    "drug_id" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "drug_orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "drug_orders" ADD CONSTRAINT "drug_orders_care_session_id_fkey" FOREIGN KEY ("care_session_id") REFERENCES "care_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "drug_orders" ADD CONSTRAINT "drug_orders_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
