-- CreateTable
CREATE TABLE "drugs" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "amount_sold" INTEGER NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "price" INTEGER NOT NULL,

    CONSTRAINT "drugs_pkey" PRIMARY KEY ("id")
);
