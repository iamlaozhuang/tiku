# Task Plan: Advanced Organization Analytics Post Service Wiring Recheck Seeding

## Task

- Task id: `advanced-organization-analytics-post-service-wiring-recheck-seeding`
- Branch: `codex/organization-analytics-post-service-wiring-recheck-seeding`
- Baseline: `HEAD == master == origin/master == b596b3e84c679d4869c4598fb8afc5e717ffe2c7`
- Scope: docs/state-only queue refresh after service wiring TDD closeout.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-analytics-repository-service-wiring-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-analytics-repository-service-wiring-tdd.md`

## Implementation Plan

1. Refresh durable state to the current local master/origin master baseline.
2. Mark this seeding task as closed with redacted evidence.
3. Seed a pending readonly recheck task for repository-backed organization analytics service wiring.
4. Keep all implementation, route/runtime, DB/schema, provider, dependency, e2e/browser/dev-server, staging/prod/cloud/deploy/payment/external-service, PR, force-push, and Cost Calibration Gate work blocked.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-analytics-post-service-wiring-recheck-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-analytics-post-service-wiring-recheck-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-analytics-post-service-wiring-recheck-seeding`
