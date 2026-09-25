# Nordic Freight · Knowledge Assistant Test Lab

First working prototype for AI for Business Theme D.

## Public GitHub Pages files

Upload the contents of this folder to a public GitHub Pages folder, for example:

`theme_D/test-lab/`

Files:

- `index.html` – app shell
- `styles.css` – visual design
- `app.js` – app logic
- `data/questions-4.json` – public 4-person question bank
- `data/questions-5.json` – public 5-person question bank

The app must be opened through GitHub Pages / HTTPS. The question files are loaded with `fetch()`, so double-clicking `index.html` as a `file://` URL is not the intended workflow.

## What the prototype already does

- choose 4- or 5-person question bank
- 20 questions in both versions
- record whether the Gem answered correctly, partly correctly or incorrectly
- verify each answer against one or more original source types
- require at least one source before a question can be marked verified
- diagnose retrieval/knowledge/instruction problems
- autosave progress in the current browser with `localStorage`
- download a JSON backup and restore it later
- generate a final test report
- print / Save as PDF through the browser
- download the report as a standalone HTML file
- load a private teacher answer-key JSON from the teacher's own computer
- choose a random teacher question

## Updating student questions later

Edit only the appropriate JSON file in `data/`.

Each question needs an ID that stays stable, for example:

```json
{
  "id": "Q07",
  "question": "Can I collect my shipment on Saturday?"
}
```

A question may also have an instruction shown before the group asks it:

```json
{
  "id": "Q20",
  "question": "Can the Gem use the changed shipment information?",
  "instruction": "Change one row in the Google Sheet, save, wait about one minute and then ask the Gem."
}
```

Keep the IDs stable if a private teacher answer key already exists. The teacher file connects to the public question through the ID, not through the wording.

## Important: teacher answer keys

Do **not** upload teacher answer-key files to the public GitHub repository.

The app contains a Teacher mode that lets the teacher choose a local `.json` answer-key file. The browser reads it locally; the file does not need to be hosted.

See the separately delivered teacher sample package for the answer-key format.

## Prototype content

The current 20-question banks are draft content created to test the app workflow. They should be replaced/verified when the final Nordic Freight source documents are created.
