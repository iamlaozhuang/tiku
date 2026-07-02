# AI generation learner retry terminal-state repair

## Task

- Task id: `ai-generation-learner-retry-terminal-state-repair-2026-07-02`
- Branch: `codex/ai-generation-learner-retry-terminal-state-repair`
- Scope: source/test repair for learner AI generation retry action gating.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Root Cause Hypothesis

- The learner AI page enables retry whenever a local generation experience exists, without checking whether the current result has reached a terminal failed or insufficient state.
- Pending/running current results should keep retry disabled to avoid duplicate submits.

## Implementation Plan

1. Add a red test proving accepted pending current generation keeps `重试生成` disabled.
2. Preserve the existing insufficient completed-result behavior where retry is enabled and practice actions remain disabled.
3. Reuse the existing `resultState.status`, `evidenceStatus`, and citation count; do not introduce role-specific state models.
4. Run focused tests, lint/typecheck, formatting, and Module Run v2 gates.

## Boundaries

- No Provider call, browser runtime, DB connection, env read/write, dependency/package/lockfile, schema/migration/seed, e2e, staging/prod/deploy, Cost Calibration, release readiness, or final Pass.
- No credentials, tokens, Provider payloads, prompts, raw AI output, generated content, DB rows, internal ids, or PII in evidence.

## Validation Commands

- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed-files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-learner-retry-terminal-state-repair-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-learner-retry-terminal-state-repair-2026-07-02 -SkipRemoteAheadCheck`
