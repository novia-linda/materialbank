# GitHub SOURCE → Renderer 2.0 Zen → Notion och Moodle

**Demoversion, endast fiktiv utbildningsdata.** Undervisningstexten finns bara i GitHub-filen `source.html`; den kopieras inte till Notion.

## Öppna och prova
- [Zen-renderaren](https://novia-linda.github.io/materialbank/github-source-zen-demo/)
- [GitHub SOURCE](https://novia-linda.github.io/materialbank/github-source-zen-demo/source.html)
- [GitHub STYLE](https://novia-linda.github.io/materialbank/github-source-zen-demo/style.html)
- [Moodle testfragment](https://github.com/novia-linda/materialbank/blob/main/github-source-zen-demo/moodle-renderer-kopiera.html)

## Arkitektur
- `index.html` hämtar SOURCE och STYLE från samma offentliga GitHub Pages-mapp med `fetch()`.
- `index.html` använder samma [renderer-core.js](https://github.com/novia-linda/materialbank/blob/main/renderer2-zen/renderer-core.js) som tidigare Zen-renderaren.
- Notion får en extern inbäddning av den publicerade GitHub Pages-webbsidan och vanliga sökbara metadata utanför inbäddningen.
- Moodle kan testa direktläsning av samma SOURCE från GitHub Pages med `moodle-renderer-kopiera.html` i en ny separat testetikett.
- Övningslänkar i SOURCE använder absoluta URL:er för att fungera även när renderaren visas på en annan domän.

## Att testa senare i Moodle
1. Öppna en ny testetikett Text och media i din egen Moodle-kurs.
2. Välj HTML-källkod och klistra in hela `moodle-renderer-kopiera.html`.
3. Kontrollera hur SOURCE, H3/H4, checklistan, frågan och övningslänken fungerar på dator och telefon.
4. Om direkthämtningen blockeras av Moodle/CSP/CORS: testa en tillåten iframe-inbäddning av GitHub Pages-renderaren eller behåll SOURCE i en Moodle Page.

## Viktigt
- Offentliga GitHub-filer får inte innehålla hemliga facit, studentdata eller nycklar. Facit **2500** är bara för en formativ exempelövning.
- Notion embed är en förhandsvisning, inte en GitHub-editor. Uppdatera SOURCE via GitHub och ladda om förhandsvisningen.
- Inbäddad webbsidetext indexeras inte säkert som Notion-native text av AI. Skriv därför lärandemål, sammanfattning och sökord i Notion.
- En SharePoint-video kan fortfarande kräva Novia-inloggning även om GitHub-källan är offentlig.
