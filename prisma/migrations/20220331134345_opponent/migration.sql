/*
  Warnings:

  - You are about to drop the column `guestTeamId` on the `Spiel` table. All the data in the column will be lost.
  - You are about to drop the column `homeTeamId` on the `Spiel` table. All the data in the column will be lost.
  - Added the required column `opponentTeamId` to the `Spiel` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Spiel" DROP CONSTRAINT "Spiel_guestTeamId_fkey";

-- DropForeignKey
ALTER TABLE "Spiel" DROP CONSTRAINT "Spiel_homeTeamId_fkey";

-- AlterTable
ALTER TABLE "Spiel" DROP COLUMN "guestTeamId",
DROP COLUMN "homeTeamId",
ADD COLUMN     "opponentTeamId" TEXT NOT NULL,
ALTER COLUMN "result" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Spiel" ADD CONSTRAINT "Spiel_opponentTeamId_fkey" FOREIGN KEY ("opponentTeamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
