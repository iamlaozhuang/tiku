# AI generation post application closure rerun

## Task

- Task id: `ai-generation-post-application-closure-rerun-2026-07-02`
- Branch: `codex/ai-generation-post-application-closure-rerun`
- Scope: localhost owner-preview rerun after application closure and learner mixed-state repair.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Walkthrough Plan

1. Confirm or restart local dev server without printing env values.
2. Use localhost browser only and local test-owned credentials only in-memory.
3. Sample content admin AI出题/AI组卷, organization advanced admin AI出题/AI组卷, personal advanced learner AI出题/AI组卷, and organization advanced employee AI出题/AI组卷.
4. Verify ordinary UI does not expose technical governance wording.
5. Verify organization generated-result history shows a business next-step state.
6. Verify learner insufficient generated results do not enable practice actions while retry remains available.
7. Record only role labels, route labels, status counts, and failure categories.

## Boundaries

- No source/test changes in this task.
- No `.env*`, credentials, cookies, tokens, sessions, localStorage, Authorization header, Provider payload, prompt, raw AI output, DB raw row, internal numeric id, PII, or full generated/resource/question/paper/material/chunk content in evidence.
- No direct DB connection, reset, seed, migration, schema, dependency/package/lockfile, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.
- Provider calls are blocked by default for this rerun; use existing history and UI state unless a later task note explicitly narrows and authorizes a bounded sample.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-application-closure-rerun-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-application-closure-rerun-2026-07-02 -SkipRemoteAheadCheck`
