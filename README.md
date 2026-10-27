# Mannschaftskasse ⚽


## Projektidee und Zielzustand 💡
Nach einem Fußballspiel wurden alle Spieler händisch auf einem Zettel erfasst. 
Diese dient zur Erstellung von Statistiken, so wurden beispielsweise die Tore 🥅, gelbe 🟨 und rote Karten 🟥 und vieles weiter pro Spieler festgehalten. Zudem wurde auch vermerkt ob die Spieler ihren Beitrag, welcher bei jedem Spiel fällig wird, bezahlt haben. <br>  

Dieser ganze Prozess wurde für jedes Spiel in jeder Mannschaft, händisch durchgeführt. Da es sich um einen nicht zu unterschätzenden Aufwand handelt, wollte niemand zu Beginn der Saison dieses Amt übernehmen.
Um den Ablauf zu automatisieren und zu verbessern entstannt dieses Projekt, was dem Mannschaftsstatistiker und Schatzmeister 💰 die Arbeit deutlich vereinfach soll.


## Prozess
Die Daten der Spiele und Spieler werden über die API des [BFV](https://www.bfv.de/ "Bayerischer Fußball-Verband") eingeholt.  
**Wichtig**: 
Der erste Admin muss manuell über die Datenbank (DB) gesetzt werden. Anschließend kann dieser weitere Admins über die Anwendung ernennen.


## Stack 🚀

- ⚡ Full-stack React with [TanStack Start](https://tanstack.com/start "TanStack Start") & [TanStack Router](https://tanstack.com/router "TanStack Router") (Vite 8)
- 🧙‍♂️ E2E typesafe RPCs with `createServerFn` & [TanStack Query v5](https://tanstack.com/query "TanStack Query")
- 🔐 Authentication with [Auth.js (`@auth/core`)](https://authjs.dev "Auth.js")
- 🪶 Database ([Turso](https://turso.tech "Turso") SQLite / libSQL) with [Drizzle ORM](https://orm.drizzle.team "Drizzle ORM")

## Datenbank & Migration

- **Lokale Entwicklung (SQLite Datei):** `TURSO_DATABASE_URL=file:local.db`
- **Remote Turso DB:** `TURSO_DATABASE_URL=libsql://<db-name>.turso.io` & `TURSO_AUTH_TOKEN=<token>`
- **Schema anwenden:** `pnpm db:push`
- **Daten aus alter Postgres-DB migrieren:** `pnpm db:migrate-from-postgres`
- **Seed-Daten einfügen:** `pnpm db:seed`
- **Drizzle Studio öffnen:** `pnpm db:studio`


## Nutzer
Diese App wird aktuell von der 2. Mannschaft des [TSC Zeuzleben](https://www.tsc-zeuzleben.de/ "TSC Zeuzleben") getestet und weiterentwickelt.


## Entwicklung
Full Stack Development: [Sebastian Siedler](https://github.com/SebastianSiedler "GitHub: Sebastian Siedler")
