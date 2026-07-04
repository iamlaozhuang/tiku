# 2026-07-04 Stage C-1 Read-Only Provider Target Inventory Plan

## Task

- Task ID: `stage-c-1-read-only-provider-target-inventory-2026-07-04`
- Branch: `codex/stage-c-1-read-only-provider-target-inventory-2026-07-04`
- Task type: docs/state inventory only
- Status: completed

## User Scope

Open a Stage C-1 read-only Provider target inventory. Read only source code and public configuration files. Do not read
`.env*`, do not call any Provider, and first list optional Provider/model labels.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-b-local-acceptance-closeout-summary.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-provider-staging-cost-calibration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-b-local-acceptance-closeout-and-stage-c-approval-prep.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-b-local-acceptance-closeout-and-stage-c-approval-prep.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`

## Boundaries

Allowed:

- Read public source/config/docs files that are already committed.
- Use `rg` with `.env*` exclusions to discover Provider/model labels.
- Record redacted inventory, source anchors, and next approval requirements.
- Update task plan, inventory, evidence, audit, `project-state.yaml`, and `task-queue.yaml`.
- Commit the short branch after local governance validation passes.

Forbidden:

- Read `.env*` or private fixture files.
- Call any Provider or model endpoint.
- Run browser/e2e, start dev server, connect to DB, run DB query/write, cleanup/reset/seed/migrate.
- Change product source, tests, package files, lockfiles, schemas, migrations, scripts, or dependencies.
- Claim Provider readiness, staging readiness, Cost Calibration, release readiness, final Pass, production usability, or
  production safety.
- Fast-forward merge, push, or delete branch without fresh approval.

## Inventory Method

1. Confirm branch and worktree are clean.
2. Read required governance and requirement sources.
3. Search public code/config with `.env*` excluded for:
   - installed Provider packages;
   - provider factory labels;
   - model/provider literals;
   - API/config surfaces that expose `model_provider` or `model_config`.
4. Read only the matching public files needed to support each inventory conclusion.
5. Classify each candidate as:
   - concrete configured label found in public code;
   - package capability only;
   - DB/runtime configurable but secret/model value unknown because `.env*` and Provider calls are forbidden.

## Validation

- `npm.cmd exec -- prettier --write --ignore-unknown <task files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <task files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-c-1-read-only-provider-target-inventory-2026-07-04`

Validation result: passed for scoped Prettier write/check, `git diff --check`, blocked write-scope diff check, and
Module Run v2 pre-commit hardening.

## Evidence Policy

Evidence may record task IDs, file paths, package names, provider/model labels discovered from public committed files,
status categories, commands, and redacted summaries only. It must not record credentials, tokens, cookies, sessions,
Authorization headers, env values, connection strings, raw DB rows, internal IDs, PII, Provider payloads, prompts, raw AI
input/output, full generated content, screenshots, traces, videos, raw DOM, or private fixture data.
