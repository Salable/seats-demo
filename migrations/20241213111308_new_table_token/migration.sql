-- CreateTable
CREATE TABLE "Organisation" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "salt" TEXT NOT NULL,
    "hash" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "UsersOnOrganisations" (
    "organisationUuid" TEXT NOT NULL,
    "userUuid" TEXT NOT NULL,
    "isAdmin" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "UsersOnOrganisations_organisationUuid_fkey" FOREIGN KEY ("organisationUuid") REFERENCES "Organisation" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "UsersOnOrganisations_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Token" (
    "uuid" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "organisationUuid" TEXT NOT NULL,
    "userUuid" TEXT NOT NULL,
    CONSTRAINT "Token_organisationUuid_fkey" FOREIGN KEY ("organisationUuid") REFERENCES "Organisation" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Token_userUuid_fkey" FOREIGN KEY ("userUuid") REFERENCES "User" ("uuid") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_name_key" ON "Organisation"("name");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_salt_key" ON "User"("salt");

-- CreateIndex
CREATE UNIQUE INDEX "User_hash_key" ON "User"("hash");

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnOrganisations_organisationUuid_key" ON "UsersOnOrganisations"("organisationUuid");

-- CreateIndex
CREATE UNIQUE INDEX "UsersOnOrganisations_userUuid_key" ON "UsersOnOrganisations"("userUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Token_organisationUuid_key" ON "Token"("organisationUuid");

-- CreateIndex
CREATE UNIQUE INDEX "Token_userUuid_key" ON "Token"("userUuid");
