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
