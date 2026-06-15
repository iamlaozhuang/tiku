# Evidence: advanced-organization-training-draft-lifecycle-service

## Module Run V2 Anchors

- Task: `advanced-organization-training-draft-lifecycle-service`
- Batch range: single user-approved local service implementation task after
  `advanced-organization-training-draft-lifecycle-service-seeding`.
- Branch: `codex/advanced-organization-training-draft-lifecycle-service`
- Baseline: `master == origin/master == 235f4ec50290cb47d06cb94c1f18f1f94e14e833` before branch creation.
- Commit: `235f4ec50290cb47d06cb94c1f18f1f94e14e833` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: user approved execution in the current 2026-06-15 Codex thread by saying "批准执行".
- localFullLoopGate: scoped unit test, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch.
- nextModuleRunCandidate: a readonly recheck for `advanced-organization-training-draft-lifecycle-service`, or a narrow
  docs/state-only seed for that recheck if the queue is empty after closeout.

## Readiness

- Ran `git switch master`.
- Ran `git fetch --prune origin`.
- Confirmed clean worktree before creating the task branch.
- Confirmed `HEAD == master == origin/master == 235f4ec50290cb47d06cb94c1f18f1f94e14e833`.
- Confirmed no local or remote `codex/*` residual branches before creating this task branch.
- Created branch `codex/advanced-organization-training-draft-lifecycle-service`.

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-seeding.md`
- `src/server/models/organization-training.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`

## Implementation Summary

- Added `src/server/services/organization-training-service.ts`.
- Added `src/server/services/organization-training-service.test.ts`.
- Implemented service-local manual draft creation through an injected `OrganizationTrainingDraftStore` port.
- Implemented checks for advanced edition, `org_auth`, `canCreateOrganizationTraining`, admin visible organization scope,
  organization ownership, and authorization `profession/level` scope.
- Composed metadata-only `OrganizationTrainingDraftDto` with `sourceTaskPublicId: null`, zero question counts,
  `evidenceStatus: none`, `validationStatus: needs_review`, and `retentionStatus: active`.
- Marked the internal write as `organization_training_draft`, `ownerType: organization`, and
  `quotaOwnerType: organization`.

## RED / GREEN

RED: ran the new service test before implementation.

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

Result: expected fail. Vitest reported the suite failed because `./organization-training-service` could not be resolved.

GREEN: implemented the service-only behavior and reran the scoped service test.

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

Result: pass, 1 test file, 4 tests.

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

Result: pass after replacing the admin visible organization scope type with `readonly string[]`; the first typecheck run
correctly rejected readonly test fixtures against a mutable `string[]` service input.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pass; GitCompletionReadiness completed and reported only task-scoped dirty files.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-draft-lifecycle-service
```

Result: pass; scope scan, sensitive evidence scan, and terminology scan passed.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service
```

Result: pass; evidence, audit, validation anchors, RED/GREEN evidence, localFullLoopGate, threadRolloverGate, and
nextModuleRunCandidate were accepted.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service
```

Result: pass; pre-push readiness accepted the branch, master/origin-master parity, evidence path, and audit path.

## Decision

result: pass_with_needs_recheck

The service-only manual draft creation boundary is implemented and covered by scoped unit tests.

## needs_recheck

- `EffectiveAuthorizationContextDto` currently carries `profession` and `level`, but not `subject`. This task preserves
  the selected `subject` in the draft DTO but cannot honestly claim subject-level authorization matching. A follow-up
  readonly recheck should decide whether subject is intentionally outside the effective authorization context or needs a
  later contract change.

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
- No repository, mapper, route, API runtime, or UI changes.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No formal adoption target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
