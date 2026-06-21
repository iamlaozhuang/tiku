# Audit Review: Decide Paper Count And Question Type Policy

**Date:** 2026-06-21
**Task id:** `decide-paper-count-and-question-type-policy`
**Review type:** `product_policy_decision_package`
**Runtime claim:** none

## Findings

| severity | findingId | finding                                                                                                    | decision                                                                                   |
| -------- | --------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| medium   | PAPER-01  | `paper_question` can associate many questions with a `paper`, but no product maximum was documented.       | Published `paper` is capped at 100 questions; draft `paper` is capped at 100 questions.    |
| medium   | PAPER-02  | Student and admin experiences need a performance acceptance target before a hard limit can be implemented. | Future implementation must prove 100-question service and UI behavior before closure.      |
| medium   | QTYPE-01  | Canonical `question_type` values exist, while legacy aliases remain accepted in student paths.             | Aliases are compatibility inputs only and must not be emitted as formal data.              |
| medium   | QTYPE-02  | Removing aliases immediately could break stored snapshots or older student flows.                          | Alias removal is gated by inventory evidence, deprecation approval, and no earlier target. |

## Audit Conclusion

This task closes the audit item as a product policy package. It does not enforce question-count limits, remove aliases, change runtime behavior, or claim runtime verification. Follow-up implementation must be split into validator/service, student guard, admin UI, alias inventory, and runtime verification packages.
