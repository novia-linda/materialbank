# Paper Labs 02 – Projekthanteraren

En fristående, statisk GitHub Pages-app som arbetar **endast** med privata GitHub-repositories via en Fine-grained PAT som användaren anger i sessionen. Den delar projektstruktur med kommande delappar men kräver ingen server eller databas.

## Anslutning

- Publik appkod: `novia-linda/materialbank/paper-labs/02-projects/index.html`.
- Förvalt **privat** datalager: `novia-linda/data`, branch hämtas från GitHubs repositorymetadata.
- Appen accepterar inte skrivning om GitHub svarar att repot är offentligt.
- PAT måste ha åtkomst till det privata repot med `Contents: Read and write`.
- PAT finns bara i JavaScript-minnet under sessionen; ingen localStorage, IndexedDB, sessionStorage, cookie eller loggning av nyckeln används. Fältet töms direkt efter anslutningen. Vid omladdning får PAT matas in igen.
- All API-trafik går till `api.github.com`, inte till Materialbanken.

## Vad kan App 02?

1. Visa befintliga `PROJ-00001` ... `PROJ-99999` i det privata repot.
2. Skapa nytt projekt **lokalt** och sedan spara det till privata GitHub.
3. Öppna befintligt projekt och välja vilka av sex delar som faktiskt laddas. Alla valda som standard. Omarkerade delar går inte att spara av misstag.
4. Ta emot kompletta strukturerade JSON-filer eller lägga till bilder/ljud/video från enheten som testmaterial.
5. Importera markerade delar från ett annat privat projekt med **Lägg till** eller **Ersätt lokalt**. Projekt-ID för målet förändras inte.
6. Vid import av bilder/ljud/video kopiera **de verkliga binära filerna** från källprojekt till målprojekt (inte bara deras sökvägar). Kopiering utförs först när de berörda delarna sparas.
7. Spara alla eller utvalda delar. Omarkerade category-manifest ändras inte. GitHub SHA används för att upptäcka konflikter.
8. Ladda ned en lokal JSON-översikt (utan mediefilernas bytes) och se statusloggen.

Den här delappen är avsiktligt inte en videoredigerare, en riktig ljudinspelare eller en fullständig storyboardredigerare. De funktionerna får egna appar senare.

## Gemensam privat projektstruktur (version 1)

```text
paper-studio/
  projects/
    PROJ-00140/
      project.json
      storyboard.json
      timing.json
      overlays.json
      media/
        images.json
        images/<filnamn>
        audio.json
        audio/<filnamn>
        videos.json
        videos/<filnamn>
```

`project.json`: `{schemaVersion, id, title, createdAt, updatedAt, layout, categories}`.

`storyboard.json`: `{schemaVersion:1, scenes:[{id,title,cues, ...}]}`.

`timing.json`: `{schemaVersion:1, events:[], edits:[]}`. Om `events[].takeId` finns ska tillhörande inspelning importeras eller redan finnas i målprojektet.

`overlays.json`: `{schemaVersion:1, items:[{id,text,start,end,x,y,animation, ...}]}`. Tider behöver granskas efter import till annan berättelse.

`media/images.json`, `media/audio.json` och `media/videos.json` är manifest med `{schemaVersion:1, items:[{id,name,path,mime,size,sha}]}`. Varje `path` är relativ till projektmappen och ska peka på en fil i rätt mediemapp.

## Säkerhet och begränsningar

- Max 20 MB per enskild bild/ljud-/videofil i första testversionen. Större media ska hanteras av kommande specialappar.
- GitHub Contents API skapar separata commits per sparad fil och del. En större sparning är alltså **inte atomär**. Om nätverket bryts kan vissa delar redan vara uppladdade; loggen visar vilka. Appen ska då inte påstå att allt är klart.
- Vid 'Ersätt' av mediamanifest raderas inte gamla mediefiler automatiskt från Git. Det är avsiktligt, för att undvika oavsiktlig dataförlust.
- Appen flyttar inte automatiskt redan existerande offentliga Paper Studio-inspelningar från Materialbanken. Sådan migrering behöver ett separat kontrollerat flöde och efterföljande granskning av eventuell offentlig Git-historik.
- Ingen lokal autosparning används i denna delapp; det är en senare separat funktion. Appen varnar vid sidstängning när det finns osparade lokala ändringar.
- GitHub-anslutningen som ChatGPT använder är separat från användarens PAT i webbläsaren.

## Testat lokalt

Det finns ett Playwright-test med **simulerat GitHub API**, som kontrollerar privat anslutning, projekt 141/142, uppladdning och kopiering av binära bilddata, selektiv import, selektiv öppning, versionskonflikt, blockerat offentligt repo och mobilvy utan horisontell scroll.

Detta ersätter inte testet med användarens egen PAT i Safari och det privata repot.
