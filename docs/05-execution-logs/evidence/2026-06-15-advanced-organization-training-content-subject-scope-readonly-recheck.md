# Evidence: advanced-organization-training-content-subject-scope-readonly-recheck

## Module Run V2 Anchors

- Task: `advanced-organization-training-content-subject-scope-readonly-recheck`
- Batch range: single user-approved readonly recheck task after
  `advanced-organization-training-content-subject-scope-readonly-recheck-seeding`.
- Branch: `codex/advanced-organization-training-content-subject-scope-readonly-recheck`
- Baseline: `master == origin/master == 02396ecc1df966ff1bf7cbca752fa6c04a322755` before branch creation.
- Commit: `02396ecc1df966ff1bf7cbca752fa6c04a322755` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit `批准执行` after the next-step recommendation.
- localFullLoopGate: scoped unit test, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch and durable state.
- nextModuleRunCandidate: none seeded by this readonly recheck; choose the next pending queue item after user review.
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
git branch --list "codex/*"
git branch -r --list "origin/codex/*"
```

Result:

- Worktree was clean.
- `HEAD == master == origin/master == 02396ecc1df966ff1bf7cbca752fa6c04a322755`.
- No local or remote `codex/*` branches were present.

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-content-subject-scope-guard.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-content-subject-scope-guard.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-subject-authorization-context-contract-decision.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/validators/organization-training.ts`

## Readonly Findings

- `src/server/contracts/effective-authorization-contract.ts` keeps `EffectiveAuthorizationContextDto` source-backed by
  `profession` and `level` and does not define a `subject` key.
- `src/server/contracts/organization-training-contract.ts` keeps `subject` on organization training draft and published
  version DTOs, matching the content/request scope decision.
- `src/server/services/organization-training-service.ts` defines manual draft input with `subject`, validates selected
  `subject` using the existing subject value source, rejects invalid selected `subject` as `invalid_manual_draft_input`,
  and preserves valid `subject` into the metadata-only draft write.
- The service content scope match still compares source-backed authorization `profession/level` to selected
  `profession/level`; it does not imply source-backed subject authorization.
- `src/server/services/organization-training-service.test.ts` asserts that `EffectiveAuthorizationContextDto` lacks a
  `subject` key, covers invalid selected `subject` rejection, preserves valid `subject`, and checks the draft result does
  not expose formal content target identifiers or provider/raw prompt/raw answer fields.
- `src/server/validators/organization-training.ts` independently validates `subject` for publish input, while this
  readonly recheck did not expand route, service, repository, mapper, model, validator, or UI surfaces.
- ADR-002 layering remains intact for the reviewed surface: contract definitions stay in contracts, validation stays in
  validators, business guard logic stays in the service, and this task did not introduce route/repository/model/API/UI
  changes.

## Decision

pass_readonly_recheck_no_findings

## RED / GREEN

RED: not applicable. This is a readonly recheck and does not implement product behavior.

GREEN: readonly review confirms service/contract/test consistency after the subject scope guard and preserves the
`EffectiveAuthorizationContextDto` source-backed `profession/level` boundary.

## Validation

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

- Reported current branch:
  `codex/advanced-organization-training-content-subject-scope-readonly-recheck`.
- Reported changed files were limited to state files and the task plan before evidence/audit creation.
- Reported no commits ahead of `origin/master` before the local closeout commit.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck
```

Result: PASS on 2026-06-15.

- `preCommitMode: hard_block`.
- `filesToScan: 5`.
- Scope scan reported `OK_SCOPE` for the two state files, the task plan, evidence, and audit.
- Sensitive evidence and terminology scans completed without hard-block findings.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck
```

Result: PASS on 2026-06-15.

- `moduleCloseoutMode: hard_block`.
- Evidence and audit paths were accepted.
- Required validation commands were recorded.
- Module Run v2 strict evidence anchors passed.
- Exit code: 0.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-content-subject-scope-readonly-recheck
```

Result: PASS on 2026-06-15.

- `prePushMode: hard_block`.
- Git readiness passed for the short branch.
- `master`, `origin/master`, state master, and state origin master were aligned at
  `02396ecc1df966ff1bf7cbca752fa6c04a322755`.
- Evidence and audit paths were accepted.
- Exit code: 0.

## needs_recheck

- No blocking finding from this readonly recheck.
- Next task should be selected from the pending queue after user review; this task does not seed a new implementation
  follow-up.

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
- No `subject` field added to `EffectiveAuthorizationContextDto`.
- No formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, `mistake_book`, or `answer_record` writes.
- No formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
