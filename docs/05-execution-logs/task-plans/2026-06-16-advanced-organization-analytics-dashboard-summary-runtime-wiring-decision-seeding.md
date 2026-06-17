# Advanced Organization Analytics Dashboard Summary Runtime Wiring Decision Seeding Plan

## Task

- Task id: `advanced-organization-analytics-dashboard-summary-runtime-wiring-decision-seeding`
- Task kind: docs/state-only decision and queue seeding
- Branch: `codex/advanced-organization-analytics-dashboard-summary-runtime-wiring-decision-seeding`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-dashboard-summary-real-runtime-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-dashboard-summary-real-runtime-boundary-readonly-audit.md`
- `src/server/services/organization-analytics-route.ts`
- `src/app/api/v1/organization-analytics/dashboard-summary/route.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- Existing admin/session runtime patterns under `src/server/services/organization-training-route.ts` and `src/server/services/admin-organization-org-auth-runtime.ts`

## Scope

Create a docs/state-only decision record and seed one pending TDD task for the next safe implementation unit. The seeded task must not start real DB-backed repository factory work or App Router real runtime wiring. It should first establish runtime composition through injected dependencies while keeping the current default runtime fail-closed.

## Implementation Steps

1. Reconfirm no true pending task exists in `task-queue.yaml`.
2. Record the boundary decision: split runtime wiring into a route runtime composition contract before Postgres repository factory and App Router real wiring.
3. Append a pending task named `advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd`.
4. Update `project-state.yaml` handoff and current task metadata for this seeding task.
5. Write evidence and audit files.
6. Run declared validation commands:
   - `Select-String -Path docs/04-agent-system/state/task-queue.yaml -Pattern "advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd","status: pending","src/server/services/organization-analytics-route.ts","src/server/services/organization-analytics-route.test.ts"`
   - `git diff --check`
   - `npm.cmd run lint`
   - `npm.cmd run typecheck`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-dashboard-summary-runtime-wiring-decision-seeding`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-runtime-wiring-decision-seeding`
   - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-dashboard-summary-runtime-wiring-decision-seeding`

## Risk Controls

- Do not read, output, summarize, or modify `.env*`.
- Do not modify `src/**`, schema, drizzle, package, lockfile, scripts, UI, or e2e files in this task.
- Do not call providers, models, external services, cloud, staging, prod, deploy, payment, or Cost Calibration Gate.
- Do not include row/private data, real public identifier lists, secret values, DB URLs, provider payloads, raw prompts, raw answers, Authorization headers, or cookies in evidence.
- Keep the seeded pending task narrow enough for TDD and local unit validation only.
