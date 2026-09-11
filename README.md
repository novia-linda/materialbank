# Materialbank – shared CSS/JavaScript structure

This package is prepared for a public GitHub repository served with GitHub Pages.

## Structure

- `01-vad-ar-en-ai-agent.html`
- `02-skriv-instruktioner-till-ai-agent.html`
- `03-bygg-agent-i-microsoft-copilot.html`
- `google-vids-snabbstart-smaforetagare.html`
- `04-gemini-gem-demo-manuskript.html` (teacher/demo planning page)
- `assets/css/shared.css` – all visual styling
- `assets/js/shared.js` – all shared interactions and future project/funder branding
- `assets/copilot/` – Copilot screenshots
- `assets/vids/` – Google Vids screenshots
- `assets/brand/` – reserved for future project/funder logos
- `vba-demo-kunskap.txt` – demo knowledge file

## Why this structure

All public pages now reference the same CSS and JavaScript files. There are no embedded `<style>` or functional inline `<script>` blocks in the pages.

If the project's visual requirements change later, start with `assets/css/shared.css`. The branding variables are at the very top of the file. Changing those variables changes the visual system across all pages.

If a common project/funder strip or logo footer must be added later, edit the `PROJECT_BRANDING` block near the top of `assets/js/shared.js`. It is currently disabled, so the pages keep the current Novia look. Add logo files to `assets/brand/`, enable the block, and all pages can receive the same branding without editing each HTML page.

## GitHub Pages

Upload/merge the **contents** of this package into the root of the `materialbank` repository. Then enable GitHub Pages from the `main` branch / repository root if it is not already enabled.

With a repository named `materialbank`, a page will then have an address such as:

`https://novia-linda.github.io/materialbank/01-vad-ar-en-ai-agent.html`

## Important when renaming files

The HTML files use relative paths. If you rename `assets`, `assets/css/shared.css`, `assets/js/shared.js`, `assets/copilot`, or `assets/vids`, update the corresponding references in the HTML pages.

## Startsida

`index.html` är en enkel innehållsförteckning med länkar till de guider som hittills har skapats.


## Företagscase

`foretagscase/index.html` är en kort ingång till fyra anonymiserade studerande–företagscase.
Varje case har en egen sida och en exakt HTML-kopia som `.txt`. Alla sidor använder samma `assets/css/shared.css` och `assets/js/shared.js`.

Vasabladet-artikeln från 6 maj 2026 har ännu ingen länk i materialet. Byt den inaktiva artikellänken i `foretagscase/index.html` när den riktiga URL:en finns.

`shared.js` löser nu branding-bilder relativt webbplatsens rot, så framtida projekt-/finansiärlogotyper fungerar även på sidor i undermappar.
