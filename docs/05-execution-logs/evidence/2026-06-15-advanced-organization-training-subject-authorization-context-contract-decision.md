# Evidence: advanced-organization-training-subject-authorization-context-contract-decision

## Module Run V2 Anchors

- Task: `advanced-organization-training-subject-authorization-context-contract-decision`
- Batch range: single user-approved docs-only contract decision after
  `advanced-organization-training-subject-authorization-context-boundary-readonly-audit`.
- Branch: `codex/advanced-organization-training-subject-authorization-context-contract-decision`
- Baseline: `master == origin/master == 97cf3a94e37dd92da97d4522def96ee1ed4a7645` before branch creation.
- Commit: `97cf3a94e37dd92da97d4522def96ee1ed4a7645` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit approved-execute prompt after the next-step recommendation.
- localFullLoopGate: scoped unit test, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch and durable state.
- nextModuleRunCandidate:
  `advanced-organization-training-content-subject-scope-contract-seeding`.

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
- `HEAD == master == origin/master == 97cf3a94e37dd92da97d4522def96ee1ed4a7645`.
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
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-subject-authorization-context-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-subject-authorization-context-boundary-readonly-audit.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-personal-ai-generation-implementation-plan.md`
- `src/db/schema/auth.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/validators/organization-training.ts`
- `src/server/contracts/ai-generation-task-contract.ts`

## Source Anchors

- `src/db/schema/auth.ts` defines `redeem_code`, `personal_auth`, and `org_auth` with `profession` and `level`; it does
  not define a source-backed `subject` field on these authorization sources.
- `src/server/contracts/effective-authorization-contract.ts` defines `EffectiveAuthorizationContextDto` with
  `profession`, `level`, display status, edition, authorization source/public id, owner, quota owner, capabilities, and
  blocked reason; it does not define `subject`.
- `src/server/services/effective-authorization-service.ts` maps personal and organization authorization rows into
  `EffectiveAuthorizationContextDto` from source-backed `profession` and `level` only.
- The advanced authorization context implementation plan's required context item fields include `profession` and `level`
  but not `subject`.
- The advanced MVP requirements require reads to be constrained by `authorization`, `effectiveEdition`, `profession`,
  `level`, `subject`, organization scope, and content visibility.
- The organization training plan says draft and published version DTOs carry `subject`, published
  `profession / level / subject` is authorized content scope, and manual draft creation should resolve context for the
  selected `profession + level + subject`.
- Current `OrganizationTrainingDraftDto` and `OrganizationTrainingPublishedVersionDto` carry `subject`.
- Current organization training service validates content scope by source-backed `profession/level` only and preserves
  selected `subject` into draft metadata.
- Current AI generation task contract carries `subject` as task/request metadata beside source-backed authorization
  identifiers and scope fields.

## Decision

`subject` should not be added to the existing source-backed `EffectiveAuthorizationContextDto` under the current
authorization model.

Rationale:

- The current authorization sources are `profession + level` scoped. Adding `subject` to
  `EffectiveAuthorizationContextDto` would imply source-backed authorization data that does not exist in
  `redeem_code`, `personal_auth`, or `org_auth`.
- The first-release requirement still requires `subject` constraints for organization training reads and writes. That
  constraint belongs in the content/request scope used by organization training and AI generation flows, not in the
  effective authorization source DTO.
- ADR-002 layering remains cleaner if the service accepts an authorization context for source-backed authorization and a
  separate selected content scope for `profession + level + subject`, then repositories later apply `subject` as a
  content visibility/filter dimension.

## Contract Boundary

- Keep `EffectiveAuthorizationContextDto` as the source-backed authorization context:
  `authorizationSource`, `authorizationPublicId`, `effectiveEdition`, `profession`, `level`, owner, quota owner,
  capabilities, and blocked reason.
- Treat `subject` as mandatory organization training content/request scope and persisted metadata, not an
  authorization-source field.
- Future organization training lifecycle implementation must not claim subject-level authorization enforcement from
  `EffectiveAuthorizationContextDto`.
- Future implementation should introduce or document a narrow content/request scope guard that checks:
  `authorizationContext.profession === selectedScope.profession`,
  `authorizationContext.level === selectedScope.level`, and `selectedScope.subject` is valid and applied to content
  filtering/read/write contracts.

## RED / GREEN

RED: not applicable. This is a docs-only contract decision task and does not implement product behavior.

GREEN: contract decision recorded. The subject boundary is resolved as content/request scope rather than an
`EffectiveAuthorizationContextDto` field, preserving source-backed authorization semantics and ADR-002 layering.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"
```

Result: PASS on 2026-06-15.

- Vitest reported `Test Files 3 passed (3)`.
- Vitest reported `Tests 15 passed (15)`.
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

- Reported current branch:
  `codex/advanced-organization-training-subject-authorization-context-contract-decision`.
- Reported changed files were limited to the expected state/evidence/audit/task-plan docs.
- Reported base compare against `origin/master` with no commits ahead before the local closeout commit.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-subject-authorization-context-contract-decision
```

Result: PASS on 2026-06-15.

- `preCommitMode: hard_block`.
- `filesToScan: 5`.
- Scope scan reported `OK_SCOPE` for the two state files, evidence file, audit file, and task plan file.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-subject-authorization-context-contract-decision
```

Result: PASS on 2026-06-15.

- `moduleCloseoutMode: hard_block`.
- Reported `OK_EVIDENCE_PATH` and `OK_AUDIT_PATH`.
- Reported validation, RED/GREEN, commit evidence, local full loop, blocked remainder, and audit approval records present.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-subject-authorization-context-contract-decision
```

Result: PASS on 2026-06-15.

- `prePushMode: hard_block`.
- Reported `OK_GIT_COMPLETION_READINESS`.
- Reported `master`, `originMaster`, `stateMaster`, and `stateOriginMaster` all at
  `97cf3a94e37dd92da97d4522def96ee1ed4a7645` before local closeout commit.
- Reported evidence and audit paths present.
- Exit code: 0.

## needs_recheck

- Seed a narrow docs/state task for `advanced-organization-training-content-subject-scope-contract-seeding`, then a TDD
  implementation task if approved.
- The implementation task should add tests before code for selected content/request scope behavior and should preserve
  the current `EffectiveAuthorizationContextDto` source-backed semantics unless a future authorization-model task changes
  the real authorization source schema with explicit approval.

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
- No route, service, repository, mapper, API runtime, contract, model, validator, or UI changes.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
