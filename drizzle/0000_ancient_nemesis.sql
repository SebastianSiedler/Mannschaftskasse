CREATE TABLE `Account` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`type` text NOT NULL,
	`provider` text NOT NULL,
	`providerAccountId` text NOT NULL,
	`refresh_token` text,
	`refresh_token_expires_in` integer,
	`access_token` text,
	`expires_at` integer,
	`token_type` text,
	`scope` text,
	`id_token` text,
	`session_state` text,
	`oauth_token_secret` text,
	`oauth_token` text,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Account_provider_providerAccountId_key` ON `Account` (`provider`,`providerAccountId`);--> statement-breakpoint
CREATE INDEX `Account_userId_idx` ON `Account` (`userId`);--> statement-breakpoint
CREATE TABLE `Saison` (
	`id` text PRIMARY KEY NOT NULL,
	`bfvCompoundID` text NOT NULL,
	`name` text NOT NULL,
	`latest` integer DEFAULT false NOT NULL,
	`bfvData` text,
	`currentSpielId` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Saison_bfvCompoundID_unique` ON `Saison` (`bfvCompoundID`);--> statement-breakpoint
CREATE UNIQUE INDEX `Saison_currentSpielId_unique` ON `Saison` (`currentSpielId`);--> statement-breakpoint
CREATE TABLE `Session` (
	`id` text PRIMARY KEY NOT NULL,
	`sessionToken` text NOT NULL,
	`userId` text NOT NULL,
	`expires` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Session_sessionToken_unique` ON `Session` (`sessionToken`);--> statement-breakpoint
CREATE INDEX `Session_userId_idx` ON `Session` (`userId`);--> statement-breakpoint
CREATE TABLE `Spiel` (
	`id` text PRIMARY KEY NOT NULL,
	`saisonId` text NOT NULL,
	`bfvMatchId` text NOT NULL,
	`kickoffDate` integer NOT NULL,
	`result` text,
	`resultType` text NOT NULL,
	`opponentTeamId` text NOT NULL,
	FOREIGN KEY (`saisonId`) REFERENCES `Saison`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`opponentTeamId`) REFERENCES `Team`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Spiel_bfvMatchId_unique` ON `Spiel` (`bfvMatchId`);--> statement-breakpoint
CREATE INDEX `Spiel_opponentTeamId_idx` ON `Spiel` (`opponentTeamId`);--> statement-breakpoint
CREATE INDEX `Spiel_saisonId_idx` ON `Spiel` (`saisonId`);--> statement-breakpoint
CREATE TABLE `Spieler` (
	`id` text PRIMARY KEY NOT NULL,
	`names` text NOT NULL,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE INDEX `Spieler_active_idx` ON `Spieler` (`active`);--> statement-breakpoint
CREATE TABLE `Spielereinsatz` (
	`tore` integer DEFAULT 0 NOT NULL,
	`bezahlt` integer DEFAULT false NOT NULL,
	`gelbeKarte` integer DEFAULT 0 NOT NULL,
	`roteKarte` integer DEFAULT 0 NOT NULL,
	`spielerId` text NOT NULL,
	`spielId` text NOT NULL,
	PRIMARY KEY(`spielerId`, `spielId`),
	FOREIGN KEY (`spielerId`) REFERENCES `Spieler`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`spielId`) REFERENCES `Spiel`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `Spielereinsatz_spielId_idx` ON `Spielereinsatz` (`spielId`);--> statement-breakpoint
CREATE INDEX `Spielereinsatz_spielerId_idx` ON `Spielereinsatz` (`spielerId`);--> statement-breakpoint
CREATE TABLE `Team` (
	`id` text PRIMARY KEY NOT NULL,
	`bfvTeamPermanentId` text NOT NULL,
	`bfvClubId` text NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `Team_bfvTeamPermanentId_unique` ON `Team` (`bfvTeamPermanentId`);--> statement-breakpoint
CREATE INDEX `Team_bfvClubId_bfvTeamPermanentId_name_idx` ON `Team` (`bfvClubId`,`bfvTeamPermanentId`,`name`);--> statement-breakpoint
CREATE TABLE `User` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text,
	`email` text,
	`emailVerified` integer,
	`image` text,
	`role` text DEFAULT 'USER' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `User_email_unique` ON `User` (`email`);--> statement-breakpoint
CREATE TABLE `VerificationToken` (
	`identifier` text NOT NULL,
	`token` text NOT NULL,
	`expires` integer NOT NULL,
	PRIMARY KEY(`identifier`, `token`)
);
--> statement-breakpoint
CREATE UNIQUE INDEX `VerificationToken_token_unique` ON `VerificationToken` (`token`);