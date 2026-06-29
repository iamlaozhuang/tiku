# Verify API List SortBy Validation Boundary Evidence

- Task id: `verify-api-list-sort-by-validation-boundary-2026-06-29`
- Branch: `codex/api-sort-validation-boundary-20260629`
- Evidence recorded at: `2026-06-29T09:19:13-07:00`
- Result: pass
- Commit: `bf83a08c69931a2e7a5eb923770be121f611583f` current base anchor before local closeout commit
- localFullLoopGate: L8 docs/state security verification only; release, deploy, final Pass, and Cost Calibration remain blocked
- Cost Calibration Gate remains blocked
- threadRolloverGate: not required for this small docs/state verification packet; next task is explicitly recorded below
- nextModuleRunCandidate: `verify-session-login-response-credential-boundary-2026-06-29`

## Batch Evidence

- Batch range: single task `verify-api-list-sort-by-validation-boundary-2026-06-29`
- RED: predecessor inventory recorded `api-inv-001` as a medium sort-field boundary candidate because several list query validators preserve caller-provided `sortBy`.
- GREEN: static source review found reviewed repository query construction maps sort fields to fixed columns or defaults before execution; focused Vitest validation passed.
- Blocked remainder: source/test repair, browser runtime, DB access, Provider/AI calls, release readiness, final Pass, deployment, PR creation, force-push, and Cost Calibration remain blocked.

## Static Evidence Summary

| Area                         | Paths                                                                                                                                                                                                  | Result                                                                                                                            |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| Generic pagination validator | `src/server/validators/pagination.ts`                                                                                                                                                                  | Keeps non-empty caller `sortBy`; this remains a low contract consistency watch.                                                   |
| Generic list validators      | `src/server/validators/material.ts`, `paper-asset.ts`, `paper-draft.ts`, `question.ts`, `student-paper.ts`, `question-paper/exam-paper-validator.ts`                                                   | Some paths preserve caller `sortBy` before service execution.                                                                     |
| Content repositories         | `src/server/repositories/material-repository.ts`, `paper-asset-repository.ts`, `paper-draft-repository.ts`, `question-repository.ts`                                                                   | `sortBy` is compared against known strings and falls back to fixed `created_at` or equivalent typed columns.                      |
| Student repositories         | `src/server/repositories/student-flow-runtime-repository.ts`                                                                                                                                           | List ordering uses fixed `published_at`, `started_at`, or fixed answer/order columns with only `sortOrder` controlling direction. |
| Fixed validators             | `src/server/validators/exam-report.ts`, `mistake-book.ts`, `ai-call-log/list-query.ts`, `audit-log/list-query.ts`, `organization/list-query.ts`                                                        | Sort field is fixed or allowlisted before repository execution.                                                                   |
| Admin/runtime repositories   | `src/server/repositories/admin-flow-runtime-repository.ts`, `admin-ai-audit-log-runtime-repository.ts`, `admin-organization-org-auth-runtime-repository.ts`, `admin-redeem-code-runtime-repository.ts` | Raw SQL `order by ${orderBy}` sites use fixed SQL fragments selected by `sortOrder`; typed repository sites select fixed columns. |
| Direct interpolation search  | `rg` patterns over `src/server`                                                                                                                                                                        | No direct `${query.sortBy}` or equivalent `sortBy` raw SQL interpolation match was found.                                         |

## Verdict

`api-inv-001`: `not_actionable_for_query_construction_with_contract_watch`.

The query execution risk was not reproduced in the reviewed routes and repositories. The remaining low-severity watch is
pagination metadata consistency: generic validators can preserve unsupported `sortBy` strings, and services may echo
those values even when repositories execute a fallback column. That should be handled as a future API contract cleanup
only if prioritized; it is not a blocker in this task.

## Validation Evidence

Focused existing local checks:

```text
npx.cmd vitest run src/server/validators/student-paper.test.ts src/server/validators/mistake-book.test.ts src/server/validators/exam-report.test.ts src/server/validators/organization.test.ts src/server/services/material-service.test.ts src/server/services/paper-asset-service.test.ts src/server/services/paper-draft-service.test.ts src/server/services/question-service.test.ts src/server/services/student-paper-service.test.ts src/server/services/exam-report-service.test.ts src/server/services/mistake-book-service.test.ts
Exit code: 0
Test Files: 11 passed
Tests: 66 passed
```

Governance closeout commands to be run and recorded in final closeout:

```text
npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-api-contract-input-validation-inventory.md docs/01-requirements/traceability/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-api-list-sort-by-validation-boundary.md
npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-security-api-contract-input-validation-inventory.md docs/01-requirements/traceability/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/task-plans/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/evidence/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/audits-reviews/2026-06-29-verify-api-list-sort-by-validation-boundary.md docs/05-execution-logs/acceptance/2026-06-29-verify-api-list-sort-by-validation-boundary.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29 -SkipRemoteAheadCheck
```

Final local governance validation:

```text
npx.cmd prettier --write --ignore-unknown <scoped docs/state files>
Exit code: 0

npx.cmd prettier --check --ignore-unknown <scoped docs/state files>
Exit code: 0
All matched files use Prettier code style.

git diff --check
Exit code: 0

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29
Exit code: 0
Result: pre-commit hardening passed

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29
Exit code: 0
Result: module-closeout readiness passed

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId verify-api-list-sort-by-validation-boundary-2026-06-29 -SkipRemoteAheadCheck
Exit code: 0
Result: pre-push readiness passed
```

## Non-Actions

- Source/test files changed: false.
- Package or lockfile changed: false.
- DB connection, raw row read, schema/migration/seed, or mutation executed: false.
- Provider/AI call, Provider/model configuration read/write, prompt capture, or raw AI payload evidence: false.
- Browser runtime, dev server, raw DOM, screenshot, trace, or HTML report captured: false.
- Credentials, cookies, tokens, sessions, localStorage, Authorization headers, env/secrets, connection strings, PII, email, phone, plaintext `redeem_code`, raw DB rows, or complete business content captured: false.
- Release readiness, final Pass, deployment, staging/prod/cloud, PR, force-push, and Cost Calibration: not executed and not claimed.

## Next Module Run Candidate

Recommended smallest follow-up task: `verify-session-login-response-credential-boundary-2026-06-29`.

Reason: it is already queued as a high-severity session login response credential boundary check and requires fresh task
materialization before any source/test edit.
