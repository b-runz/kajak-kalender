---
title: Sådan håndteres dit AKKK login
description: Lær hvordan dit AKKK login håndteres sikkert og hvilke data der gemmes.
---

# Login-håndtering og tokensikkerhed

## Oversigt

Kajak Kalender bruger en sikker OAuth2-baseret login-proces med AKKK's officielle API. Dit brugernavn og kodeord sendes kun direkte til AKKK's servere og gemmes aldrig i vores system. I stedet arbejder vi med sikre tokens, præcis som MemberLink-appen gør.

## Login-processen

### Hvad sker der når du logger ind

1. **Indtastning**: Du indtaster dit AKKK brugernavn og kodeord
2. **Direkte videresendelse**: Dine login-oplysninger sendes direkte til AKKK's servere (aarhuskanokajak.dk)
3. **Token-udstedelse**: AKKK sender et access token og refresh token tilbage
4. **Medlem-validering**: Systemet bruger token'et til at hente dit medlems-ID fra AKKK
5. **Sikker opbevaring**: Token'et krypteres og gemmes i vores database

### Microsoft Azure's rolle

- **Brugernavn**: Sendes gennem Microsoft's servere til AKKK, men **gemmes ikke**
- **Kodeord**: Sendes gennem Microsoft's servere til AKKK, men **gemmes ikke** 
- **Token**: Kun det krypterede token opbevares i Azure's database
- Microsoft kan ikke se dit brugernavn eller kodeord i læsbar form

## Hvad er et token?

### Token vs. kodeord
Et token er **ikke** dit kodeord, men snarere en midlertidig adgangsnøgle:

- **Access Token**: Giver adgang til AKKK's API i en begrænset periode
- **Refresh Token**: Bruges til at få ny adgang når access token'et udløber
- **Udløbsdato**: Alle tokens har en begrænsning levetid

### Samme sikkerhed som MemberLink
Kajak Kalender bruger **nøjagtig samme token-system** som AKKK's officielle MemberLink app:

- Samme OAuth2-protokol
- Samme API-endpoints  
- Samme sikkerhedsstandarder
- Samme token-format og udløbsmekanisme

## Sikkerhedsfordele ved tokens

### Hvis et token bliver lækkket
- **Ingen fare for dit kodeord**: Token'et er ikke dit kodeord
- **Automatisk udløb**: Token'et udløber automatisk efter kort tid
- **Ingen kodeordsskift nødvendigt**: Du skal ikke ændre dit AKKK kodeord ved eventuelt læk

## Teknisk implementation

### OAuth2 Password Grant Flow
```
1. Brugernavn + Kodeord → AKKK Server
2. AKKK Server → Access Token + Refresh Token
3. Access Token → Medlem validering hos AKKK
4. Krypteret Token → Azure Table Storage
```

### Token-fornyelse
- Tjek af udløbstidspunkt før hver API-kald
- Automatisk fornyelse med refresh token
- Fejlhåndtering hvis refresh mislykkes
- Sikkerhedsmargin (60 sekunder før faktisk udløb)

## Sammenligning med andre systemer

### MemberLink app
- ✅ Samme OAuth2-protokol
- ✅ Samme token-format  
- ✅ Samme sikkerhedsniveau
- ✅ Samme API-adgang

### Traditionel cookie-login
- ❌ Permanente sessions
- ❌ Kodeord ofte cachet
- ❌ Ingen automatisk udløb
- ❌ Større sikkerhedsrisiko

## Hvad gemmes hvor?

### Hos AKKK (aarhuskanokajak.dk)
- Dit brugernavn og kodeord (som normalt)
- Dine medlemsoplysninger
- Dine bookinger og aktiviteter

### I vores system (Kajak Kalender)
- **Krypteret access token** (kan ikke læses uden nøgle)
- **Krypteret refresh token** (kan ikke læses uden nøgle)  
- **Dit medlems-ID** (offentligt tilgængeligt hos AKKK)
- **Token udløbstidspunkt**

### Hos Microsoft Azure
- Krypteret data (kan ikke dekrypteres af Microsoft)
- Ingen brugernavn eller kodeord
- Ingen adgang til læsbare tokens