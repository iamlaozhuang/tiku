# Phase 19-03 Coverage Matrix Review Task Plan

**Date:** 2026-05-27

**Task id:** `phase-19-03-coverage-matrix-review`

**Branch:** `codex/phase-19-03-coverage-matrix-review`

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-traceability-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-finding-inventory.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-dedup-severity-taxonomy.md`

## Goal

Build a Phase 19 review matrix from all 64 requirement/audit rows and check whether implementation status, test status, browser status, finding ids, and canonical finding ids are internally consistent.

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked writes and actions:

- No `.env.local` or `.env.example` read/write.
- No `package.json`, lockfile, dependency, source, test, e2e, schema, drizzle, or script changes.
- No staging, prod, cloud, deploy, real provider, destructive data operation, or business bug fix.

## Review Checks

1. Confirm all 64 matrix rows are present.
2. Confirm every `partial` or `missing` row has a finding id.
3. Confirm every finding id maps to one canonical finding id.
4. Check for implemented rows with partial/missing test or browser coverage.
5. Check whether blocked gates were incorrectly converted into row-level `blocked` status.
6. Record follow-up candidates for Phase 19-04 only; do not modify Phase 20+ fix task structure here.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-19-03-coverage-matrix-review.md docs\05-execution-logs\evidence\2026-05-27-phase-19-03-coverage-matrix-review.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-19-coverage-matrix-review.md
```
