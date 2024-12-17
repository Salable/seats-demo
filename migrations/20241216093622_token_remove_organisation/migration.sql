/*
  Warnings:

  - You are about to drop the column `organisationUuid` on the `Token` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "userUuid" TEXT NOT NULL,
    CONSTRAINT "Token_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("userUuid", "uuid", "value") SELECT "userUuid", "uuid", "value" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
CREATE UNIQUE INDEX "Token_userUuid_key" ON "Token"("userUuid");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
