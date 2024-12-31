/*
  Warnings:

  - The values [DOCTOR,PHARMACIST] on the enum `EmployeeRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "EmployeeRole_new" AS ENUM ('ADMIN', 'DOKTER', 'PERAWAT', 'BIDAN', 'FARMASI', 'APOTEKER', 'STAFF');
ALTER TABLE "employees" ALTER COLUMN "role" TYPE "EmployeeRole_new" USING ("role"::text::"EmployeeRole_new");
ALTER TYPE "EmployeeRole" RENAME TO "EmployeeRole_old";
ALTER TYPE "EmployeeRole_new" RENAME TO "EmployeeRole";
DROP TYPE "EmployeeRole_old";
COMMIT;
