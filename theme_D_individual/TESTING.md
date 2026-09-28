# Simple Start here v1.2 - tested in this update

Start here now contains only a name, two arbitrary image slots, two short demo-text
fields, a practice checkbox and demo PDF export/open confirmation. No knowledge
question, no source verification, no assistant setup and no substantive reflection.
Both image slots are used. Built-in demo images are available as an alternative.

Passed in a local injected Chromium document (not the live GitHub Pages site):
- simple blank/complete primer and a one-page A4 demo PDF;
- no knowledge/source tasks or assistant-name field shown in the primer;
- own image upload and built-in demo images;
- arbitrary text, checkbox, preview, PDF export and completion message;
- local-storage-unavailable fallback;
- backup/restore of text and both images in a fresh browser context;
- migration of an older primer backup (retains name/images, resets old practice);
- offline export after loading, without network-dependent PDF libraries;
- long-text HTML fallback with HTML escaping;
- direct Level 1 navigation and independent Levels 1-4;
- all four real level forms and A4 PDF export;
- existing Level 1-4 backup compatibility, including a failed update experiment;
- unchanged Level 1-4 question data and code/data parity of both delivery formats;
- hidden optional-example links when images are absent;
- no horizontal page overflow at 390 px, and no uncaught page errors.

The demo PDF was opened, its text inspected and its rendered page visually checked.
Native IndexedDB persistence and real optional-image loading on the published site
remain checks for the teacher. Navigation to a hosted/local server is restricted
in this testing environment. No Gemini or Moodle integration is claimed.

# Teacher acceptance test - Pilot B

## Try in your normal browser after publication

- Open Start here; type a name and a few words in each demo-text box, then tick the practice checkbox.
- Add TWO arbitrary images, or use the demo image buttons. Download and open `DEMO-Do-Not-Submit.pdf`.
- Open Level 4 without doing Levels 1-3 in this browser.
- Use the dummy-fill button, then replace at least one image with a real screenshot.
- Crop the image so relevant text remains readable. Preview the A4 page.
- Check the first/latest check, warning and cross symbols.
- Confirm that a failed update experiment can still be documented and exported.
- Download a backup. Clear that level only, then restore the backup.
- Confirm the text AND screenshots return.
- On the actual GitHub Pages address, wait for `Saved on this device`, refresh and
  verify the local draft returns. This checks real origin-specific browser storage.
- Disconnect temporarily only after the workspace has loaded. Keep the tab open.
  Export the PDF or a backup; then reconnect before using Gemini or Moodle.
- Open the PDF in the viewer you normally use for Moodle marking.
- Compare readability at your usual zoom with the approved B layout.

## Checked in the development test environment

The pilot was exercised in a Chromium browser with the app document injected
locally. Browser navigation in this environment was restricted, so these tests
were not a live test of the published GitHub Pages address.

Passed checks included:
- primer and all four levels, without prerequisite locking;
- one-page A4 PDF creation for every level and an incomplete draft;
- original-source acknowledgement and exact-location completeness checks;
- a failed source refresh remains exportable;
- actual PNG/JPG/WebP uploads, user-selected cropping, preserved aspect ratio;
- backup of text and images, restored into a fresh browser context;
- incompatible backup rejection without replacing work;
- separate level drafts within a session;
- offline banner, PDF export and HTML export after loading;
- long-text overflow warning before PDF export;
- preview dialog and Escape closing;
- no horizontal page overflow at 390 px;
- no uncaught JavaScript errors in the exercised flows;
- early test metadata excludes the Level 4 policy-change topic.

Generated PDFs were opened and rendered for visual inspection. They are one page,
A4 portrait, with embedded images and compact vector status marks.

## Not claimed as tested

Native IndexedDB persistence across reopening the real GitHub Pages site could not
be verified in the isolated browser origin. The storage-unavailable fallback was
tested, and portable backups were restored successfully. Test native persistence
on your published URL and your students' normal browser settings.

Gemini, personal Google accounts, Drive refresh and Moodle submission are outside
this pilot's integration: it does not call those services. This pilot does not
verify a live Gem or change any Moodle settings. Additional browser/platform
coverage and a full accessibility audit remain outside this prototype test.


## Optional teacher screenshot update - 28 September 2026

The new help-image paths and interactions were exercised in an injected local
Chromium 144 app. Native image load/error events received synthetic HTTP image
responses through the test harness; this was not a live GitHub Pages test.
Browser navigation is restricted in the execution environment.

Passed checks:
- Missing images leave no example links or broken image placeholders
- One PNG shows only its matching link, with the correct relative path
- Teacher preview leaves student evidence, progress and form contents unchanged
- Escape closes and restores keyboard focus
- Clicking the backdrop closes the dialog
- Invalid image bytes with a 200 response remain hidden
- Own screenshot uploads work; teacher examples never enter the report scene
- Previously loaded example can be reopened without another network request
- A removed image hides its link in a fresh app session
- Guidance belongs to the correct level and slot, not the previous level
- Primer supports optional guidance without changing submission requirements
- Backup format is unchanged and contains no teacher guidance
- Text and screenshot backup restores in a fresh app instance
- Original evidence-first A4 report preview still renders
- Mobile example dialog fits a 390px viewport without horizontal overflow
- Invalid optional paths fail closed without breaking the report app
- No uncaught JavaScript errors in exercised flows

The existing report.js is byte-for-byte unchanged. Question IDs, question content,
contentVersion, draft keys and backup schema were preserved. No dummy teacher
example PNGs are shipped; only the filename guide is in examples/.

After publication, add one real PNG under examples/, refresh the live page and
check its button. Test the published URL in the browser used by your students.
The optional example does not appear if its image cannot be loaded; that should
not stop any core form or export operation.
