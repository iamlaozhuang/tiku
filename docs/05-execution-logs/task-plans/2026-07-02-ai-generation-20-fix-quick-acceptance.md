# AI generation 20 fix quick acceptance task plan

## Task

- Task id: `ai-generation-20-fix-quick-acceptance-2026-07-02`
- Branch: `codex/ai-generation-20-fix-quick-acceptance`
- Source: user approved a quick acceptance pass after the scoped AI出题 / AI组卷 repair chain was closed.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest AI generation evidence and audit records from 2026-07-01 and 2026-07-02.

## Scope

- Run a local owner-preview quick acceptance over the 20 repaired issue classes.
- Use the in-app browser against `http://localhost:3000`.
- Use local role credentials only in memory for localhost login when needed.
- Record only redacted role, route, workflow, status, count, duration bucket, and pass/fail/blocked/not_applicable summaries.

## Matrix

- Entry and authorization: personal standard, personal advanced, organization standard employee, organization advanced employee, organization standard admin, organization advanced admin.
- AI surfaces: personal advanced learner, organization advanced employee, organization advanced admin, content admin.
- Admin surfaces: content AI出题, content AI组卷, organization AI出题, organization AI组卷.
- Cross-cutting checks: level options, ordinary UI wording, history isolation, pagination/filter affordances, resource grounding status, generated-result application boundary, learner retry/practice gate.

## Provider Boundary

- Provider calls are allowed only through localhost UI and only when a page action naturally performs AI generation.
- Max submit attempts: 8 total.
- Max per role/function route: 1.
- No retries.
- Evidence must not record raw prompts, Provider payloads, raw AI output, generated question/paper text, or full resource/material/chunk content.

## Forbidden

- No source/test/runtime code changes.
- No `.env*` read or modification.
- No DB raw rows or direct DB mutation.
- No schema/migration/seed/package/lockfile/dependency changes.
- No e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, final Pass, PR, or force push.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-20-fix-quick-acceptance.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-20-fix-quick-acceptance.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-20-fix-quick-acceptance.md`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-20-fix-quick-acceptance-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-20-fix-quick-acceptance-2026-07-02 -SkipRemoteAheadCheck`
