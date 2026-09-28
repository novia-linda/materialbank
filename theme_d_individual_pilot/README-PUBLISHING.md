# Theme D Individual Evidence Lab - CS-D-1.0

## Publish separately from the group case
Put the CONTENTS of this package in `materialbank/theme_d_individual_pilot/`.
The directory name can stay the same as the tested pilot: this is now the complete course version.
Do NOT overwrite the group case in `theme_d/`.
The app has five direct views (Start here + Levels 1-4). All teaching text is English.

Files in `materials/` are the original student sources, not finished FAQ solutions.
`data/questions.json` holds the 20 public questions and configuration, without the teacher answers.
`instructions/` contains the five readable instruction pages plus editable SOURCE fragments.
`guides/` holds Google and reporting support. `fallback/` holds the equivalent Word templates.
`examples/` is for optional teacher guidance images; KEEP your existing PNG files.

## Updating the tested pilot
Replace index.html, app.js, report.js and styles.css. Add/replace data/questions.json and the folders above.
Old data/pilot.json is no longer used and may be removed. Never put teacher keys in the public folder.
The full version intentionally uses a NEW local-draft identity; it does not silently relabel old dummy answers as assessed work.
Download any old pilot backup before replacing it. It remains a pilot backup, not final evidence.

## Check after publishing
Open index.html via HTTPS; the header shows CS-D-1.0 / UI 2.0.
Try Start here, add two images and words, then download/open DEMO-Do-Not-Submit.pdf.
Open each instruction page and its document links. Try a level, a genuine screenshot, PDF and backup/restore.
Optional examples appear only when their matching PNG loads. Teacher examples must never count as student evidence.

## Editable questions
Keep each question ID stable. The sourceOptions are level-wide; the public data does not reveal the answer's source.
Changes must be reflected in the private marking key and original sources where necessary.
Keep `protectedChangeTopics` and the invariant that Levels 1-3 never test the Level 4 changed rule.
Increment contentVersion for substantive changes. This intentionally separates local drafts by content version.
Backups are tied to the app ID, version and level. Do not promise automatic migration between unrelated versions.

## Private and local data
No report text, screenshots or backups are uploaded to this website. There is no Gemini API connection.
Only the question JSON and optional example images are requested by the app.
After loading, report generation is local. Offline reopening of the site is not guaranteed.
PDF export uses the bundled report engine, not an external PDF service or a CDN library.

The teacher package contains private answer keys and should never be committed to this public repository.
