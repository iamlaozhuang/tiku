# Task Plan: ai-generation-central-repair-approval-2026-07-01

## Task

- Task id: `ai-generation-central-repair-approval-2026-07-01`
- Branch: `codex/ai-generation-central-repair-approval`
- Task kind: docs/state central approval materialization
- Goal: record the user's centralized authorization for the bounded AI 出题 / AI 组卷 repair program, including high-risk local runtime categories, while preserving task-level boundaries and regression gates.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- all ADR files under `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-core-repair-roadmap.md`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-central-repair-approval.md`
- `docs/05-execution-logs/task-plans/2026-07-01-ai-generation-central-repair-approval.md`
- `docs/05-execution-logs/evidence/2026-07-01-ai-generation-central-repair-approval.md`
- `docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-central-repair-approval.md`

Blocked in this approval-materialization task:

- runtime source and test edits;
- `.env*` reads or writes;
- package or lockfile changes;
- database connection/read/write/reset/seed/import;
- schema/migration changes;
- browser/dev-server/e2e runtime;
- Provider call/configuration/credential read;
- staging/prod/cloud/deploy;
- release readiness/final Pass/Cost Calibration execution.

## Implementation Steps

1. Create branch `codex/ai-generation-central-repair-approval`.
2. Read required standards, ADRs, project state, task queue, and AI generation repair roadmap.
3. Add the central approval package.
4. Add task plan, evidence, and audit review.
5. Materialize standing approval and update queued tasks to reference the approval.
6. Run scoped formatting, lint, typecheck, diff check, and Module Run v2 gates.
7. Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after validation passes.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-07-01-ai-generation-central-repair-approval.md docs/05-execution-logs/task-plans/2026-07-01-ai-generation-central-repair-approval.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-central-repair-approval.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-central-repair-approval.md
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-07-01-ai-generation-central-repair-approval.md docs/05-execution-logs/task-plans/2026-07-01-ai-generation-central-repair-approval.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-central-repair-approval.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-central-repair-approval.md
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-central-repair-approval-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-central-repair-approval-2026-07-01 -SkipRemoteAheadCheck
```

## Risk Defense

- This task records approval only; it does not execute the high-risk capabilities it approves for later bounded tasks.
- Future tasks must still materialize exact boundaries before consuming this approval.
- Evidence must remain redacted and must not include secrets, raw AI material, raw DB rows, raw DOM, screenshots, traces, or full question/paper/material content.
