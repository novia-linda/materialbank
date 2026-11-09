# Lindas läsrum

Personlig läsarapp: mobil hyllvy och Instagramliknande flöde med egna källor, teman, favoriter, kvitteringar, anteckningar och etiketter. Vite + Google-inloggning via Firebase Authentication + Firestore. Publiceras separat på Vercel med **Root Directory `lasrum`**.

Börja med [STARTA-HAR.md](STARTA-HAR.md). Den beskriver Firebase, Google-inloggning, adminuppstart, godkännande av vänner, Vercel och den dagliga hämtningen.

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

Använd aldrig administratörsnyckeln i `VITE_`-variablerna. Google-inloggade användare kan skapa en åtkomstförfrågan. Endast godkända användare kan läsa innehåll. Admin kan godkänna och avslå förfrågningar från appen.

| Del | Ansvar |
| --- | --- |
| `src/reader.js`, `style.css`, `shell.js` | Mobilgränssnitt, läsvyer och redigering |
| `src/main.js`, `model.js` | Google-inloggning, vänteläge, admin och privata molndata |
| `firestore.rules` | Förfrågningar, admin och avskilda personliga samlingar |
| `tools/bootstrap-admin.mjs` | Engångsuppstart av första Google-admin och dennes startdata |
| `tools/refresh.mjs`, `sources.mjs` | Schemalagd källhämtning per godkänt konto |
| `data/seed.json` | 79 offentliga startposter och sex exempelkällor |
| `public/media/` | 69 små omslagsbilder; inga originalvideor |
| `workflows/lasrum-refresh.yml` | Kopia av GitHub Actions-filen i repositoryts `.github/workflows/` |

Datamodell: `access/{uid}` innehåller godkännande/adminroll; `meta/seed` är gemensamma startinställningar; `users/{uid}/settings/main`, `users/{uid}/feed/{id}`, `users/{uid}/sourceStatus/{id}` och `users/{uid}/marks/{id}` är privata per användare. Hämtningen läser varje godkänt konto och skriver dess egna inlägg och status utan att ändra personens källista. Gäster kan inte läsa andra kontons material.

RSSHub är låst till versionen som fungerade i det tidigare testet. Beroendet har separat AGPL-3.0-licens: https://github.com/DIYgod/RSSHub . Originalvideor hämtas inte. Respektera respektive originaltjänsts villkor och upphovspersonernas material.

Google- och Firebase-kopplingen kräver att ägaren anger sitt Firebase-projekt. Produktionsinloggningen och körningen i GitHub Actions ska verifieras efter den anslutningen.
