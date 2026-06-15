# Task Plan: advanced-organization-training-contract-validation-readonly-recheck

## Objective

Readonly recheck after the organization training contract/validator scaffold to confirm DTO naming, nullability,
redaction semantics, first-release question type validation, formal content isolation, ADR-002 readiness, and blocked gate
preservation.

## Approval

- User approved continuing after task 2 in the current 2026-06-15 Codex thread by saying "批准执行".
- Approval covers this readonly audit task plan, evidence, audit review, durable state updates, local validation, local
  commit, fast-forward merge to `master`, push to `origin/master`, short-branch cleanup, and fetch prune.

## Required Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-boundary-readonly-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-contract-validation-scaffold.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-contract-validation-scaffold.md`

## Readonly Source Surfaces

- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`

## Audit Checks

- Confirm DTO fields are camelCase, public-id based, and do not expose numeric database ids.
- Confirm optional public contract fields use `null`.
- Confirm first-release question type allowlist and deferred question type rejection are covered.
- Confirm admin summary DTO and denylist preserve summary-only redaction semantics.
- Confirm no route, service, repository, mapper, schema, migration, provider, UI, formal content write, DB, or external
  service work was introduced by the scaffold.
- Confirm ADR-002 layering remains intact because no transport/runtime persistence layer was added.
- Record any needs_recheck without modifying product source.

## Validation Commands

- `npm.cmd run test:unit -- "src/server/validators/organization-training.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-contract-validation-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-contract-validation-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-contract-validation-readonly-recheck`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access, direct row/private data, provider/model call, provider configuration, provider payload, raw prompt, raw
  answer, quota/cost, Cost Calibration Gate, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment,
  external-service, schema/drizzle/scripts/package/lockfile/dependency, route/service/repository/mapper/API runtime/UI,
  formal content write, formal target write, PR, or force push.
