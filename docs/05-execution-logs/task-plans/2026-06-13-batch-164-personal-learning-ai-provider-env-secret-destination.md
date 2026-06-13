# Task Plan: batch-164-personal-learning-ai-provider-env-secret-destination

## Scope

- Task: `batch-164-personal-learning-ai-provider-env-secret-destination`
- Branch: `codex/batch-164-personal-learning-ai-provider-env-secret-destination`
- Baseline: `d4334d50b345118c8f9c0cfc8c883f0311e05107`
- Task kind: provider env/secret destination gate.

## Readiness

- Re-read `AGENTS.md`, `docs/03-standards/code-taste-ten-commandments.md`, all ADR files, project state, task queue, and
  batch-162/batch-163 evidence before this task sequence.
- Confirmed `master`, `HEAD`, and `origin/master` were all `d4334d50b345118c8f9c0cfc8c883f0311e05107`.
- Confirmed the worktree was clean and no local or remote `codex/*` short branches remained before task branch creation.
- Created short branch `codex/batch-164-personal-learning-ai-provider-env-secret-destination`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it reported no tracked, staged, or
  untracked changes and no files changed against `origin/master`.
- Read only `.env.example` for env template context. `.env.local` and real secret/env/provider configuration were not
  read, created, or modified.

## Human Approval

- human approval: The user prompt on 2026-06-13 explicitly approved
  `batch-164-personal-learning-ai-provider-env-secret-destination`.
- Approved file surface: `.env.example` plus task state, task queue, task plan, evidence, and audit.
- Approved destination type: template-only variable-name placeholders.
- Redaction rule: no real secret values, provider payloads, raw prompts, model responses, Authorization headers, tokens,
  database URLs, or private data may be recorded.
- Explicitly blocked: `.env.local`, real env/secret/provider configuration, provider calls, sandbox execution,
  schema/migration, generated-content persistence, e2e, deploy, payment, external-service, PR, force-push, and Cost
  Calibration.

## Implementation Plan

1. Update `.env.example` only to document provider placeholder names needed by future server-side adapters.
2. Keep placeholders empty or non-secret boolean defaults only; do not add real values.
3. Record evidence that `.env.local` was not touched and no provider was called.
4. Run validation commands and Module Run v2 closeout/pre-push readiness.
5. Commit batch-164 independently, fast-forward merge to `master`, validate on `master`, push `origin master`, and delete
   the merged short branch.

## Allowed Files

- `.env.example`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-164-personal-learning-ai-provider-env-secret-destination.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-164-personal-learning-ai-provider-env-secret-destination.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-164-personal-learning-ai-provider-env-secret-destination.md`

## Blocked Files And Actions

- `.env.local`, package/lockfile, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `materials/**`,
  `paper_assets/**`, `playwright-report/**`, and `test-results/**` remain blocked.
- Provider calls, model requests, real env/secret reads or writes, sandbox execution, generated-content writes,
  schema/migration, deploy, payment, external-service, PR, force-push, and Cost Calibration remain blocked.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-164-personal-learning-ai-provider-env-secret-destination`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-164-personal-learning-ai-provider-env-secret-destination`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-164-personal-learning-ai-provider-env-secret-destination`
