# Audit Review: Clarify Student Subject And Paper Count Copy

**Date:** 2026-06-21
**Task id:** `clarify-student-subject-and-paper-count-copy`
**Review type:** `low_risk_ui_copy_repair`
**Runtime claim:** none

## Findings

| severity | findingId    | finding                                                                                  | decision                                                                            |
| -------- | ------------ | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| medium   | HOME-COPY-01 | Static audit found learners may confuse `theory`/`skill` with separate systems or modes. | Clarify these are `subject` groups in student homepage copy.                        |
| medium   | HOME-COPY-02 | Static audit found `20 套` may be misread as per-paper question count.                   | Clarify the list shows up to 20 `paper` items and card question count is per-paper. |

## Audit Conclusion

The low-risk UI copy repair is locally covered by a focused unit test. It closes the static wording ambiguity for the student homepage, while browser/e2e runtime proof remains explicitly deferred by the current approval boundary.
