/*
  Warnings:

  - A unique constraint covering the columns `[currentSpielId]` on the table `Saison` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Saison" ADD COLUMN     "currentSpielId" TEXT,
ADD COLUMN     "lastBfvUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Saison_currentSpielId_key" ON "Saison"("currentSpielId");

-- CreateIndex
CREATE INDEX "Spiel_opponentTeamId_idx" ON "Spiel"("opponentTeamId");

-- CreateIndex
CREATE INDEX "Spieler_names_active_idx" ON "Spieler"("names", "active");

-- CreateIndex
CREATE INDEX "Spielereinsatz_tore_bezahlt_gelbeKarte_roteKarte_spielerId__idx" ON "Spielereinsatz"("tore", "bezahlt", "gelbeKarte", "roteKarte", "spielerId", "spielId");

-- CreateIndex
CREATE INDEX "Team_bfvClubId_bfvTeamPermanentId_name_idx" ON "Team"("bfvClubId", "bfvTeamPermanentId", "name");

-- AddForeignKey
ALTER TABLE "Saison" ADD CONSTRAINT "Saison_currentSpielId_fkey" FOREIGN KEY ("currentSpielId") REFERENCES "Spiel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
