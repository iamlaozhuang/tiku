# Task Plan: phase-11-staging-resource-plan

## Metadata

- Task id: `phase-11-staging-resource-plan`
- Branch: `codex/phase-11-staging-resource-plan`
- Base: `master`
- Created at: `2026-05-25`
- Human approval: User approved adopting the recommendation to create the next Phase 11 planning task, starting with `phase-11-staging-resource-plan`. Approval is planning-only and does not approve staging/prod connection, deployment, cloud resource creation or modification, secret/env changes, dependency/package/lockfile changes, schema/migration/script changes, real provider calls, destructive data operations, or recording sensitive/raw content.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest Phase 11 evidence, especially:
  - `docs/05-execution-logs/evidence/2026-05-23-phase-11-staging-release-planning.md`
  - `docs/05-execution-logs/evidence/2026-05-23-phase-11-staging-architecture-adr.md`
  - `docs/05-execution-logs/evidence/2026-05-25-phase-11-objective-feedback-correctness-fix.md`

## Scope

Create a planning-only staging resource inventory and queue item. This task is a design and governance step, not a provisioning step.

Allowed files:

- `docs/02-architecture/interfaces/phase-11-staging-resource-plan.md`
- `docs/05-execution-logs/task-plans/2026-05-25-phase-11-staging-resource-plan.md`
- `docs/05-execution-logs/evidence/2026-05-25-phase-11-staging-resource-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

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

1. Restore repository state from `master` and create a short-lived branch.
2. Add `phase-11-staging-resource-plan` to the task queue with planning-only approval boundaries.
3. Create `phase-11-staging-resource-plan.md` covering runtime, PostgreSQL/pgvector, object storage, auth, AI provider controls, audit retention, seed/reset data, monitoring, and ownership.
4. Write evidence with AC-to-runtime matrix, issue grading, validation records, repository hygiene checklist, `stagingDecision`, and next recommended action.
5. Run required validation commands.
6. Create one reviewable commit. Merge and push require explicit approval if not already covered by the user's instruction.

## Risk Controls

- Do not read or output `.env.local`.
- Do not connect to staging or production.
- Do not create or modify cloud resources.
- Do not deploy.
- Do not change package files, lockfiles, runtime source, schema, migrations, scripts, or environment examples.
- Do not record secrets, tokens, Authorization headers, database URLs, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/textbook/OCR content, or customer/customer-like private data.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-resource-plan
Select-String -Path 'docs\02-architecture\interfaces\phase-11-staging-resource-plan.md' -Pattern 'No cloud resource|No staging/prod|No deployment|No secret/env|PostgreSQL|Object storage|AI provider'
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
