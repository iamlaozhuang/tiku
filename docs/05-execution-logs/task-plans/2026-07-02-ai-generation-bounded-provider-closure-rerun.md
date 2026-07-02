# AI generation bounded Provider closure rerun

## Task

- Task id: `ai-generation-bounded-provider-closure-rerun-2026-07-02`
- Branch: `codex/ai-generation-bounded-provider-closure-rerun`
- Scope: bounded localhost Provider rerun for fresh AI出题 / AI组卷 current-result closure after application-state repair.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Provider Sample Plan

1. Confirm localhost is healthy.
2. Use only in-memory local test-owned role credentials for browser login.
3. Run at most four UI submit attempts total, no retry loop:
   - content admin AI出题
   - content admin AI组卷
   - personal advanced student AI出题
   - personal advanced student AI组卷
4. Observe only business status, counts, action enabled/disabled state, duration bucket, and failure category.
5. Do not record generated text, prompt, Provider payload, raw AI output, full question/paper/material/resource/chunk content, screenshots, raw DOM, or browser storage.

## Boundaries

- No source/test/dependency/schema/seed/migration changes.
- No `.env*` read/write; Provider key is consumed only by the running app.
- No direct DB connection or mutation.
- No e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-bounded-provider-closure-rerun-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-bounded-provider-closure-rerun-2026-07-02 -SkipRemoteAheadCheck`
