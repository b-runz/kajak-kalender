---
title: Sådan opbevares dit data
description: Lær hvordan dit login og data opbevares sikkert og krypteret.
---

# Datasikkerhed og opbevaring

## Oversigt

Når du logger ind på Kajak Kalender, opbevares dit login-token sikkert og krypteret i Azure Table Storage. Dit data er beskyttet med flere lag af sikkerhed, som sikrer, at kun du har adgang til dine egne kalenderdata.

## Kryptering af data

### Primær kryptering
Dit login-token krypteres med **AES-kryptering** før det gemmes i databasen. Krypteringsnøglen er unik for hvert login og genereres som en tilfældig UUID. Denne nøgle:

- Gemmes kun lokalt i din browser som en cookie
- Sendes aldrig til serveren i ukrypteret form
- Kan ikke genskabes af systemet

### Sekundær sikkerhed med HMAC-hash
Udover AES-krypteringen bruges der et **HMAC-SHA256 hash system** til at validere dataintegritet. Dette hash:

- Bruger en separat server-side nøgle
- Inkluderer paritetskontrol for at detektere manipulation
- Validerer både nøglens ægthed og dataintegriteten

## Hvem har IKKE adgang til dine data

### Microsoft Azure
- Microsoft kan se at der er krypteret data i deres database
- Microsoft kan **IKKE** dekryptere dine data, da de ikke har krypteringsnøglen
- Krypteringsnøglen opbevares kun lokalt hos dig

### Systemadministratorer
- Administratorer kan se krypteret data i systemet
- Administratorer kan **IKKE** dekryptere eller læse dit login-token
- Kun du har krypteringsnøglen der er nødvendig for dekryptering

### Systemet selv
- Krypteringsnøglen logges **aldrig** på serveren
- Der er ingen backup eller kopi af din krypteringsnøgle
- Hvis du mister din browser-cookies, kan dataen ikke gendannes

## Tekniske detaljer

### Dataflow
1. Du indtaster dit brugernavn og password
2. Systemet logger ind hos AKKK og får et access token
3. Dit token krypteres med en unik AES-nøgle
4. Det krypterede token gemmes i Azure Table Storage
5. Krypteringsnøglen gemmes kun som cookie i din browser

### Sikkerhedsvalidering
- HMAC-hash validerer at krypteringsnøglen er ægte
- Timing-safe sammenligning forhindrer timing-angreb
- Paritetskontrol detekterer data-manipulation
- Alle validerings-checks skal bestås før data udleveres

## Hvad sker der hvis...

### Du mister dine browser-cookies?
- Dit krypterede data bliver utilgængeligt
- Du skal logge ind igen for at få ny adgang
- Der oprettes et nyt krypteret link

### Nogen får fat i den krypterede data?
- Dataen er værdiløs uden krypteringsnøglen
- Krypteringsnøglen findes kun i din browser
- AES-kryptering er industristandard og meget sikker

### Du vil slette dine data?
- Slet dine browser-cookies
- Det krypterede data i databasen bliver utilgængeligt
- Data kan ryddes op automatisk efter udløb