# Evidence: advanced-organization-training-draft-lifecycle-service-readonly-recheck

## Module Run V2 Anchors

- Task: `advanced-organization-training-draft-lifecycle-service-readonly-recheck`
- Batch range: single user-approved readonly recheck task after
  `advanced-organization-training-draft-lifecycle-service-readonly-recheck-seeding`.
- Branch: `codex/advanced-organization-training-draft-lifecycle-service-readonly-recheck`
- Baseline: `master == origin/master == a7d0f8a2910f482c087a69af975711545d18b678` before branch creation.
- Commit: `a7d0f8a2910f482c087a69af975711545d18b678` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit approved-execute prompt.
- localFullLoopGate: scoped unit test, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch and durable state.
- nextModuleRunCandidate: a narrow TDD test coverage task for organization training draft lifecycle service scope
  mismatch coverage, or a docs/state-only seed for that task if the queue is empty after closeout.

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
- `HEAD == master == origin/master == a7d0f8a2910f482c087a69af975711545d18b678`.
- Divergence was `0 0`.
- No local or remote `codex/*` branches were present.

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck-seeding.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## Readonly Findings

- ADR-002 layering remains acceptable for the current narrow step: business checks live in
  `src/server/services/organization-training-service.ts`, DTO contracts live in `src/server/contracts`, domain constants
  live in `src/server/models`, and validation helpers live in `src/server/validators`.
- The service has no direct DB access and does not introduce repository, route/API runtime, UI, schema, migration,
  provider, quota/cost, package, lockfile, or dependency work.
- The current store boundary is an injected service-local `OrganizationTrainingDraftStore` port for unit-tested local
  behavior. A later persistence task must introduce a repository implementation instead of putting DB access in service,
  route, or UI layers.
- `OrganizationTrainingDraftDto` is metadata-only for the manual draft path: public id fields, owner organization public
  id, authorization source/public id, `profession`, `level`, `subject`, title/description, zero counts, question type
  summary, `evidenceStatus`, `validationStatus`, `retentionStatus`, and timestamps.
- The manual draft write uses `contentType: "organization_training_draft"`, `ownerType: "organization"`, and
  `quotaOwnerType: "organization"`.
- Formal target write remains blocked. The service and tests do not write formal `question`, `paper`, `practice`,
  `mock_exam`, `exam_report`, `mistake_book`, or `answer_record`.
- Non-leakage remains covered for the manual draft result against formal target public id field names, provider payload,
  raw prompt, and raw answer.
- The previously identified authorization `subject` gap remains real:
  `EffectiveAuthorizationContextDto` includes `profession` and `level`, but no `subject`; the service preserves selected
  `subject` in the draft DTO but can only match authorization content scope by `profession/level`.
- Additional test coverage gap: `isAuthorizationContentScopeMatched` checks both `profession` and `level`, but the
  current service test has an explicit mismatch case for `profession` only. A narrow TDD follow-up should add an explicit
  `level` mismatch test before broader lifecycle work.

## RED / GREEN

RED: not applicable. This is a readonly audit/recheck task and does not implement product behavior.

GREEN: readonly recheck completed and recorded current boundary status, preserved blocked gates, and identified the
remaining subject authorization decision plus narrow level-mismatch test coverage gap.

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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-readonly-recheck
```

Result: pass; scope scan, sensitive evidence scan, and terminology scan passed for 5 task-scoped files.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-readonly-recheck
```

Result: pass; evidence, audit, validation anchors, RED/GREEN evidence, localFullLoopGate, threadRolloverGate, and
nextModuleRunCandidate were accepted.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-readonly-recheck
```

Result: pass; pre-push readiness accepted branch state, master/origin-master parity, evidence path, and audit path.

## Decision

pass_with_needs_recheck

## needs_recheck

- Decide whether `subject` is intentionally outside `EffectiveAuthorizationContextDto` or whether a later contract change
  is required before broader organization training draft lifecycle work.
- Add explicit TDD coverage for `level` authorization mismatch in the manual draft service before expanding repository,
  route, UI, schema, provider, quota/cost, or formal target write work.

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
