-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "salt" TEXT,
    "hash" TEXT
);
INSERT INTO "new_User" ("email", "hash", "salt", "username", "uuid") SELECT "email", "hash", "salt", "username", "uuid" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_salt_key" ON "User"("salt");
CREATE UNIQUE INDEX "User_hash_key" ON "User"("hash");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
