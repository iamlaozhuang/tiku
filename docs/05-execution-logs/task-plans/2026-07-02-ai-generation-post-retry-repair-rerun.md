# AI generation post retry repair rerun

## Task

- Task id: `ai-generation-post-retry-repair-rerun-2026-07-02`
- Branch: `codex/ai-generation-post-retry-repair-rerun`
- Scope: bounded localhost learner rerun after retry terminal-state repair.

## Plan

1. Confirm localhost remains available.
2. Login personal advanced student with local test-owned credential in memory only.
3. Submit AI出题 once and AI组卷 once.
4. Record only retry/start-practice enabled counts, status counts, duration bucket, and failure class.
5. Do not record generated content, prompt, Provider payload, raw AI output, screenshots, raw DOM, browser storage, credentials, env values, DB rows, or PII.

## Boundaries

- No source/test/dependency/schema/seed/migration changes.
- No `.env*` read/write; the running app may consume its existing local Provider config.
- No direct DB connection or mutation.
- No e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass.

## Validation Commands

- `npm.cmd exec -- prettier --check --ignore-unknown <changed-docs>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-post-retry-repair-rerun-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-post-retry-repair-rerun-2026-07-02 -SkipRemoteAheadCheck`
