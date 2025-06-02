-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "birth_date" DATE NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "gender" VARCHAR(100) NOT NULL,
    "occupation" VARCHAR(100) NOT NULL,
    "phone_number" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);
