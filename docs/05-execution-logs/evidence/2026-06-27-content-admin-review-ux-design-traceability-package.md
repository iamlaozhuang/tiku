# content-admin review UX design and traceability package evidence

## Scope Evidence

- Task id: `content-admin-review-ux-design-traceability-package-2026-06-27`
- Branch: `codex/content-admin-review-ux-traceability-package-20260627`
- Approval source: current user serial batch request on 2026-06-27.
- Execution scope: docs/state/task-plan/evidence/audit/acceptance package only.

## Requirement Evidence

- Content admin AI generation may only become formal `question` or `paper` through governed review, validation,
  attribution, and `audit_log`.
- Direct publish or direct formal write from AI generation is forbidden.
- Formal adoption must not bypass duplicate detection, canonical `question_type` normalization, material binding, paper
  count limits, source attribution, reviewer attribution, `audit_log`, snapshot semantics, or publish validation.
- Formal content separation requires adoption source, reviewer, validation result, timestamp, and `audit_log`.

## Design Boundary Evidence

- Minimum required UX:
  - content backend AI draft/review entry;
  - single-result detail;
  - validation summary;
  - explicit adopt/reject actions;
  - reviewer and source attribution;
  - formal draft target reference after adoption;
  - redacted audit summary;
  - direct publish blocked state.
- Required states:
  - loading;
  - empty;
  - permission denied;
  - unavailable;
  - validation failed;
  - adopt success;
  - reject success;
  - adoption blocked.
- Evidence redaction:
  - no raw prompt;
  - no raw generated output;
  - no Provider payload;
  - no full `question` or full `paper`;
  - no screenshot, trace, or DOM dump.

## Task Split Evidence

- Source TDD follow-up: `content-admin-review-single-result-traceability-source-tdd-approval-2026-06-27`.
- UI follow-up: `content-admin-review-ui-implementation-local-validation-approval-2026-06-27`.
- Enhancement package follow-up: `content-admin-review-batch-retry-diff-history-enhancement-package-2026-06-27`.
- Optional browser follow-up: `content-admin-review-local-browser-smoke-validation-approval-2026-06-27`.

## Validation Evidence

- `npx.cmd prettier --write --ignore-unknown ...` completed for scoped docs/state/evidence/audit files.
- `npx.cmd prettier --check --ignore-unknown ...` passed.
- `git diff --check` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-admin-review-ux-design-traceability-package-2026-06-27` passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1` returned `idle_no_pending_task`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-admin-review-ux-design-traceability-package-2026-06-27 -SkipRemoteAheadCheck` passed.

## Safety Boundary

- Source/test/e2e/script/package/lockfile/schema/drizzle/env files changed: `false`.
- DB connection or mutation executed: `false`.
- Review/adoption mutation executed: `false`.
- Batch/retry/diff/history execution: `false`.
- Provider call or Provider credential read executed: `false`.
- Publish or student-visible runtime executed: `false`.
- Browser/e2e/dev server executed: `false`.
- Staging/prod/deploy/payment/external service touched: `false`.
- Release readiness or final Pass claimed: `false`.
