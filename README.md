# Materialbank – GitHub Pages

Detta paket är byggt för det publika GitHub-repot `novia-linda/materialbank` och använder gemensam CSS och JavaScript.

## Gemensamma filer

- `assets/css/shared.css` – design för alla sidor
- `assets/js/shared.js` – gemensamma interaktioner, kopieringsknappar, vägval och framtida projekt-/finansiärbranding
- `assets/brand/` – reserverad för framtida projekt- och finansiärlogotyper
- `assets/copilot/` – Copilot-skärmbilder
- `assets/vids/` – Google Vids-skärmbilder

## Sidor i roten

- `index.html` – materialbankens startsida
- `01-vad-ar-en-ai-agent.html`
- `02-skriv-instruktioner-till-ai-agent.html`
- `03-bygg-agent-i-microsoft-copilot.html`
- `04-gemini-gem-demo-manuskript.html`
- `google-vids-snabbstart-smaforetagare.html`

## Visuellt material

Mappen `skapa-video/` behåller sitt befintliga namn för att gamla länkar och GitHub-filer ska kunna skrivas över, men innehållet är nu en fristående verktygslåda – inte en steg-för-steg-kurs.

- `skapa-video/index.html` – översikt: **Skapa visuellt material med AI**
- `skapa-video/01-planera-video-med-ai.html` – **Planera innehåll med AI**, med val för video eller bilder/visuellt material
- `skapa-video/02-hitta-farger-med-ai.html` – fristående färgguide
- `skapa-video/03-valj-bildstil.html` – fristående bildstilsguide
- `skapa-video/04-skapa-bilder-som-hor-ihop.html` – fristående guide för konsekventa AI-bilder
- `skapa-video/06-redo-att-publicera.html` – publiceringskontroll med val för video eller bildmaterial

Google Vids-guiden är den enda sidan som tydligt rekommenderar förberedelser och länkar tillbaka till planering, färger, bildstil och bildserie. Den kan ändå användas direkt av den som redan har bilder.

## Företagscase

`foretagscase/index.html` leder till fyra anonymiserade exempel. Vasabladet-länken är fortfarande en platshållare tills den riktiga artikeladressen läggs in.

## Uppdatera GitHub

Packa upp ZIP-filen och ladda upp **innehållet** till roten av `materialbank`. När ett filnamn är identiskt med en befintlig fil kan du ersätta den gamla filen med den nya. Paketet använder inga versionssuffix i sidnamnen.

De befintliga mapparna `Images Theme B/`, `vids instructions/`, `Drive_delning/` med flera behöver inte raderas. Flera guider använder redan publicerade GitHub Pages-resurser från `Images Theme B/`.

## Hitta rätt material – metadata och resursmotor

- `hitta.html` – publik sök-/rekommendationsmotor. Ingen AI används.
- `data/resources.json` – hela resurskatalogen i strukturerad form.
- `data/external-resources.json` – här kan Novia Video-länkar, artiklar och andra externa resurser läggas till.
- `data/README.md` – visar exakt hur metadata och externa resurser skrivs.
- `build_catalog.py` – läser metadata från HTML-sidorna och bygger katalogen.
- `.github/workflows/build-catalog.yml` – kör katalogbygget automatiskt på GitHub när HTML/metadata ändras.
- `assets/js/resource-engine.js` – vanlig JavaScript-logik för sökning, filtrering, ranking och personlig lista.

Varje sökbar HTML-sida innehåller `materialbank:*`-metadata i `<head>`. Det gör att själva materialbanken är källan för taggningen. FramtidsHUB behöver alltså i princip bara länka vidare till exempelvis `hitta.html`; tagglogik och resurskatalog behöver inte dupliceras där.

Resurser med `materialbank:status = draft` visas inte i den publika motorn. Gemini-demo-manuset är därför taggat men dolt tills en riktig företagarversion byggs.

## Pilot-inspirerad design

Materialbanken använder nu samma visuella grundidé som FramtidsHUB-piloten: varm pappersbakgrund, mörk toppnavigation, rundade kort, gula hjälpfält, röda accenter och tydliga vägval. Typsnittet är fortsatt **Be Vietnam Pro**.

Designen styrs centralt i `assets/css/shared.css` och interaktivitet i `assets/js/shared.js`. Pilotens abstrakta SVG-resurser ligger i `assets/site/`.

Det betyder att kommande projekt-, EU- eller finansiärkrav fortfarande kan införas centralt utan att varje guidesida behöver byggas om.
