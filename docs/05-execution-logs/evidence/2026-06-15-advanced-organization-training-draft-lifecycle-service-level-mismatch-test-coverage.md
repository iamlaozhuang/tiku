# Evidence: advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage

## Module Run V2 Anchors

- Task: `advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage`
- Batch range: single user-approved TDD test coverage task after
  `advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage-seeding`.
- Branch: `codex/advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage`
- Baseline: `master == origin/master == 61e2f80fccdc56a31dd73f6a3bbd1beb847f9ae1` before branch creation.
- Commit: `61e2f80fccdc56a31dd73f6a3bbd1beb847f9ae1` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit approved-execute prompt after the recommendation to run this
  pending TDD task.
- localFullLoopGate: scoped unit test, paired scoped unit test, diff check, lint, typecheck, GitCompletionReadiness,
  PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; next candidate remains a readonly or planning follow-up for the subject
  authorization context decision.
- nextModuleRunCandidate: a narrow readonly/planning task for deciding whether `subject` belongs in
  `EffectiveAuthorizationContextDto` before broader organization training lifecycle expansion.

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
- `HEAD == master == origin/master == 61e2f80fccdc56a31dd73f6a3bbd1beb847f9ae1`.
- Divergence was `0 0`.
- No local or remote `codex/*` branches were present.

## Source Anchors

- `src/server/services/organization-training-service.ts` is read-only in this task and already checks
  `authorizationContext.profession === draftInput.profession` and `authorizationContext.level === draftInput.level`.
- `src/server/services/organization-training-service.test.ts` previously had an explicit `profession mismatch` case but
  no standalone `level mismatch` test.
- `EffectiveAuthorizationContextDto` still includes `profession` and `level`, but no `subject`.

## Changes

- Added one explicit service unit test for manual draft `level` mismatch returning `authorization_scope_mismatch`.
- Preserved test-only final product diff; no service, route, repository, mapper, contract, model, validator, schema,
  drizzle, scripts, package, lockfile, dependency, UI, provider, DB, or formal write changes.

## RED / GREEN

RED:

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

Result: expected fail, 1 failed / 4 passed / 5 total. Failure was `Error: Expect test to fail` from the temporary
test-only failing marker, confirming the new assertion body already matched the existing read-only service behavior.

GREEN:

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

Result: pass, 1 test file, 5 tests.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

Result: pass, 1 test file, 5 tests.

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts"
```

Result: pass, 2 test files, 10 tests.

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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage
```

Result: pass; scope scan, sensitive evidence scan, and terminology scan passed for 6 task-scoped files.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage
```

Result: pass; module run v2 anchors, evidence/audit paths, validation records, strict evidence, and audit approval passed.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage
```

Result: pass; git readiness, evidence/audit paths, closeout noise policy, and pre-push readiness passed.

## Decision

pass

## needs_recheck

- The broader `subject` authorization context decision remains outside this task and stays blocked/recheck.
- Future organization training lifecycle expansion should not proceed past current `profession/level` scope claims
  without resolving or explicitly preserving the `subject` boundary.

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
- No service behavior, route, repository, mapper, API runtime, contract, model, validator, or UI changes.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
