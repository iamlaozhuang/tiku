# Task Plan: advanced-organization-training-draft-lifecycle-service-seeding

## Goal

Seed one narrow follow-up implementation task for the first organization training draft lifecycle service step.

This task is docs/state only. It does not implement the service.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-answer-status-alignment-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-answer-status-alignment-readonly-recheck.md`

## Baseline

- Start from `master`.
- Run `git fetch --prune origin`.
- Require clean worktree.
- Require `HEAD == master == origin/master`.
- Require no local or remote `codex/*` residual branches.

## Seeding Scope

Create durable records for:

1. The closed seed task `advanced-organization-training-draft-lifecycle-service-seeding`.
2. The follow-up pending task `advanced-organization-training-draft-lifecycle-service`.

The pending task must be TDD and limited to the first manual draft creation service contract. It may use a service-local
port/interface and in-memory fake in tests. It must not create a real repository, route, API runtime, UI, schema,
migration, provider integration, quota/cost behavior, or formal content write.

## Follow-up Task Boundary

Allowed implementation files for the follow-up task:

- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`

Allowed docs/state files for the follow-up task:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-draft-lifecycle-service.md`

The follow-up must stop and report instead of expanding scope if it discovers the first service step needs a true
repository, schema, route, UI, provider, quota/cost, DB access, or formal content write.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/validators/organization-training.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-draft-lifecycle-service-seeding`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access, row/private data, provider/model call, provider configuration, provider payload, raw prompt, or raw
  answer.
- No quota/cost measurement and no Cost Calibration Gate execution.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No schema, drizzle, scripts, package, lockfile, or dependency change.
- No product source implementation in this seed task.
- No formal content write and no formal adoption target write.
- No public identifier value list exposure.
- No PR and no force push.
