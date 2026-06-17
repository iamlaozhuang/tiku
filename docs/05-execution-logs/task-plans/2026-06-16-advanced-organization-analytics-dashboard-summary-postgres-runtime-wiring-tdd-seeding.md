# Task Plan: Advanced Organization Analytics Dashboard Summary Postgres Runtime Wiring TDD Seeding

## Task

- Task id: `advanced-organization-analytics-dashboard-summary-postgres-runtime-wiring-tdd-seeding`
- Task kind: docs/state-only implementation queue seeding
- Branch: `codex/organization-analytics-runtime-wiring-seeding`
- Date: 2026-06-16

## Preconditions Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Existing organization analytics dashboard route/service/repository source files as readonly references.

## Local Baseline

- `master`, local `HEAD`, and `origin/master` were confirmed aligned at `d63b5f544026eb457754878a5e53af939da0fd2f`.
- No local or remote `codex/*` refs were present before the short branch was created.
- The task queue had no current `pending` task after `advanced-organization-analytics-postgres-gateway-source-readers-tdd` closed.

## Implementation Plan

1. Keep this task docs/state-only.
2. Append one closed seeding task entry for this work.
3. Seed exactly one pending TDD task for dashboard summary Postgres runtime wiring.
4. Constrain the pending task to App Router/runtime wiring through the already implemented repository source readers.
5. Keep DB execution, `.env*`, schema/migration/drizzle, dependency, provider/model, UI, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force push, and Cost Calibration Gate blocked.

## Risk Controls

- Do not modify `src/**` in this seeding task.
- Do not read or summarize `.env*`.
- Do not expose secret material, raw rows, private data, provider payloads, raw prompts, raw answers, Authorization headers, DB URLs, or public identifier inventories.
- The seeded pending implementation task requires fresh approval before claim and has merge/push blocked by default.

## Validation Plan

- Confirm the new pending task and its allowed source files are present in `task-queue.yaml`.
- Run scoped formatting check for edited docs/state files.
- Run `git diff --check`, `npm.cmd run lint`, and `npm.cmd run typecheck`.
- Run Module Run v2 GitCompletion, PreCommit hardening, ModuleCloseout readiness, and PrePush readiness scripts for this seeding task.
