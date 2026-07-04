# 2026-07-04 Stage C-1 Provider Smoke Task Plan

## Task

- Task ID: `stage-c-1-provider-smoke-2026-07-04`
- Branch: `codex/stage-c-1-provider-smoke-2026-07-04`
- Task kind: local-only Provider smoke execution
- Human approval: current user approval on 2026-07-04 for exactly one local-only Provider smoke.

## Approved Scope

Run a local-only Stage C-1 Provider smoke using:

- Provider label: `openai_compatible / alibaba-qwen`
- Model label: `qwen3.7-max`
- Host label: `dashscope.aliyuncs.com`
- Maximum Provider calls: `1`
- Maximum retries: `0`
- Maximum output tokens: `1800`
- Timeout: `60000 ms`
- Data class: synthetic/reviewed non-sensitive data only
- Secret rule: access `ALIBABA_API_KEY` only from current runtime process environment, in memory only.

## Strict Boundaries

Allowed:

- Read committed docs/state/queue and public source/config anchors already used by the Stage C-1 read-only inventory.
- Check whether `ALIBABA_API_KEY` is present in the current process environment without printing its value.
- Execute at most one Provider request if the runtime secret is present.
- Record redacted status/count/timing/token summaries only.

Forbidden:

- Do not read, write, print, or commit `.env*` content.
- Do not print or commit any secret value, connection string, raw prompt, Provider payload, raw AI input/output, full
  generated `question`, full generated `paper`, full `material`, full `resource`, or full `chunk`.
- Do not run browser/e2e/dev server, DB read/write, cleanup/reset, seed, migration, schema change, source/test change,
  dependency change, staging/prod/cloud/deploy, payment, external service beyond the single approved Provider call, or
  Cost Calibration.
- Do not claim release readiness, final Pass, production usability, Provider readiness, model quality, or staging
  readiness.

## Stop Rule

Stop immediately and record `fail` or `block` if any of the following occurs:

- `ALIBABA_API_KEY` is missing from the current process environment.
- Provider request fails.
- More than one Provider request would be needed.
- Output is unsafe, costly, unstable, oversized, or cannot be summarized without raw content.
- Redaction cannot be guaranteed.
- The runtime target differs from the approved provider/model/host labels.

## Execution Design

1. Confirm current short branch and clean worktree.
2. Materialize this plan plus `project-state.yaml` and `task-queue.yaml` task boundaries.
3. Run a sanitized runtime secret presence check.
4. If the secret is absent, stop with `blocked_missing_runtime_secret` and do not call Provider.
5. If the secret is present, run one inline Node ESM smoke using installed `ai` and `@ai-sdk/openai-compatible`
   packages, with a synthetic minimal health prompt kept out of committed evidence.
6. Persist only redacted acceptance/evidence/audit summaries.
7. Run scoped formatting, `git diff --check`, blocked write-scope diff check, and Module Run v2 pre-commit hardening.
8. Create one local commit. Fast-forward merge, push, and branch cleanup remain blocked pending fresh user approval.

## Required Reads Completed

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
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-provider-staging-cost-calibration-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-read-only-provider-target-inventory.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-read-only-provider-target-inventory.md`

## Evidence Files

- Acceptance: `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-provider-smoke.md`
- Evidence: `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-provider-smoke.md`
- Audit: `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-provider-smoke.md`

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown <task files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <task files>`
- `git diff --check`
- `git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml src tests e2e src/db/schema drizzle migrations seed scripts playwright-report test-results .next .runtime`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-c-1-provider-smoke-2026-07-04`
