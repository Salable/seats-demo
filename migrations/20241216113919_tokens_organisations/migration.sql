/*
  Warnings:

  - Added the required column `organisationUuid` to the `Token` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Token" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "userUuid" TEXT NOT NULL,
    "organisationUuid" TEXT NOT NULL,
    CONSTRAINT "Token_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Token_organisationUuid_fkey" FOREIGN KEY ("organisationUuid") REFERENCES "Organisation" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Token" ("userUuid", "uuid", "value") SELECT "userUuid", "uuid", "value" FROM "Token";
DROP TABLE "Token";
ALTER TABLE "new_Token" RENAME TO "Token";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
