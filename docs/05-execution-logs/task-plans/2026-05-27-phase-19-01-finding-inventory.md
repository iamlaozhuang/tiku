# Phase 19-01 Finding Inventory Task Plan

**Date:** 2026-05-27

**Task id:** `phase-19-01-finding-inventory`

**Branch:** `codex/phase-19-01-finding-inventory`

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
- Phase 18 catalog, traceability matrix, total report, RA-01 through RA-06 audit reports, and matching evidence.

## Goal

Create a complete inventory of the 51 Phase 18 findings without fixing business bugs, changing Phase 20+ task structure, or doing final deduplication/severity grading.

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

## Implementation Steps

1. Confirm startup state, master alignment, worktree residue, current project-state, blocked gates, and Phase 19 queue absence.
2. Create the short-lived branch `codex/phase-19-01-finding-inventory`.
3. Register Phase 19 parent governance task and four child tasks, reusing existing tasks if present. No existing Phase 19 task was found.
4. Create this task plan.
5. Create `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-finding-inventory.md` with all 51 findings.
6. Create evidence under `docs/05-execution-logs/evidence/2026-05-27-phase-19-01-finding-inventory.md`.
7. Run required docs-only validation gates and record results in evidence.
8. Commit, merge to `master`, push `origin/master`, clean the short-lived branch, then stop before Phase 19-02.

## Inventory Rules

- `findingId` must be non-null and unique.
- Every finding must include source RA block, `auditId`, `requirementId`, original Phase 18 status, original problem summary, evidence path, associated Phase 20+ `taskId`, preliminary category, preliminary duplicate group, preliminary severity, and notes.
- `duplicateGroupCandidate` remains `null` in Phase 19-01.
- `severityCandidate` remains `null` in Phase 19-01.
- Phase 20+ queue structure is not modified beyond registering Phase 19 tasks.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
git diff --check
node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-19-01-finding-inventory.md docs\05-execution-logs\evidence\2026-05-27-phase-19-01-finding-inventory.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-19-finding-inventory.md
```

## Risk Controls

- This is docs-only governance work; source and runtime behavior are unchanged.
- Finding summaries are copied from Phase 18 reports/matrix at a bounded summary level.
- No secret, provider payload, raw prompt/answer, full paper, full textbook, OCR full text, or customer-like private data is recorded.
- Long-lived blocked gates remain blocked.
