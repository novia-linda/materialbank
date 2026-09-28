# Theme D - public GitHub package

Upload this folder's **contents** into `materialbank/theme_d/`. The entry file remains `index.html`.

```
index.html
styles.css
app.js
data/
materials/
guides/
```

Replace the prototype app and question banks together. Wait for the GitHub Pages deployment to finish, then hard-refresh the page and confirm that the header shows Case NF-D-1.0. Do not create a second nested `theme_d` folder. Keep unrelated repository files.

The app reads the question banks using `fetch`, so use GitHub Pages / HTTPS or a local HTTP server. Double-clicking index.html is not the intended workflow.

Student documents are in materials. Task and Google guides are in guides. Every source document is fictional training content. The shipment TXT and CSV are static alternatives, not live data connections.

## Data and progress

Edit data/questions-4.json and data/questions-5.json to update question text and checkbox labels. Keep caseId and groupSize correct; keep question IDs stable for the same question. Increase the revision after a substantive change. Arrays control the order. Private answer keys must match the IDs and version, and follow the same display order.

The app requires an answer, a correct final result, an exact evidence note for every checked source, and a checker before marking a question verified. A failed first test also requires a change/action and correct retest. These are self-reported judgements, not automatic marking.

Progress is stored only in the current browser. It is not a shared group document, a cloud backup or a Moodle submission. Download a JSON backup before moving device. HTML/PDF reports are readable exports, not progress backups. No teacher-key data enters the student backup or report.

## Privacy

Do not upload any teacher answer keys, source matrices or maintenance masters to this public folder. Teacher mode only reads a key explicitly chosen from the teacher's own computer. Clear it and close the tab when finished.

There are no Gemini API calls, credentials, analytics or backend writes in the app. It fetches its public question data. Students copy prompts to Gemini separately.

## Browser test

From this folder: `python -m http.server 8000`, then open http://localhost:8000. Use a current desktop browser; mobile layout is supported but group work is best done on a computer.

App engine: v2. Case: NF-D-1.0. Exercise snapshot: 12 June 2026 at 14:00, Finland local time.
