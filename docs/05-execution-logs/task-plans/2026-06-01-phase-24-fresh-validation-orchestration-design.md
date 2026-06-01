# Phase 24 Fresh Validation Orchestration Design Task Plan

## Required Reading

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/evidence/2026-06-01-phase-23-evidence-consolidation-closeout.md`
- `docs/05-execution-logs/evidence/2026-06-01-phase-24-state-reconciliation-preflight.md`

## Scope

- Task id: `phase-24-fresh-validation-orchestration-design`
- Branch: `codex/phase-24-fresh-validation-operationalization`
- Allowed files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-06-01-phase-24-fresh-validation-orchestration-design.md`
  - `docs/05-execution-logs/evidence/2026-06-01-phase-24-fresh-validation-orchestration-design.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-01-phase-24-fresh-validation-orchestration-design.md`
- Blocked files:
  - `.env.local`
  - `.env.example`
  - `package.json`
  - lockfiles
  - `scripts/**`
  - `src/**`
  - `tests/**`
  - `e2e/**`
  - `src/db/schema/**`
  - `drizzle/**`

## Design Steps

1. Classify Phase 23 validated steps into scriptable, approval-gated, and stop-the-line groups.
2. Define the minimum runner contract for the next subtask:
   - local/dev-only target verification;
   - fresh databaseName selection;
   - `.env.local` DATABASE_URL databaseName update without printing values;
   - non-destructive Docker Compose database creation;
   - reviewed Drizzle migrate;
   - dev seed;
   - validation data prep;
   - full e2e;
   - build.
3. Define evidence redaction rules and command result shape.
4. Record why no dependency, schema, migration, raw SQL, destructive DB, staging/prod/cloud/deploy, real provider, or external service work is allowed.

## Risk Gate

- Dependency change: blocked.
- Database migration: design permits only reviewed existing migrate workflow in later approved runner/verification tasks.
- Auth or permission model: not changed.
- Secret or environment change: design only in this task; later runner may perform approved databaseName-only `.env.local` update.
- Destructive data operation: blocked.
- Deploy or push: not run in this task.

## Validation Commands

```powershell
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
```

## Evidence

- Evidence path: `docs/05-execution-logs/evidence/2026-06-01-phase-24-fresh-validation-orchestration-design.md`
- Audit/design path: `docs/05-execution-logs/audits-reviews/2026-06-01-phase-24-fresh-validation-orchestration-design.md`
