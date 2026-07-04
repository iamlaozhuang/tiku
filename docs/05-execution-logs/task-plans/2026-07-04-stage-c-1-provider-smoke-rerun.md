# 2026-07-04 Stage C-1 Provider Smoke Rerun Task Plan

## Task

- Task ID: `stage-c-1-provider-smoke-rerun-2026-07-04`
- Branch: `codex/stage-c-1-provider-smoke-rerun-2026-07-04`
- Task kind: local-only Provider smoke rerun
- Fresh approval: current user approved checking `ALIBABA_API_KEY` in `.env.local` and rerunning Stage C-1 Provider
  smoke.

## Scope

Execute one local-only Provider smoke for:

- Provider label: `openai_compatible / alibaba-qwen`
- Model label: `qwen3.7-max`
- Host label: `dashscope.aliyuncs.com`
- Base URL label: `https://dashscope.aliyuncs.com/compatible-mode/v1`
- Max Provider calls: `1`
- Retry cap: `0`
- Timeout: `60000 ms`
- Script max output tokens: `8`, which is below the approved cap of `1800`

## Secret Boundary

Allowed:

- Read `.env.local` only to check the `ALIBABA_API_KEY` key alias and load that single value into the current
  PowerShell/Node child process memory for this command.
- Print only boolean key-presence status and the redacted Provider smoke envelope.

Forbidden:

- Do not print, copy, store, or commit the `ALIBABA_API_KEY` value.
- Do not read other `.env.local` keys for evidence or output.
- Do not write `.env.local` or any `.env*` file.
- Do not record raw prompts, Provider payloads, raw AI input/output, complete generated content, secrets, connection
  strings, credentials, cookies, sessions, headers, DB rows, PII, screenshots, traces, or DOM dumps.
- Do not run DB, browser/e2e, dev server, staging/prod/cloud/deploy, payment, Cost Calibration, schema/migration/seed,
  dependency, source, test, or script changes.
- Do not claim Provider readiness, release readiness, final Pass, staging readiness, production usability, cost
  calibration, or production quota/pricing.

## Execution Plan

1. Confirm `.env.local` exists and has a non-empty `ALIBABA_API_KEY` key without printing the value.
2. Inject only that value into the current command process environment.
3. Set `TIKU_PROVIDER_SMOKE_APPROVED=1` only for the current command process.
4. Run `scripts/ai/run-personal-ai-provider-smoke.mjs` with `--execute`, `--max-requests 1`, `--timeout-ms 60000`,
   `--provider openai_compatible`, `--provider-name alibaba-qwen`, `--model qwen3.7-max`, and the DashScope compatible
   base URL.
5. Stop after the first pass/fail/block result; do not retry.
6. Record only redacted evidence.

## Required Reads Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-provider-staging-cost-calibration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-provider-smoke.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-secret-availability-decision.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-secret-availability-decision.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`

## Stop Rules

Stop and record block/fail if any of these occurs:

- `.env.local` is missing.
- `ALIBABA_API_KEY` key is missing or empty.
- Provider call fails.
- The runner reports redaction failure.
- More than one Provider call would be required.
- Target provider/model/host differs from the approved labels.
- Any boundary expansion is required.

## Validation Commands

- `npm.cmd exec -- prettier --write --ignore-unknown <task files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <task files>`
- `git diff --check`
- `git diff --name-only -- .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml src tests e2e src/db/schema drizzle migrations seed scripts playwright-report test-results .next .runtime`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-c-1-provider-smoke-rerun-2026-07-04`
