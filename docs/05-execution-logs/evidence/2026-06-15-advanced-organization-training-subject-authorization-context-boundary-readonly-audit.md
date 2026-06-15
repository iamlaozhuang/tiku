# Evidence: advanced-organization-training-subject-authorization-context-boundary-readonly-audit

## Module Run V2 Anchors

- Task: `advanced-organization-training-subject-authorization-context-boundary-readonly-audit`
- Batch range: single user-approved readonly audit task after
  `advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage`.
- Branch: `codex/advanced-organization-training-subject-authorization-context-boundary-readonly-audit`
- Baseline: `master == origin/master == 103b800bd3241088469368ddae99668400735a8d` before branch creation.
- Commit: `103b800bd3241088469368ddae99668400735a8d` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit approved-execute prompt after the next-step recommendation.
- localFullLoopGate: scoped unit test, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch and durable state.
- nextModuleRunCandidate:
  `advanced-organization-training-subject-authorization-context-contract-decision`.

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
- `HEAD == master == origin/master == 103b800bd3241088469368ddae99668400735a8d`.
- Divergence was `0 0`.
- No local or remote `codex/*` branches were present.

## Scope Reviewed

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-auth-context-implementation-plan.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service-level-mismatch-test-coverage.md`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/validators/organization-training.ts`

## Source Anchors

- Advanced MVP requirements state that reads must be constrained by `authorization`, `effectiveEdition`, `profession`,
  `level`, `subject`, organization scope, and content visibility.
- The advanced authorization context implementation plan defines context item fields for `profession`, `level`,
  `effectiveEdition`, `authorizationSource`, ownership, quota ownership, capabilities, and blocked reason; it does not
  include `subject`.
- The organization training implementation plan says draft DTO `subject` is `theory` or `skill`, published version
  `profession / level / subject` is authorized content scope, and manual draft creation should resolve advanced
  authorization context for selected `profession + level + subject`.
- Current `EffectiveAuthorizationContextDto` includes `profession` and `level`, but no `subject`.
- Current `OrganizationTrainingDraftDto` and `OrganizationTrainingPublishedVersionDto` include `subject`.
- Current organization training validator accepts `subject` as content metadata for publish input, but the capability
  context only carries `effectiveEdition`, `authorizationSource`, and `canCreateOrganizationTraining`.
- Current manual draft service checks authorization scope by `profession` and `level` only, and preserves selected
  `subject` into the draft metadata.

## Readonly Findings

- The current narrow manual draft service remains acceptable only as a `profession/level` authorization gate plus
  metadata-only `subject` preservation. It must not be described as subject-level authorization enforcement.
- There is a real cross-document boundary gap: requirements and organization training planning expect `subject` to
  participate in content authorization scope, while the current effective authorization context contract does not carry
  `subject`.
- Adding `subject` to `EffectiveAuthorizationContextDto` would be a contract/service/API boundary change, not an audit
  change. It should be handled by a separate TDD contract task or an explicit decision task before broader lifecycle
  expansion.
- ADR-002 layering remains intact in the current code: the service consumes contracts and does not access DB directly;
  future persistence still belongs behind repository boundaries.
- Formal target write remains blocked. This audit did not write formal `question`, `paper`, `practice`, `mock_exam`,
  `exam_report`, `mistake_book`, or `answer_record`.

## RED / GREEN

RED: not applicable. This is a readonly audit and does not implement product behavior.

GREEN: readonly audit completed and recorded the current subject authorization boundary mismatch, preserved blocked
gates, and identified the next decision task.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts"
```

Result: PASS on 2026-06-15.

- Vitest reported `Test Files 2 passed (2)`.
- Vitest reported `Tests 10 passed (10)`.
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
  `codex/advanced-organization-training-subject-authorization-context-boundary-readonly-audit`.
- Reported changed files were limited to the expected state/evidence/audit/task-plan docs.
- Reported base compare against `origin/master` with no commits ahead before the local closeout commit.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-subject-authorization-context-boundary-readonly-audit
```

Result: PASS on 2026-06-15.

- `preCommitMode: hard_block`.
- `filesToScan: 5`.
- Scope scan reported `OK_SCOPE` for the two state files, evidence file, audit file, and task plan file.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-subject-authorization-context-boundary-readonly-audit
```

Result: PASS on 2026-06-15.

- `moduleCloseoutMode: hard_block`.
- Reported `OK_EVIDENCE_PATH` and `OK_AUDIT_PATH`.
- Reported validation, RED/GREEN, commit evidence, local full loop, blocked remainder, and audit approval records present.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-subject-authorization-context-boundary-readonly-audit
```

Result: PASS on 2026-06-15.

- `prePushMode: hard_block`.
- Reported `OK_GIT_COMPLETION_READINESS`.
- Reported `master`, `originMaster`, `stateMaster`, and `stateOriginMaster` all at
  `103b800bd3241088469368ddae99668400735a8d` before local closeout commit.
- Reported evidence and audit paths present.
- Exit code: 0.

## Decision

pass_with_needs_recheck

## needs_recheck

- Queue a narrow decision or TDD contract task to decide whether `subject` becomes part of
  `EffectiveAuthorizationContextDto` and all corresponding route/service/validator tests.
- Do not expand organization training draft publish, route, UI, repository, schema, provider, quota/cost, or formal
  adoption surfaces until this subject authorization boundary is explicitly resolved or preserved as an accepted
  limitation.

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
