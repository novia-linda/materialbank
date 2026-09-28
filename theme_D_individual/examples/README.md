# Optional teacher example screenshots

No example PNG images are bundled. This is intentional: links stay hidden until
you provide the corresponding image. The README keeps this folder in the repository.

## Exact location

Put images in `examples/` beside this app's `index.html`.
With the proposed folder, use:
`materialbank/theme_d_individual_pilot/examples/`

Do not upload these into the group-work `theme_d` folder. If you use a different
folder name for the individual app, the examples folder simply moves with it.

## Filenames and content

Use these lowercase filenames without spaces. Save/export an actual PNG file;
do not merely rename a JPG filename to .png.

| Filename | Place in app | What to show |
| --- | --- | --- |
| `primer-screen-1.png` | Primer / Screenshot 1 | Any first practice image. Any non-private image or screenshot. This only demonstrates the image field; no task content is needed. |
| `primer-screen-2.png` | Primer / Screenshot 2 | Any second practice image. Any second non-private image. Students try both image fields in the simple technical check. |
| `level-1-screen-1.png` | Level 1 / Screenshot 1 | Your Gem instructions. Show the saved instructions, especially approved sources and how to handle missing information. Example answer text may be hidden. |
| `level-1-screen-2.png` | Level 1 / Screenshot 2 | Your knowledge and a test. Show the policy added as a knowledge source, or the relevant test-response area. It is not necessary to fit two different screens into one image. |
| `level-2-screen-1.png` | Level 2 / Screenshot 1 | Your FAQ with original references. Show a short part of the FAQ with original email or call references. Preserve the structure; the example answers may be hidden. |
| `level-2-screen-2.png` | Level 2 / Screenshot 2 | A response using the new knowledge. Show a relevant question and the Gem response after adding the FAQ. Some answer text may be hidden in this example. |
| `level-3-screen-1.png` | Level 3 / Screenshot 1 | The updated source record. Show the test record ID, the changed field and its new value. Keep unrelated rows and account details out of the crop. |
| `level-3-screen-2.png` | Level 3 / Screenshot 2 | The response to your update test. Show the question about the changed record and what the Gem actually returned. A failed update test is valid evidence too. |
| `level-4-screen-1.png` | Level 4 / Screenshot 1 | The source changes you made. Show a clearly identifiable change to the FAQ, the policy or the added register column. The report text records the other changes. |
| `level-4-screen-2.png` | Level 4 / Screenshot 2 | Your retest result. Show an actual retest after a change. It is acceptable for the source-update experiment to remain unsuccessful. |

## How it works

- Upload any subset. One example image is enough to make its own link appear.
- The app checks when a screenshot section is shown. The button remains hidden
  until the image has loaded successfully. Missing, invalid or unavailable images
  produce no broken link or placeholder in the student interface.
- The button says **See an example**. It opens an accessible dialog, with a
  full-size link, a Close button, and Escape support.
- Replace an image using the same filename to update it. Remove it to remove the
  corresponding link on the next fresh page load.
- After publishing, refresh the app while online. Results are cached only in the
  current open page. Do not refresh while a student is offline and working.
- Examples are optional guidance, never added automatically to a student's draft,
  source checks, backup, progress or exported report.
- The app has no GitHub write connection. Teachers publish images in GitHub;
  students use the upload fields only for their own report evidence.
- Student answer data is never included in the image request.
- The standalone HTML uses exactly the same relative folder: place `examples/`
  next to the downloaded HTML file to test examples locally.

## Before making an example public

Use your demonstration work or fictional data only. Crop out account menus,
private email addresses and anything unrelated. Hide answers with a solid opaque
block and export a flattened image; avoid translucent highlighting. Keep enough
of the interface and headings visible to explain the framing. Do not include a
teacher answer key in the image or its filename. Open the final image yourself
before publishing it.

For the primer, show the practice source or another harmless page, not personal
information. A second primer image is optional. This test PDF is never submitted.

These content descriptions follow the current pilot. The same filenames can be
kept when the final case is introduced; replace only the illustrative images.
