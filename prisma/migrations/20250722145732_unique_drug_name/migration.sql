/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `drugs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "drugs_name_key" ON "drugs"("name");
