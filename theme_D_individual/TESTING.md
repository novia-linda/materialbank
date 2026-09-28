# Teacher acceptance test - Pilot B

## Try in your normal browser after publication

- Open the primer; record a practice answer and exact source location.
- Add one screenshot. Download and open `DEMO-Do-Not-Submit.pdf`.
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
