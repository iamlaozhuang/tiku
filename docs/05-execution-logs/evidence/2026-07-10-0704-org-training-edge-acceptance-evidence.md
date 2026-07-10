# 2026-07-10 0704 Organization Training Edge Acceptance Evidence

## Scope

- taskId: `0704-org-training-edge-acceptance-2026-07-10`
- branch: `codex/0704-org-training-edge-acceptance`
- mode: validation-only source/test acceptance
- target: enterprise training source, publish, version, takedown, answer, duplicate-submit, resume, and formal-domain
  separation edge behavior.

## Readiness

- Private credential index preflight: pass.
- Core role labels found: 9.
- Credential value output: none.
- Browser login/session capture: not executed.
- Direct DB access/mutation: not executed.
- Provider, staging, prod, deploy, env/secret, Cost Calibration: not executed.

## Source Inspection Result

- Result: blocked.
- Blocked reason category: `missing_answer_deadline_persistence_and_answerability_enforcement`.
- Finding:
  - Enterprise training DTO/UI surfaces include an answer-deadline status category.
  - Publish input and persistence do not carry the answer-deadline value end to end.
  - Version answerability currently converges on published/taken-down status only and does not consume an answer-deadline
    cutoff.
  - Repository selection/persistence has no dedicated deadline storage for organization training versions.
- Impact:
  - Deadline acceptance cannot be proven.
  - Expired-but-published training can remain answerable by current source behavior.
  - The serial queue must stop before `0704-org-analytics-acceptance` and run a repair task.

## Existing Focused Test Result

- Command category: focused organization training unit/contract/UI tests.
- Result: pass.
- Test files: 10 passed.
- Tests: 163 passed.
- Interpretation: existing tests are stable but do not close the answer-deadline edge gap.

## Non-Blocked Markers Observed

- First-release source category markers are present for platform paper, organization AI result, and manual grouping.
- `mock_exam` source is denied at first-release source validation.
- Evidence status handling includes insufficient and weak-confirmation categories.
- Published version copy/takedown/action categories exist.
- Duplicate submit and submitted-answer status categories exist.
- Formal-domain write policy is blocked for practice, `mock_exam`, formal answer record, `exam_report`, and
  `mistake_book`.
- Employee raw-answer/admin redaction boundaries remain represented.

## Acceptance Result

- Overall task result: blocked, requires separate repair.
- Repair task to insert: `0704-org-training-deadline-answerability-fix-2026-07-10`.
- Rerun required after repair: `0704-org-training-edge-acceptance-rerun-2026-07-10`.

## Closeout Gates

- Scoped formatter on changed governance docs: pass.
- `git diff --check`: pass.
- `corepack pnpm@10.26.1 run lint`: pass.
- `corepack pnpm@10.26.1 run typecheck`: pass.
- Module Run v2 pre-commit hardening: pass after explicit `blockedFiles` list was materialized for this queue item.
- Module Run v2 pre-push readiness: pass.
