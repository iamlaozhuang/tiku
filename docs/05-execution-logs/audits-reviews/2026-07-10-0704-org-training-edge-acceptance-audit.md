# 2026-07-10 0704 Organization Training Edge Acceptance Audit

## Result

- Status: blocked, repair required.
- Task: `0704-org-training-edge-acceptance-2026-07-10`.
- Branch: `codex/0704-org-training-edge-acceptance`.
- Blocking category: `missing_answer_deadline_persistence_and_answerability_enforcement`.

## Adversarial Review

- Role boundary: partial pass. Existing tests cover standard/advanced organization training boundaries, but deadline
  behavior must be repaired before the edge acceptance can close.
- Data boundary: pass for inspected non-deadline markers. Existing policy keeps enterprise training out of formal
  `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- Tenant boundary: partial pass. Publish scope and visibility checks exist, but deadline repair must preserve the same
  organization-scope enforcement.
- Employee/admin boundary: pass for inspected markers. Admin surfaces remain summary/status oriented and raw employee
  answer evidence is blocked.
- Lifecycle boundary: blocked. Published/taken-down and duplicate-submit categories exist, but deadline cutoff is not
  persisted or enforced.
- Source boundary: pass for inspected markers. `mock_exam` is denied as a first-release source; organization AI output
  remains in the training draft domain and no Provider execution occurred.
- Environment boundary: pass. No direct DB, destructive DB, Provider, staging/prod/deploy, env/secret, package, lockfile,
  screenshot, trace, or raw DOM action was executed.

## Required Repair

- Add answer-deadline persistence to organization training version data.
- Add publish input/validation/route/repository wiring for optional `answerDeadlineAt`.
- Make employee visible-list, draft-save, and submit answerability fail closed after the deadline.
- Preserve takedown, duplicate-submit, organization scope, formal-domain separation, and redacted evidence boundaries.

## Recommendation

- Close this validation task as blocked.
- Run `0704-org-training-deadline-answerability-fix-2026-07-10` before continuing the serial queue.
- After repair closeout, run `0704-org-training-edge-acceptance-rerun-2026-07-10`.
