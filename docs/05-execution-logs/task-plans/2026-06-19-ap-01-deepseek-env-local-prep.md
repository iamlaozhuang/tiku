# Task Plan: ap-01-deepseek-env-local-prep

## Summary

- Task id: `ap-01-deepseek-env-local-prep`
- Branch: `codex/ap-01-deepseek-env-local-prep`
- Goal: prepare the governed handoff for a user-managed `.env.local` DeepSeek key so the next AP-01 task can rerun the
  one-provider DeepSeek smoke after explicit confirmation.
- Scope: docs/state/evidence/audit only.
- Human instruction: the user wants to place `DEEPSEEK_API_KEY` in `.env.local`, then notify Codex to continue in a new
  task.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Boundaries

Allowed in this task:

- Create this task plan, evidence, and audit review.
- Update `task-queue.yaml`, `project-state.yaml`, and `local-experience-coverage-matrix.yaml`.
- Verify that `.env.local` is ignored by Git without reading its content.
- Tell the user the exact local placeholder line to add manually.

Blocked in this task:

- Any `.env*` read, write, print, copy, staging, or commit.
- Any provider/model call.
- Any `TIKU_PROVIDER_SMOKE_APPROVED=1` execute run.
- Any provider configuration, product source, test source, schema, migration, dependency, staging/prod/cloud/deploy,
  payment, external-service, PR, push, force-push, destructive DB, raw prompt, raw provider payload, raw provider
  response, screenshot, trace, or HTML report.
- Cost Calibration Gate.

## User Manual Step After This Task

After this task closes, the user may manually edit local-only `.env.local` and add exactly this placeholder shape:

```env
DEEPSEEK_API_KEY=<your DeepSeek API key>
```

The actual key value must not be sent in chat, committed, copied into evidence, or printed to terminal output.

## Next Task Candidate

- `ap-01-provider-smoke-execution-deepseek-env-local-ready`

That next task should wait for the user's confirmation that `.env.local` has been updated. Its fresh approval boundary
should permit a local command to read only `DEEPSEEK_API_KEY` from `.env.local`, place it into the child process
environment for one DeepSeek smoke run, and redact all sensitive values from evidence.

## Validation Plan

- `git check-ignore -v .env.local`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ap-01-deepseek-env-local-prep`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId ap-01-deepseek-env-local-prep`

## Closeout Policy

- Local commit: approved.
- Merge, push, PR, deploy: blocked.
