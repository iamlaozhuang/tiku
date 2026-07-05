# 2026-07-05 Stage C-1 Provider Freshness Env Local Single-Key Rerun Plan

Task ID: `stage-c-1-provider-freshness-env-local-single-key-rerun-2026-07-05`

Branch: `codex/stage-c-1-provider-freshness-env-local-single-key-rerun-2026-07-05`

Status: closed.

## Purpose

Use the newly approved fallback secret path to rerun Stage C-1 once: read only `ALIBABA_API_KEY` from `.env.local`,
inject that single value into the current child process memory, and execute at most one local Provider smoke for the
approved public target.

This task does not execute Cost Calibration, staging/prod, DB, browser/e2e, dev server, schema/migration/seed,
dependency, source/test repair, or product runtime work.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-05-stage-c-1-provider-freshness-bounded-smoke-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-stage-c-1-provider-freshness-bounded-smoke-rerun.md`
- `docs/05-execution-logs/task-plans/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/acceptance/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-stage-c-1-provider-smoke-rerun.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`

## Approval Boundary

Fresh approval source: current user selected the fallback path `只读 .env.local 单键 ALIBABA_API_KEY 注入子进程`.

Allowed:

- read `.env.local` only for the `ALIBABA_API_KEY` key;
- inject only that single value into the current PowerShell/Node child process memory;
- execute at most one Provider call to `openai_compatible / alibaba-qwen / qwen3.7-max / dashscope.aliyuncs.com`;
- use timeout `60000 ms`, retry cap `0`, and output cap below the approved `1800` maximum;
- record only public labels, boolean presence/status, request count, duration/token summary, pass/fail/block, and
  redacted summary.

Forbidden:

- print, store, commit, or record the secret value or any `.env*` value;
- read other `.env.local` keys for output/evidence;
- write `.env.local` or any `.env*` file;
- record raw Prompt, Provider payload, raw AI I/O, complete generated content, full question/paper/material/resource
  content, token/session/cookie/header, raw DB rows, screenshot, trace, or raw DOM;
- execute Cost Calibration, staging/prod, DB, browser/e2e, dev server, schema/migration/seed, dependency, source/test,
  deployment, or product runtime work;
- claim Provider readiness, release readiness, final Pass, production usability, or production readiness.

## Runtime Procedure

1. Confirm task materialization in state/queue/plan/evidence/audit.
2. Parse `.env.local` in memory and extract only `ALIBABA_API_KEY`; do not print the value.
3. If the key is missing or empty, stop before Provider call and record a redacted block.
4. If present, run the existing smoke runner once with `TIKU_PROVIDER_SMOKE_APPROVED=1`, approved public target labels,
   max request `1`, retry `0`, timeout `60000 ms`, and no retry.
5. Stop after the first pass/fail/block result.

## Runtime Result

The readonly `.env.local` single-key lookup found `ALIBABA_API_KEY` and injected it only into the current child process.
The bounded smoke runner executed one Provider call and returned a redacted pass envelope. No secret value, raw Prompt,
Provider payload, raw AI I/O, or complete generated content was recorded.

## Closeout Result

Closeout gates passed after runtime evidence was recorded.

## Acceptance Mapping Result

| Requirement                            | Planned handling                                                                        |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| Single-key `.env.local` fallback       | Read only `ALIBABA_API_KEY` and inject only into child process memory.                  |
| Exact public Provider target           | `openai_compatible / alibaba-qwen / qwen3.7-max / dashscope.aliyuncs.com` only.         |
| Bounded execution                      | Max request `1`, retry `0`, timeout `60000 ms`, runner output cap below approved max.   |
| Redacted evidence                      | Record only labels, booleans, counts, timing/token summary, and status.                 |
| Forbidden actions remain blocked       | No Cost, staging/prod, DB, browser/e2e, schema/migration/seed, dependency, source/test. |
| No readiness/release/production claims | Explicitly blocked.                                                                     |

## Validation Plan

- `npm.cmd exec -- prettier --write --ignore-unknown <task files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <task files>`
- `git diff --check`
- blocked path diff for package/lockfile/source/test/script/db/browser/runtime/archive/index/env edits
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-c-1-provider-freshness-env-local-single-key-rerun-2026-07-05`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId stage-c-1-provider-freshness-env-local-single-key-rerun-2026-07-05 -SkipRemoteAheadCheck`
