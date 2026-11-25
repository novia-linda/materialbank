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

## v0.8 – Novias färgpalett och standardfärg

- Novias officiella färger finns först bland färgpaletterna: röd `#FF1325`, svart `#000000`, vit `#FFFFFF`, grå `#E5E5E5` och linjegrå `#CCCCCC`. Kompletterande neutrala gråtoner är grupperade nedanför.
- **Novia Design** ger alltid `#FF1325` som startfärg för **nya** markeringar när designläget väljs. Befintliga objekt behåller sina färger.
- Att välja en äldre markering med annan färg ändrar inte standardfärgen för kommande nya objekt; ett verktygsbyte återställer senast aktivt vald ritfärg.
- Paletten markerar den färg som visas i färgväljaren. PWA-cache: `bildbibliotek-pwa-v08`.

## v0.9 – Visningszoom för stora bilder

- Knapp `−`, zoomreglage, `+`, **Anpassa** och **100 %** zoomar enbart arbetsytans förhandsvisning. En nyvald bild anpassas automatiskt till fönstret.
- **✋ Flytta vy** gör det möjligt att dra över stora bilder utan att lägga till eller flytta ritobjekt; Ctrl + mushjul zoomar kring pekaren. Vanlig rullning fungerar också.
- Bildfilens pixlar, markeringarnas koordinater, exporterad PNG/JPEG och GitHub-publicerade filer påverkas inte av visningszoom. Det befintliga **Zoom**-verktyget för exporterade förstoringslinser är separat.
- Bakåtkompatibelt med `.bildprojekt.json` v3. PWA-cache v0.9.

## v0.10 – hopfällbar visningszoom

Zoomverktygen visas som standard inte som en egen rad. Klicka på **förstoringsglaset uppe till höger i bildförhandsvisningen** för att öppna den kompakta panelen med `−`, reglage, `+`, `Anpassa`, `100 %` och `Flytta vy`. Ikonen, krysset, Escape eller klick utanför stänger den. **Flytta vy** stänger panelen automatiskt och låter dig dra runt i bilden. Zoomvärden och originalexport påverkas inte av att panelen öppnas/stängs. PWA cache v0.10.

## v0.11 – Textetiketter kan flyttas med mus

- Textens klickyta är nu hela den ritade textrutan, med 6 skärmpixlars tolerans även när visningszoomen är låg. Tidigare användes endast en liten osynlig punkt i textrutans hörn.
- Efter att du lagt till text växlar appen automatiskt till **Flytta** och väljer den nya etiketten. Klicka och dra någonstans i den för att placera den. Du kan också välja den via **Objekt & lager**.
- Valda lager får företräde vid direktdrag på överlappande objekt. Pixlarnas placering, skärmbildens upplösning och exporten påverkas inte av ändringen.

## v0.12 – Bildserier / Nästa steg

Markera en skärmbild och klicka **+ Nästa steg** i Bildsamling. Välj att behålla, tona ned (standard) eller ta bort gamla markeringar; lägg till en valfri stegbeskrivning. Appen skapar en ny, redigerbar bild med `-steg-02` i filnamnet, sedan `-steg-03` och så vidare. Tidigare steg finns kvar. Nya markeringar får alltid full styrka. Säkerhetsmaskeringar förblir helt opaka även när andra markeringar tonas ned.

Från ett bildseriesteg sparar **Spara redigerbart projekt** hela serien som en v4-projektfil. Bildkällorna lagras en gång och varje stegs lager sparas separat. **Öppna projekt** stöder äldre v3-enkla bilder och v4-serier. GitHub-uppladdningens logg och manifest inkluderar bildseriens stegnummer och beskrivning. Detta kräver ingen inloggning förrän vid GitHub-publicering. PWA-cache v0.12.
