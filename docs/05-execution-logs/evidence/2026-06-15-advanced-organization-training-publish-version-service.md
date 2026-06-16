# Evidence: advanced-organization-training-publish-version-service

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-service`
- Batch range: single user-approved RED-first TDD service implementation task after
  `advanced-organization-training-next-implementation-queue-seeding`.
- Branch: `codex/advanced-organization-training-publish-version-service`
- Baseline: `master == origin/master == 5f9aafbfcae8cb4c6875cc9aeacf77100d222d5d` before branch creation.
- Commit: `5f9aafbfcae8cb4c6875cc9aeacf77100d222d5d` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit `批准执行` after the next-step recommendation.
- localFullLoopGate: focused service unit test, scoped unit test set, diff check, lint, typecheck, GitCompletionReadiness,
  PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch and durable state.
- nextModuleRunCandidate: none seeded by this implementation task; recommend a readonly publish-version service recheck
  only after user review.
- result: pass

## Readiness

Executed before branch creation:

```powershell
git switch master
git fetch --prune origin
git status --porcelain=v1
git branch --show-current
git rev-parse HEAD
git rev-parse master
git rev-parse origin/master
git branch --list "codex/*"
git for-each-ref refs/remotes/origin/codex --format='%(refname:short)'
```

Result:

- Worktree was clean.
- `HEAD == master == origin/master == 5f9aafbfcae8cb4c6875cc9aeacf77100d222d5d`.
- No local or remote `codex/*` branches were present.

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-content-subject-scope-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-content-subject-scope-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-next-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-next-implementation-queue-seeding.md`
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`

## RED / GREEN

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

RED: EXPECTED FAIL on 2026-06-15 before production implementation.

- Vitest reported `Test Files 1 failed (1)`.
- Vitest reported `Tests 3 failed | 7 passed (10)`.
- Failure reason: `service.publishVersion is not a function`.
- Exit code: 1.

This is the expected missing-feature failure for the new publish-version service API.

GREEN: focused service tests passed after adding the minimal publish-version service method and store boundary.

## Implementation Summary

- Added service-layer publish result and blocked reason types.
- Added a narrow `publishVersion` service method that consumes existing `OrganizationTrainingPublishInput` metadata.
- Added a store boundary for creating an `organization_training_version` write.
- Captured the publish organization scope snapshot at service clock time.
- Returned immutable published-version metadata with `status: "published"`, `takenDownAt: null`, and `takedownReason: null`.
- Preserved organization training isolation by not writing formal content targets and not adding route, repository, mapper,
  schema, DB, UI, provider, package, lockfile, scripts, e2e, takedown, copy-to-new-draft, employee answer, analytics,
  quota/cost, or formal write behavior.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

Result: PASS on 2026-06-15.

- Vitest reported `Test Files 1 passed (1)`.
- Vitest reported `Tests 10 passed (10)`.
- Exit code: 0.

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
```

Result: PASS on 2026-06-15.

- Vitest reported `Test Files 3 passed (3)`.
- Vitest reported `Tests 20 passed (20)`.
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

Result: PASS on 2026-06-15 after fixing a test-only TypeScript narrowing issue.

- `tsc --noEmit` completed without reported errors.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: PASS on 2026-06-15.

- Reported current branch:
  `codex/advanced-organization-training-publish-version-service`.
- Reported changed tracked files were limited to the two state files and the two service test/source files before
  evidence/audit creation.
- Reported one untracked task plan file before evidence/audit creation.
- Reported no commits ahead of `origin/master`.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-service
```

Result: PASS on 2026-06-15.

- `preCommitMode: hard_block`.
- `filesToScan: 7`.
- Scope scan reported `OK_SCOPE` for the two state files, task plan, evidence, audit, service test, and service source.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-service
```

Result: PASS on 2026-06-15 after evidence closeout anchor repair.

- `moduleCloseoutMode: hard_block`.
- Evidence and audit paths were accepted.
- Required validation commands were recorded.
- Module Run v2 strict evidence anchors passed.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-service
```

Result: PASS on 2026-06-15 after local closeout commit.

- `prePushMode: hard_block`.
- Git readiness passed for the short branch.
- `master`, `origin/master`, state master, and state origin master were aligned at
  `5f9aafbfcae8cb4c6875cc9aeacf77100d222d5d`.
- Evidence and audit paths were accepted.
- Exit code: 0.

## Decision

pass_tdd_publish_version_service

## needs_recheck

- Future route/repository/schema work must recheck that the service store boundary maps to persistence without exposing
  row/private data or formal target identifiers.
- Future takedown, copy-to-new-draft, employee answer, and analytics tasks remain separate queued work.
- This task does not claim DB persistence, route availability, UI availability, employee answer readiness, formal content
  adoption, quota/cost readiness, provider readiness, or deployment readiness.

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
- No route, repository, mapper, API runtime, contract, model, validator, or UI changes.
- No takedown, copy-to-new-draft, employee answer, analytics, quota/cost, or formal content write behavior.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
