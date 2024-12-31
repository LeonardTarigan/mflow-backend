/*
  Warnings:

  - Changed the type of `role` on the `employees` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EmployeeRole" AS ENUM ('ADMIN', 'STAFF', 'DOCTOR', 'PHARMACIST');

-- AlterTable
ALTER TABLE "employees" DROP COLUMN "role",
ADD COLUMN     "role" "EmployeeRole" NOT NULL;
