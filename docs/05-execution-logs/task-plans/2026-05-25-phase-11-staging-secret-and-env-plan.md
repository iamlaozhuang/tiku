# Task Plan: phase-11-staging-secret-and-env-plan

## Metadata

- Task id: `phase-11-staging-secret-and-env-plan`
- Branch: `codex/phase-11-staging-secret-and-env-plan`
- Base: temporary stacked base `codex/phase-11-external-readiness-context`; target base after prior context record is merged should be `master`.
- Created at: `2026-05-25`
- Human approval: User approved claiming and completing planning-only `phase-11-staging-secret-and-env-plan`. Approval does not allow reading `.env.local`, changing `.env.example`, creating or changing secrets/env values, connecting staging/prod, deploying, provisioning cloud resources, changing dependencies/package/lockfile, changing schema/migration/script/runtime code, calling real providers, or recording sensitive/raw content.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/02-architecture/interfaces/phase-11-staging-resource-plan.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-external-readiness-context-record.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Create a planning-only secret/env inventory and approval boundary for future `staging` implementation.

Allowed files:

- `docs/02-architecture/interfaces/phase-11-staging-secret-and-env-plan.md`
- `docs/05-execution-logs/task-plans/2026-05-25-phase-11-staging-secret-and-env-plan.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-staging-secret-and-env-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

This task also corrects the prior external readiness queue item to `closed` on this stacked branch so the dependency chain is claimable.

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Implementation Plan

1. Keep the external readiness record as the prerequisite context.
2. Add `phase-11-staging-secret-and-env-plan` to the task queue as `pending`.
3. Create `phase-11-staging-secret-and-env-plan.md` with variable names, sensitivity, planned source, injection target, evidence rule, and approval gate.
4. Write evidence with AC-to-runtime matrix, issue grading, validation records, repository hygiene checklist, `stagingDecision`, and next recommended action.
5. Run validation commands.
6. Close the queue item, update project state, and create one reviewable commit.

## Risk Controls

- Do not read or output `.env.local`.
- Do not edit `.env.example`.
- Do not create, rotate, infer, or record real secret values.
- Do not connect to staging or production.
- Do not create or modify cloud resources.
- Do not deploy.
- Do not change package files, lockfiles, runtime source, schema, migrations, scripts, or deployment configuration.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/textbook/OCR content, or customer/customer-like private data.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-secret-and-env-plan
Select-String -Path 'docs\02-architecture\interfaces\phase-11-staging-secret-and-env-plan.md' -Pattern 'APP_ENV|APP_BASE_URL|DATABASE_URL|BETTER_AUTH_SECRET|OBJECT_STORAGE_BUCKET|AI_PROVIDER_ENABLED|No .env.local|No .env.example|No staging/prod connection'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
```
