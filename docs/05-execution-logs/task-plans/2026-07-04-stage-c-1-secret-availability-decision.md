# 2026-07-04 Stage C-1 Secret Availability Decision Task Plan

## Task

- Task ID: `stage-c-1-secret-availability-decision-2026-07-04`
- Branch: `codex/stage-c-1-secret-availability-decision-2026-07-04`
- Task kind: docs-only secret availability decision
- Base: stacked after local commit `f0cb4a125` because the Stage C-1 Provider smoke evidence branch has not yet been
  approved for merge/push.

## Purpose

Define how `ALIBABA_API_KEY` can become available to the local Provider smoke execution process without reading,
printing, committing, or persisting `.env*` content.

This task is decision-only. It does not make the secret available, does not read any secret value, and does not rerun the
Provider smoke.

## Strict Boundaries

Allowed:

- Read governance docs, ADRs, state/queue, Stage C approval package, and prior Stage C-1 smoke evidence.
- Write docs/state/evidence/audit files for this decision task.
- Record public env key alias `ALIBABA_API_KEY`.

Forbidden:

- Do not read, write, print, copy, or commit `.env*` content.
- Do not access `ALIBABA_API_KEY` value or test secret presence in this task.
- Do not paste secrets into chat, docs, commands, evidence, git history, logs, or screenshots.
- Do not modify product source, tests, package files, lockfiles, scripts, DB, schema, migration, seed, dev server,
  browser/e2e, Provider/model runtime, staging/prod/cloud/deploy, payment, or Cost Calibration.
- Do not claim Provider readiness, release readiness, final Pass, production usability, or staging readiness.

## Decision To Materialize

The decision package will select parent-process/session environment injection as the preferred path:

- The owner makes `ALIBABA_API_KEY` available before the smoke runner starts, in the same parent process tree that will
  spawn Codex/tool shell commands.
- Codex only observes a boolean presence check in the later smoke rerun task.
- If the currently running Codex process cannot inherit the new variable, the rerun must start from a fresh Codex session
  launched from the prepared environment.

Rejected paths:

- repository `.env*`;
- secret pasted into chat or committed docs;
- persistent OS User/Machine environment writes without separate approval and cleanup plan;
- DB/admin `model_config` writes;
- dev server/browser/staging detours;
- source/test/script helper changes.

## Required Reads Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-provider-staging-cost-calibration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-provider-smoke.md`

## Evidence Files

- Decision package: `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-secret-availability-decision.md`
- Evidence: `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-secret-availability-decision.md`
- Audit: `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-secret-availability-decision.md`

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown <task files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <task files>`
- `git diff --check`
- `git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml src tests e2e src/db/schema drizzle migrations seed scripts playwright-report test-results .next .runtime`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-c-1-secret-availability-decision-2026-07-04`
