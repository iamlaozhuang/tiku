# Admin AI Generation Provider Route Integrated Smoke Approval Package Plan

Task ID: `admin-ai-generation-provider-route-integrated-smoke-approval-package-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-runtime-bridge-provider-disabled-integration-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-route-provider-disabled-focused-smoke.md`

## Goal

Prepare a docs/state-only approval package for future admin AI generation Provider route-integrated smoke. This task does not execute Provider calls, does not read credentials, and does not modify source, tests, DB, schema, migration, seed, package/lockfile, or env files.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-provider-route-integrated-smoke-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-provider-route-integrated-smoke-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-provider-route-integrated-smoke-approval-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-provider-route-integrated-smoke-approval-package.md`

Blocked files and actions:

- Source/tests, DB/schema/migration/seed, package/lockfile, env files.
- Provider calls, Provider credential reads, cost calibration execution, live DB route smoke, browser/dev-server/e2e runtime, formal question/paper writes, staging/prod, payment, external-service, deployment, and release readiness.

## Decision Questions

1. Can a future real Provider smoke run directly now?
2. If not, what minimal source task must precede it?
3. What routes, workflows, call count, budget, credentials, evidence redaction, and failure branches are allowed once execution is separately approved?

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown <changed-files>`
- `npx.cmd prettier --check --ignore-unknown <changed-files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-provider-route-integrated-smoke-approval-package-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-provider-route-integrated-smoke-approval-package-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop before continuing if the task requires Provider credentials, real Provider calls, env reads, source changes, schema/migration changes, live DB access, browser/dev-server/e2e runtime, formal generated content adoption, staging/prod, payment, external-service, deployment, or release readiness work.
