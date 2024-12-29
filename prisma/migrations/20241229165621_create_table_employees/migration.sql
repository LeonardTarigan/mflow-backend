-- CreateTable
CREATE TABLE "employees" (
    "id" VARCHAR(100) NOT NULL,
    "nip" VARCHAR(16) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(50) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);
