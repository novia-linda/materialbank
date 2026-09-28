# Theme D Individual Evidence Lab - Pilot B

This is a teacher-testing pilot, not the final student assignment.
The visible app and report labels are in English. Content version: `pilot-b-1.0`.

## What to upload

Use a NEW folder in the existing `materialbank` repository, for example:

`theme_d_individual_pilot/`

Upload the contents of this ZIP directly into that folder. Do not replace the
existing `theme_d` group-work app. The expected new Pages address, after you
publish this folder, is:

`https://novia-linda.github.io/materialbank/theme_d_individual_pilot/index.html`

This package does not publish anything by itself.

Files:
- `index.html`: app shell
- `styles.css`: app appearance
- `app.js`: forms, source checks, images, backup and local drafts
- `report.js`: measured one-page PDF / HTML report rendering
- `data/pilot.json`: editable dummy content and level configuration
- `data/README.md`: content-editing notes
- `TESTING.md`: a short teacher acceptance test and tested / untested scope

No account, API key, build step, database server, external font or CDN is required.
The hosted version fetches its JSON once at startup. All levels are then available
in the open tab. PDF creation is performed on the device, without a remote service.

## Quick teacher test

1. Open Start here and try the short practice question.
2. Add a screenshot, or use `Use a dummy image`.
3. Preview and download the demo PDF. Open the downloaded file.
4. Open Level 4 directly. Earlier levels are not technically locked prerequisites.
5. Expand `Quick try for the teacher` and use `Fill this level with dummy examples`.
6. Edit a test answer and reconfirm its original-source check.
7. Replace a dummy image with one of your own screenshots. Try the optional crop tool.
8. Download the Level 4 PDF and judge readability in your usual PDF viewer.
9. Download a backup, clear that level, then restore the backup.

The example for Level 4 deliberately includes both a corrected partial response
and a source-update test that did not succeed. This must not prevent export.

## One level, one session, one PDF

Each level has independent fields. Students do not need a previous level's draft
or PDF to open the next level. The real learning task will still be cumulative.

The final course's normal workflow will be:
Choose a level -> work and report -> download PDF -> open and check it -> upload
to Moodle. In this PILOT, every output is labelled as a test and must not be submitted.

The primer is a technical rehearsal, not a graded level. Its PDF is named
`DEMO-Do-Not-Submit.pdf`. A second screenshot is optional in the primer.

## What the report does and does not prove

The report contains two wide screenshots at the top, then five compact test rows
(one row for the primer), exact original-source references and short closing notes.
First and latest results are shown as a check, warning triangle or cross. The PDF
uses vector versions of those marks so that it does not depend on an emoji font.
A small legend explains them.

The app checks documentation completeness. It does NOT know whether a source
actually supports a student's answer, and it does not assign a grade. Reports with
missing fields can be exported as drafts. Reported incorrect answers and a failed
refresh experiment are never converted automatically into a successful result.

Exact source locations are required for the documentation indicator. Selecting a
source type by itself is not enough. Changing an answer or a test result resets the
student's source-verification acknowledgement so that it can be checked again.

## Saving and privacy

Text and screenshots remain in browser memory and, where available, IndexedDB on
that device. Nothing entered into the form is sent to GitHub, Google, Moodle or an
analytics service. Hosting providers may still receive normal page requests.

A successful local transaction changes the indicator to `Saved on this device`.
If storage is unavailable or a write fails, a warning appears; the open tab still
contains the current work. No promise of permanent browser storage is made.

The backup JSON includes the current level's text, results, references and both
screenshots, including the uncropped originals retained by the crop tool. It can
be restored into the same content version on another device. A PDF is not an
editable backup. Restore validates the file and asks before replacing a level.
Other levels are left unchanged. Incompatible versions are rejected without
changing the current draft.

Keep one editing tab per level. The app warns when another tab saves the same
level, but this is not a multi-user collaborative editor.

## Offline scope

After the workspace is fully loaded, form editing, image selection, backup and PDF
export use local resources. Keep the tab open if the connection drops. Reopening
the hosted page while offline is NOT supported by this pilot. Gemini, Drive updates
and Moodle submission still require a working connection.

No service worker or offline installation is added. The separately supplied
single-file HTML preview embeds a snapshot of the question file and can be used
for a convenient local test. It does not follow later edits to GitHub JSON.

## PDF layout and long text

The direct export is one A4 page, using the selected evidence-first B layout.
The form deliberately asks for summaries instead of whole chat transcripts.
A measured layout check prevents export when text would overflow. It identifies
what to shorten rather than clipping text or reducing it to unreadable sizes.

Screenshot aspect ratios are preserved. The default is to fit the whole image.
Cropping occurs only when the user selects an area and confirms it. Screenshots
are normalised locally; exceptionally large PNGs may be converted to high-quality
JPEG for a manageable backup. The PDF embeds screenshots as JPEG images.

Latin text is written as selectable PDF text using standard Helvetica. A line
containing characters outside WinAnsi is rendered as a high-resolution text image
using the device's available fonts. Those particular lines are not searchable text.
The PDF is not a fully tagged accessibility PDF. The HTML fallback keeps a readable
alternative, including a long-form version when the one-page layout is too full.

## Scope of this pilot

This delivery intentionally does not contain the final company dataset, final
student source documents, the final five Moodle SOURCE pages, or a private teacher
answer key. Those follow AFTER the teacher has approved this workflow and report.
The existing group-work app has not been modified.

The final policy change introduced at Level 4 must not affect the questions in
Levels 1-3. The pilot question metadata follows that rule and is validated at load.
This metadata check is a safeguard, not a substitute for reviewing actual wording.
