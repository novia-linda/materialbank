# Lindas läsrum

Personlig läsarapp: mobil hyllvy och Instagramliknande flöde med teman, favoriter, kvitteringar, kommentarer och etiketter. Vite + JavaScript, Firebase Authentication/Firestore och GitHub Actions. Publiceras separat på Vercel med **Root Directory `lasrum`**.

**Börja med [STARTA-HAR.md](STARTA-HAR.md)** för Firebase, konto, Vercel och schemalagd hämtning.

```bash
npm ci
cp .env.example .env.local
# Fyll i webbkonfigurationen från ditt Firebase-projekt.
npm run dev
```

```bash
npm test
npm run test:rules
npm run build
```

Regeltesterna använder Firestore-emulatorn, Java 17+ och testprojektet `demo-lasrum`; de använder ingen riktig databas. Starta inte utvecklingsservern med en administratörsnyckel i VITE-variablerna.

| Del | Ansvar |
| --- | --- |
| `src/reader.js`, `style.css`, `shell.js` | Befintligt gränssnitt, utan den gamla pilotens lokala datalagring |
| `src/main.js`, `model.js` | Inloggning, läsning, köat molnsparande av ändrade dokument |
| `firestore.rules` | Endast förhandsgodkänd ägare; flödet skrivs endast administrativt |
| `tools/setup.mjs` | Skapar första konto och importerar offentligt startmaterial |
| `tools/refresh.mjs`, `sources.mjs` | Daglig hämtning; bevarar tidigare innehåll vid fel |
| `data/seed.json` | 79 offentliga startposter, inga personliga anteckningar |
| `public/media/` | 69 små omslagsbilder, inga originalvideor |
| `workflows/lasrum-refresh.yml` | Kopia av workflow som installeras i repositoryts `.github/workflows/` |

Datamodell: `access/{uid}` administrativ ägarlista; `feed/{encodedId}` gemensamt innehåll; `meta/seed` hämtningsstatus; `users/{uid}/settings/main` inställningar; `users/{uid}/marks/{encodedId}` markeringar och personliga arkivkopior. Inläggs-ID kodas till hex för att snedstreck i RSS-GUID inte ska bli Firestore-sökvägar.

Läsningar sker när appen öppnas. Uppdateringar syns på andra enheter efter omladdning. Ingen realtidssynk eller beständig offlinekö i denna pilot. Senaste skrivningen till samma dokument vinner. Import ersätter personliga inställningar/markeringar och bör göras utan samtidig redigering på annan enhet.

RSSHub är låst till versionen som fungerade i det tidigare testet. Beroendet har separat AGPL-3.0-licens: https://github.com/DIYgod/RSSHub . Dess källkod och licens följer paketet; denna app använder RSSHub som ett oförändrat hämtningsverktyg i ett separat Node-jobb. Respektera respektive originaltjänsts villkor och upphovspersonernas material.

## Verifiering vid leverans

Se `VERIFIERING.md`. En riktig Firebase/Vercel-anslutning kräver användarens projektkonfiguration och har inte körts mot ett produktionskonto här.
