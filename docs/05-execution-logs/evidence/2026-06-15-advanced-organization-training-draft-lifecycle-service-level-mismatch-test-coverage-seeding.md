# Evidence: advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding

## Module Run V2 Anchors

- Task: `advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding`
- Batch range: single user-approved docs/state-only queue seeding task after
  `advanced-organization-training-draft-lifecycle-service-readonly-recheck`.
- Branch: `codex/advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding`
- Baseline: `master == origin/master == ba120b5d546a631d61659395a1ca754da319f7eb` before branch creation.
- Commit: `ba120b5d546a631d61659395a1ca754da319f7eb` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit approved-execute prompt.
- localFullLoopGate: scoped unit test, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; next candidate is seeded below.
- nextModuleRunCandidate: `advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage`.

## Readiness

Executed before branch creation:

```powershell
git switch master
git fetch --prune origin
git status --short --branch
git rev-parse HEAD
git rev-parse master
git rev-parse origin/master
git rev-list --left-right --count master...origin/master
git branch --list "codex/*"
git branch -r --list "origin/codex/*"
```

Result:

- Worktree was clean.
- `HEAD == master == origin/master == ba120b5d546a631d61659395a1ca754da319f7eb`.
- Divergence was `0 0`.
- No local or remote `codex/*` branches were present.

## Source Anchors

- `src/server/services/organization-training-service.ts` checks authorization content scope using both
  `authorizationContext.profession === draftInput.profession` and `authorizationContext.level === draftInput.level`.
- `src/server/services/organization-training-service.test.ts` already includes an explicit `profession mismatch` case for
  `authorization_scope_mismatch`.
- The current service test does not include a distinct explicit `level mismatch` case.

## Changes

- Added this task plan, evidence, and audit review.
- Updated `project-state.yaml` handoff to recommend the pending TDD follow-up.
- Appended a closed seeding task and a pending TDD test coverage task to `task-queue.yaml`.

## RED / GREEN

RED: not applicable. This is a docs/state-only queue seeding task and does not implement product behavior.

GREEN: seeded `advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage` as a pending TDD
task with fresh approval required before claim.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts"
```

Result: pass, 2 test files, 9 tests.

```powershell
git diff --check
```

Result: pass.

```powershell
npm.cmd run lint
```

Result: pass.

```powershell
npm.cmd run typecheck
```

Result: pass.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pass; readiness inventory completed and listed only task-scoped dirty files.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding
```

Result: pass; scope scan, sensitive evidence scan, and terminology scan passed for 5 task-scoped files.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding
```

Result: pass; module run v2 anchors, evidence/audit paths, validation records, strict evidence, and audit approval passed.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding
```

Result: pass; git readiness, evidence/audit paths, closeout noise policy, and pre-push readiness passed.

## Decision

pass

## needs_recheck

- The seeded follow-up should use TDD discipline and add an explicit `level` mismatch case before implementation.
- The broader `subject` authorization context decision remains outside this task and stays blocked.

## Blocked Gates Preserved

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- Cost Calibration Gate remains blocked.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No product source implementation.
- No route, service, repository, mapper, API runtime, or UI changes.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
