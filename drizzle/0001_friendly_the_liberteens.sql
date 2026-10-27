CREATE INDEX `Saison_latest_idx` ON `Saison` (`latest`);--> statement-breakpoint
CREATE INDEX `Spiel_saisonId_kickoffDate_idx` ON `Spiel` (`saisonId`,`kickoffDate`);--> statement-breakpoint
CREATE INDEX `Spielereinsatz_spielId_bezahlt_idx` ON `Spielereinsatz` (`spielId`,`bezahlt`);