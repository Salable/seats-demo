/*
  Warnings:

  - A unique constraint covering the columns `[value]` on the table `Token` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Token_value_key" ON "Token"("value");
