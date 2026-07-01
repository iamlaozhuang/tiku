# Task Plan: ai-generation-repair-roadmap-2026-07-01

## Task

- Task id: `ai-generation-repair-roadmap-2026-07-01`
- Branch: `codex/ai-generation-repair-roadmap`
- Task kind: docs/state roadmap materialization
- Goal: make the AI 出题 / AI 组卷 repair strategy durable in repository files and task queue so future work can resume without relying on chat context.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-core-walkthrough-contract.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-core-repair-roadmap.md`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md`
- `docs/05-execution-logs/task-plans/2026-07-01-ai-generation-repair-roadmap.md`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-repair-roadmap.md`
- `docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-repair-roadmap.md`

Blocked:

- `.env*`
- package and lock files
- runtime source and test edits
- database reads/writes, schema, migration, seed, destructive reset, resource import
- Provider call/configuration/credential read
- browser/e2e/dev-server runtime
- screenshots, traces, raw DOM, HTML dumps
- staging/prod/cloud/deploy
- Cost Calibration, release readiness, final Pass, PR, force push

## Implementation Steps

1. Create branch `codex/ai-generation-repair-roadmap`.
2. Read required standards, ADRs, project state, task queue, and AI generation walkthrough contract.
3. Add repair roadmap with ordered P0/P1/P2/data-backed/eight-role/Provider phases.
4. Add root-cause and reuse protocol.
5. Materialize the roadmap task and future queued tasks in project state and task queue.
6. Add redacted evidence and audit review.
7. Run formatting, `git diff --check`, lint, typecheck, and Module Run v2 gates.
8. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after validation passes.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-07-01-ai-generation-core-repair-roadmap.md docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md docs/05-execution-logs/task-plans/2026-07-01-ai-generation-repair-roadmap.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-repair-roadmap.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-repair-roadmap.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-07-01-ai-generation-core-repair-roadmap.md docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md docs/05-execution-logs/task-plans/2026-07-01-ai-generation-repair-roadmap.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-repair-roadmap.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-repair-roadmap.md
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-repair-roadmap-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-repair-roadmap-2026-07-01 -SkipRemoteAheadCheck
```

## Risk Defense

- This task only records the roadmap and queue. It does not fix OP-01 through OP-09.
- Future repair tasks must still create their own task plans and exact boundaries before code changes.
- Data-backed and real Provider stages remain blocked until fresh approval.
- Evidence must remain redacted and must not include secrets, raw AI material, raw DB rows, raw DOM, screenshots, traces, or full question/paper/material content.
