# Phase 19-02 Dedup Severity Taxonomy Task Plan

**Date:** 2026-05-27

**Task id:** `phase-19-02-dedup-severity-taxonomy`

**Branch:** `codex/phase-19-02-dedup-severity-taxonomy`

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
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-finding-inventory.md`
- Phase 18 audit catalog, traceability matrix, total report, RA reports, and evidence.

## Goal

Review the 51 Phase 18 findings from the Phase 19-01 inventory, assign canonical finding ids, identify duplicate or inherited relationships, classify taxonomy categories, and assign initial severity.

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

## Method

1. Treat each Phase 18 finding as a candidate.
2. Merge only when findings describe the same root issue or a direct inherited UI/admin symptom of the same missing backend capability.
3. Keep related-but-distinct issues separate and record their relationship in notes.
4. Assign `critical`, `high`, `medium`, or `low` based on impact:
   - `critical`: proven production-blocking security/data-loss issue. None is assigned in this docs-only review because Phase 18 did not prove a critical exploit or destructive data-loss path.
   - `high`: core authorization/security/session/data-integrity/scoring workflow risk.
   - `medium`: incomplete core business capability or cross-role workflow with bounded workaround or partial implementation.
   - `low`: evidence/UI detail/configuration completeness gap with limited runtime blast radius.
5. Record category dimensions using the Phase 19 taxonomy: `auth`, `content`, `student`, `ai`, `rag`, `admin`, `test`, `browser`, `data`, `api`, `security`, `ops`.

## Deliverables

- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-dedup-severity-taxonomy.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-19-02-dedup-severity-taxonomy.md`
- Updated queue and project-state for Phase 19-02.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-19-02-dedup-severity-taxonomy.md docs\05-execution-logs\evidence\2026-05-27-phase-19-02-dedup-severity-taxonomy.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-19-dedup-severity-taxonomy.md
```
