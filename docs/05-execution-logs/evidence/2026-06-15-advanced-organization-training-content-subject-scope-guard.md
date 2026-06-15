# Evidence: advanced-organization-training-content-subject-scope-guard

## Module Run V2 Anchors

- Task: `advanced-organization-training-content-subject-scope-guard`
- Batch range: single user-approved RED-first TDD implementation task after
  `advanced-organization-training-content-subject-scope-contract-seeding`.
- Branch: `codex/advanced-organization-training-content-subject-scope-guard`
- Baseline: `master == origin/master == 0527045754b0185586a0f605e852c30e3bab3106` before branch creation.
- Commit: `0527045754b0185586a0f605e852c30e3bab3106` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit approved-execute prompt after the next-step recommendation.
- localFullLoopGate: focused service unit, scoped unit set, diff check, lint, typecheck, GitCompletionReadiness,
  PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch and durable state.
- nextModuleRunCandidate:
  `advanced-organization-training-content-subject-scope-readonly-recheck`.
- result: pass

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
- `HEAD == master == origin/master == 0527045754b0185586a0f605e852c30e3bab3106`.
- Divergence was `0 0`.
- No local or remote `codex/*` branches were present.

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-content-subject-scope-contract-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-content-subject-scope-contract-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/contracts/ai-generation-task-contract.ts`

## Implementation

- Added a focused service unit assertion that `EffectiveAuthorizationContextDto` remains source-backed without a
  selected `subject` key.
- Added a RED-first service unit case proving manual draft creation rejects an invalid selected content-scope `subject`
  and does not call the draft store.
- Added the minimal service runtime guard using the existing `subjectValues` source to reject invalid selected
  `subject`.
- Preserved valid `subject` draft metadata behavior through the existing manual draft success assertion.
- Did not change organization training contract shape, route, repository, mapper, validator, model, API, UI, schema,
  drizzle, scripts, package, lockfile, dependency, provider, DB, e2e, dev-server, or formal write behavior.

## RED / GREEN

RED: focused service unit failed before implementation because the service accepted an invalid selected `subject` and
returned a successful metadata-only draft result.

GREEN: focused service unit passed after adding the service runtime subject guard; scoped unit set also passed.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

RED result: FAIL on 2026-06-15 before implementation.

- Vitest reported `Test Files 1 failed (1)`.
- Vitest reported `Tests 1 failed | 6 passed (7)`.
- Failure reason: invalid selected `subject` was accepted instead of returning `invalid_manual_draft_input`.
- Exit code: 1.

GREEN result: PASS on 2026-06-15 after implementation.

- Vitest reported `Test Files 1 passed (1)`.
- Vitest reported `Tests 7 passed (7)`.
- Exit code: 0.

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
```

Result: PASS on 2026-06-15.

- Vitest reported `Test Files 3 passed (3)`.
- Vitest reported `Tests 17 passed (17)`.
- Exit code: 0.

```powershell
git diff --check
```

Result: PASS on 2026-06-15. No whitespace errors were reported.

- Exit code: 0.

```powershell
npm.cmd run lint
```

Result: PASS on 2026-06-15.

- `eslint` completed without reported errors.
- Exit code: 0.

```powershell
npm.cmd run typecheck
```

Result: PASS on 2026-06-15.

- `tsc --noEmit` completed without reported errors.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: PASS on 2026-06-15.

- Reported current branch: `codex/advanced-organization-training-content-subject-scope-guard`.
- Reported changed files were limited to state, task plan, service test, and service implementation before evidence/audit
  creation.
- Reported no commits ahead of `origin/master` before the local closeout commit.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-content-subject-scope-guard
```

Result: PASS on 2026-06-15.

- `preCommitMode: hard_block`.
- `filesToScan: 5`.
- Scope scan reported `OK_SCOPE` for state files, task plan, service test, and service implementation.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-guard
```

Result: PASS on 2026-06-15 after the closeout path repair.

- `moduleCloseoutMode: hard_block`.
- Reported `OK_EVIDENCE_PATH` and `OK_AUDIT_PATH`.
- Reported RED, GREEN, commit evidence, local full loop, blocked remainder, thread rollover, next module candidate, and
  audit approval records present.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-guard
```

Result: PASS on 2026-06-15 after the closeout path repair.

- `prePushMode: hard_block`.
- Reported `OK_GIT_COMPLETION_READINESS`.
- Reported `master`, `originMaster`, `stateMaster`, and `stateOriginMaster` all at
  `0527045754b0185586a0f605e852c30e3bab3106` before the local closeout commit.
- Reported evidence and audit paths present.
- Exit code: 0.

## Decision

pass_tdd_service_subject_scope_guard

## Closeout Gap Repair

The first closeout attempt on 2026-06-15 failed before path validation because the current task queue entry did not yet
include scalar `evidencePath` and `auditReviewPath` values. The script therefore received an empty path value and stopped
with a hard error before evaluating the evidence content.

Repair scope:

- Added `planPath`, `evidencePath`, and `auditReviewPath` to the current task entry in
  `docs/04-agent-system/state/task-queue.yaml`.
- Recorded this closeout gap in this evidence file.
- No product source behavior was changed during this repair.

## needs_recheck

- Recommended next Module Run candidate:
  `advanced-organization-training-content-subject-scope-readonly-recheck`.
- That readonly recheck should verify service/contract/test consistency, ADR-002 layering, and that `subject` still does
  not exist on `EffectiveAuthorizationContextDto`.

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
- No route, repository, mapper, validator, model, API runtime, admin UI, or student UI changes.
- No `subject` field added to `EffectiveAuthorizationContextDto`.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
