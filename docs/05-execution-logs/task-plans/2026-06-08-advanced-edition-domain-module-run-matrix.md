# Advanced Edition Domain Module Run Matrix Plan

## Goal

Create a docs-only source-of-truth matrix that lets future advanced-edition implementation use a domain-level Module Run rhythm instead of restarting full governance for every small Batch.

## Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

This task is docs-only governance. It creates a domain module advancement matrix for these seven advanced-edition modules:

- `authorization-context`
- `ai-task-domain`
- `personal-ai-generation`
- `organization-training`
- `organization-analytics`
- `ops-authorization-quota`
- `retention-log-governance`

## Allowed Files

- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-08-advanced-edition-domain-module-run-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-08-advanced-edition-domain-module-run-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-advanced-edition-domain-module-run-matrix.md`

## Blocked Files And Actions

- No product code under `src/**`.
- No dependency, package, lockfile, schema, migration, `src/db/schema/**`, `drizzle/**`, `.env.local`, `.env.example`, `scripts/**`, or `e2e/**`.
- No repository, API route, Server Action, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, or real authorization permission model work.
- Cost Calibration Gate remains blocked and must not be executed.

## Tasks

1. Create the domain module run matrix.
   - Record module ownership, contract ladder, allowed surfaces, blocked surfaces, data exposure rules, stop conditions, batch slicing, validation profile, and evidence strategy.
2. Register the matrix in the mechanism source-of-truth index.
   - Add it as a canonical state file and recovery input for future Module Run planning.
3. Update project state and task queue.
   - Mark this docs-only governance task as current while in progress, then done after validation.
4. Write evidence and audit review.
   - Prove the task stayed docs-only and did not execute blocked gates.

## Validation Matrix

- `git diff --check`
- scoped `prettier --write`
- scoped `prettier --check`
- required anchor check for `Module Run`, `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`, `local_auto_candidate`, and `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

- Any need to change product code, schema, dependency, provider, env/secret, deployment, payment, external-service, or Cost Calibration Gate execution.
- Any ambiguity that would make Module Run rules alter real authorization permission behavior.
- Any Git state drift from `master` / `origin/master` that changes the task base.
