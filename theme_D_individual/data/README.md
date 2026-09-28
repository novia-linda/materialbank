## Start here in UI v1.2

The primer has an empty questions array and no sourceIds. It is only a technical
check: name, two images, two demo text fields and one checkbox. Both images are
required for the completion indicator; incomplete PDFs are still exportable.
Level 1-4 questions and contentVersion are unchanged. The primer uses a separate
local draft suffix to avoid restoring the removed opening-time question.

# Editing the pilot content

`pilot.json` is the editable content file. HTML/CSS/JavaScript are the engine.
In the separately supplied single-file preview the same JSON is embedded as a
snapshot. Change the hosted JSON for ongoing work; the local preview is not linked.

## Stable identities

Keep each level's `id` and each question's `id` stable when making minor wording
changes. Bump `contentVersion` for a change in meaning, expected evidence or schema.
Drafts and backups are separated by content version to avoid mixing assignments.

## Important fields

- `sources`: names and short report labels for original sources
- `levels[].sourceIds`: original-source options offered on that level
- `levels[].questions`: ID, short report label, full question and topic
- `levels[].screenshots`: two clear evidence briefs; the second is optional in the primer
- `levels[].experiment`: adds the non-mandatory-success update experiment
- `protectedChangeTopics`: topics reserved for the management change at Level 4

For this pilot, `return-window` is the reserved policy-change topic. It is absent
from all Level 1-3 questions. Do not create indirect earlier dependencies on this
rule when the final content is developed.

## Dummy examples are NOT private answer keys

Every question has an `example` object for the teacher's quick-fill button.
Those examples are PUBLIC dummy content and are deliberately visible in this pilot.
DO NOT place a confidential teacher answer key here. The final app should remove
pilot quick-fill data and use a separate private answer-key workflow.

## Question quantity and page fit

Level 1-4 each contain five questions. The engine calculates the progress count
from the data, not from a hidden hard-coded total. Adding many questions may exceed
the one-page PDF budget; check the preview. The preferred final design remains
five report rows, two screenshots and short conclusions per level.

## No silent answer marking

The source options do not reveal which option is correct. Students choose original
sources and type exact locations. Their status and verification acknowledgement
are self-reported. Neither the public JSON nor the PDF renderer auto-marks answers.

## Optional teacher screenshot guidance

Each screenshot slot now has `exampleFile` and `exampleDescription`.
The default files are `examples/level-1-screen-1.png` through
`examples/level-4-screen-2.png`, plus `examples/primer-screen-1.png` and
`examples/primer-screen-2.png`. You normally only upload images; no JSON edit is
needed. Set `exampleFile` to false to disable a particular slot explicitly.
Only relative image basenames are accepted; directory traversal and remote URLs
are not accepted. The app loads the file from its own examples/ folder.

`appRevision` identifies this optional UI update. `contentVersion` remains unchanged
so this update does not invalidate existing local drafts or backups. Example images
are help material, not expected answers and not student report evidence.
