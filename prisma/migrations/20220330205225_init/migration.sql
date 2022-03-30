-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" VARCHAR(2000),
    "refresh_token_expires_in" INT4,
    "access_token" VARCHAR(2000),
    "expires_at" INT4,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" VARCHAR(2000),
    "session_state" VARCHAR(2000),
    "oauth_token_secret" VARCHAR(2000),
    "oauth_token" VARCHAR(2000),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "role" "Role" NOT NULL DEFAULT E'USER',

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Saison" (
    "id" TEXT NOT NULL,
    "bfvCompoundID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "latest" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Saison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spiel" (
    "id" TEXT NOT NULL,
    "saisonId" TEXT NOT NULL,
    "bfvMatchId" TEXT NOT NULL,
    "kickoffDate" TIMESTAMP(3) NOT NULL,
    "result" TEXT NOT NULL,
    "homeTeamId" TEXT NOT NULL,
    "guestTeamId" TEXT NOT NULL,

    CONSTRAINT "Spiel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spieler" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "Spieler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Spielereinsatz" (
    "tore" INT4 NOT NULL,
    "bezahlt" BOOLEAN NOT NULL,
    "gelbeKarte" INT4 NOT NULL,
    "roteKarte" INT4 NOT NULL,
    "spielerId" TEXT NOT NULL,
    "spielId" TEXT NOT NULL,

    CONSTRAINT "Spielereinsatz_pkey" PRIMARY KEY ("spielerId","spielId")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "bfvTeamPermanentId" TEXT NOT NULL,
    "bfvClubId" TEXT NOT NULL,
    "logo" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Saison_bfvCompoundID_key" ON "Saison"("bfvCompoundID");

-- CreateIndex
CREATE UNIQUE INDEX "Spiel_bfvMatchId_key" ON "Spiel"("bfvMatchId");

-- CreateIndex
CREATE UNIQUE INDEX "Spieler_name_key" ON "Spieler"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Team_bfvTeamPermanentId_key" ON "Team"("bfvTeamPermanentId");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spiel" ADD CONSTRAINT "Spiel_saisonId_fkey" FOREIGN KEY ("saisonId") REFERENCES "Saison"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spiel" ADD CONSTRAINT "Spiel_homeTeamId_fkey" FOREIGN KEY ("homeTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spiel" ADD CONSTRAINT "Spiel_guestTeamId_fkey" FOREIGN KEY ("guestTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spielereinsatz" ADD CONSTRAINT "Spielereinsatz_spielId_fkey" FOREIGN KEY ("spielId") REFERENCES "Spiel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Spielereinsatz" ADD CONSTRAINT "Spielereinsatz_spielerId_fkey" FOREIGN KEY ("spielerId") REFERENCES "Spieler"("id") ON DELETE CASCADE ON UPDATE CASCADE;
