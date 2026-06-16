# Evidence: advanced-organization-training-publish-version-service-runtime-wiring

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-service-runtime-wiring`
- Task kind: L2 local implementation, TDD, no DB execution.
- Batch range: single fresh-approved implementation task after
  `advanced-organization-training-publish-version-service-runtime-wiring-seeding`.
- Branch: `codex/advanced-organization-training-publish-version-service-runtime-wiring`
- Baseline: `master == origin/master == b6fc240a25b7d1d4d599812a051abfdd8f3c8f07`
- Commit: `b6fc240a25b7d1d4d599812a051abfdd8f3c8f07` accepted baseline before the local closeout commit; the task commit
  will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit user approval to execute the recommended next task.
- localFullLoopGate: scoped organization training unit tests, diff check, lint, typecheck, GitCompletionReadiness,
  PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover expected; implementation is scoped to service/repository tests and runtime wiring.
- nextModuleRunCandidate: `advanced-organization-training-publish-version-service-runtime-wiring-readonly-recheck-seeding`.
- Cost Calibration Gate remains blocked.
- result: pass_tdd_service_runtime_wiring_no_db_execution

## Readiness Gate

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

Result: PASS before branch creation.

- `HEAD == master == origin/master == b6fc240a25b7d1d4d599812a051abfdd8f3c8f07`.
- Worktree was clean.
- No local or remote `codex/*` branches were present.

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service-runtime-wiring-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/server/mappers/organization-training-mapper.ts`
- `src/server/mappers/organization-training-mapper.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`

## RED / GREEN

RED: PASS on 2026-06-15 before implementation.

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"
```

- Vitest reported `Test Files 1 failed (1)`.
- Vitest reported `Tests 1 failed | 11 passed (12)`.
- Failure reason matched missing runtime wiring: the publish store write did not include internal `organizationId` and `orgAuthId`.
- Exit code: 1.

GREEN: PASS on 2026-06-15 after implementation.

- Service publish command now carries `persistenceLineage` with internal `organizationId` and `orgAuthId`.
- Service validates lineage as positive integer internal ids and blocks invalid lineage with `invalid_publish_input`.
- Service passes lineage only to the injected publish store/repository boundary.
- Public publish DTO still omits internal numeric ids and authorization lineage.
- Repository input type is aligned to the service persistence write type; no DB execution, schema, mapper, route, API, UI, or formal target write changed.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/repositories/organization-training-repository.test.ts" "src/server/mappers/organization-training-mapper.test.ts"
```

Result: PASS. Vitest reported 3 files passed and 19 tests passed.

```powershell
npm.cmd run test:unit -- "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts" "src/db/schema/organization-training.test.ts"
```

Result: PASS. Vitest reported 3 files passed and 14 tests passed.

```powershell
git diff --check
```

Result: PASS.

```powershell
npm.cmd run lint
```

Result: PASS. ESLint completed successfully.

```powershell
npm.cmd run typecheck
```

Result: PASS. `tsc --noEmit` completed successfully.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: PASS. Git completion readiness inventory completed.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-service-runtime-wiring
```

Result: PASS. Pre-commit hardening passed for the eight allowed task files.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-service-runtime-wiring
```

Initial result: FAIL. Queue entry was missing `evidencePath` and `auditReviewPath` scalar anchors.

Updated result: PASS after adding the missing queue path anchors.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-service-runtime-wiring
```

Result: PASS. Pre-push readiness passed.

## Blocked Gates Preserved

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No migration generation, migration execution, `drizzle-kit push`, or destructive database operation.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, API runtime, contract, model, validator, mapper, or UI changes.
- No formal content write and no formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
