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

- 🧙‍♂️ E2E typesafety with [tRPC](https://trpc.io "tRPC")
- ⚡ Full-stack React with Next.js
- ⚡ Database (Postgres) with Prisma


## Nutzer
Diese App wird aktuell von der 2. Mannschaft des [TSC Zeuzleben](https://www.tsc-zeuzleben.de/ "TSC Zeuzleben") getestet und weiterentwickelt.


## Entwicklung
Full Stack Development: [Sebastian Siedler](https://github.com/SebastianSiedler "GitHub: Sebastian Siedler")

