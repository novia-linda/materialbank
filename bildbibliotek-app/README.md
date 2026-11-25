# GitHub Bildbibliotek · v0.5

En install­erbar webbapp (PWA) för pedagogiska skärmbilder, med GitHub-publicering och en bildlogg som kan användas för Notion → Moodle.

## Nytt i v0.5

- **Riktig 2×-förstoring:** visat utsnitt förstoras proportionellt (inte utsträckt till en cirkel). Välj **Zoom 2×**, dra runt det som ska visas, och växla till **Flytta** för att dra den runda förstoringslinsen dit du vill.
- **Objekt & lager:** öppna eller stäng panelen till höger. Markera en pil, ruta, ring, textetikett, siffermarkering, zoom eller fokus. Ändra färg och linjebredd via verktygsfältet, dra den på bilden eller använd piltangenterna (Shift = 10 pixlar). Flytta objektet framåt/bakåt i lagren, dölj/visa, ta bort eller redigera textetiketter. Bakgrundsbilden visas låst längst ned.
- **Färgpaletter:** klicka **+ Färgpaletter**. 9 palettrader med 5 färger i varje, hämtade från Notion → Design (DES-01 till DES-06, PROF-02 Affärssystem, PROF-03 IT-verktyg, PROF-04 MBA AI). Varje designrad länkar till sin källa i Notion. HEX-värdena är exakta; färgrollerna ska beaktas vid officiellt kursmaterial.
- Export, bildstorlekar, beskärning, maskering, numrerade steg, sparbara `.bildprojekt.json` samt GitHub-uppladdning med manifest/logg fungerar som förut. Tidigare projektfiler från v0.3–0.4 kan fortfarande öppnas.

## Öppna webbappen

https://novia-linda.github.io/materialbank/bildbibliotek-app/

Vid uppdatering av en installerad PWA: **stäng appfönstret och öppna det igen**, eller tryck Ctrl + Shift + R om den fortfarande visar v0.4. Cache-namnet har ändrats till `bildbibliotek-pwa-v05`.

## Arbeta

1. Klistra in ett skärmklipp med `Ctrl + V` eller välj bilder.
2. Använd t.ex. **Steg**, **Pil**, **Ruta**, **Fokus** eller **Zoom 2×**.
3. Öppna **Objekt & lager** för att välja, dölja, ordna, flytta och ändra enskilda objekt.
4. Öppna **+ Färgpaletter** för att tillämpa färger från dina Notion-profiler. Du kan också välja valfri färg i den vanliga färgväljaren.
5. Spara bilden på datorn, eller anslut GitHub med en fine-grained token för `novia-linda/materialbank` (Contents: Read/Write) och publicera bilder + logg.

Bilder bearbetas lokalt. Accessnycklar lagras inte av appen. Skicka aldrig en token via chatt. Publicera inte känslig eller verklig studentdata i ett publikt repo.

## Testnotering

I Chromium testades följande mot ett syntetiskt skärmklipp: 9 paletter/45 färger, steg/pil/ruta/zoom, lager-val, enskild färg- och linjebreddsändring, flytta i staplingsordning, visa/dölj, flytta förstoringslins, export 1600 × 900, spara projekt och ångra. GitHub-publiceringen har inte testats med en riktig token i denna version (befintligt uppladdningsflöde är oförändrat).


## Nytt i v0.6

Välj **Novia Design** (svart, vitt, grått och Novia-rött) eller **Kursmaterial** (mjukare palett) överst i appen. Läget sparas lokalt. Endast nya objekt får ny standardfärg; befintliga objekt ändras inte.

**Zoom:** Klicka för att lägga in 2×-standardlins eller dra ett anpassat källområde. Markera zoomobjektet och dra den grå källrutan, dess hörn-/sidhandtag eller den runda linsen var för sig. Källrutans redigeringshjälp kommer aldrig med i exporten. För rutor och pilar, använd vanliga verktyg.

## Nytt i v0.7 – Tangentbordsgenvägar

- **⌨ Genväg** (eller K) öppnar en editor med två lägen: tangenter samtidigt (`Ctrl + Shift + S`) och steg i följd (`Alt → H → V`).
- Välj tangenter manuellt eller spela in i tangentfångaren. På mobil används manuella val.
- Du kan justera storlek och flytta det färdiga objektet, ändra det via **Objekt & lager**, dölja det och ångra ändringar.
- Genvägen följer med vid PNG/JPEG-export, GitHub-uppladdning och i sparade `.bildprojekt.json`; tidigare projekt fungerar fortsatt.
- Den installerade PWA:n använder cache-version `bildbibliotek-pwa-v07`.
