# 2026-07-05 Stage C-3 Cost Calibration Execution Plan

Task ID: `stage-c-3-cost-calibration-execution-2026-07-05`

Branch: `codex/stage-c-3-cost-calibration-execution-2026-07-05`

Status: closed.

## Read Gate

Read before execution:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-05-stage-c-1-provider-freshness-env-local-single-key-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-05-stage-c-1-provider-freshness-env-local-single-key-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-stage-c-1-provider-freshness-env-local-single-key-rerun.md`
- `docs/05-execution-logs/acceptance/2026-07-05-stage-c-3-cost-calibration-execution-boundary.md`
- `docs/05-execution-logs/evidence/2026-07-05-stage-c-3-cost-calibration-execution-boundary.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-stage-c-3-cost-calibration-execution-boundary.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/acceptance/2026-06-23-provider-cost-staging-decision-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-in-app-ai-one-request-execution.md`
- `scripts/ai/run-personal-ai-provider-smoke.mjs`
- `tests/unit/run-personal-ai-provider-smoke.test.ts`
- official Alibaba Cloud Model Studio pricing source
- official Alibaba Cloud Model Studio model reference
- official Alibaba Cloud Model Studio DashScope API reference

## Scope

Execute one bounded local Cost Calibration sample set for:

- Provider label: `openai_compatible / alibaba-qwen`
- Model label: `qwen3.7-max`
- Host label: `dashscope.aliyuncs.com`
- Environment: local `dev` only
- Secret source: readonly `.env.local` single key `ALIBABA_API_KEY`, injected only into the child process memory

The task may run at most four Provider requests with zero retries. It must not use DB, browser, dev server, e2e,
staging/prod, schema/migration/seed, dependency, source/test edits, Provider configuration changes, or product data.

## Pricing Preflight

Execution must recheck the official Alibaba Cloud Model Studio pricing source on `2026-07-05` before any Provider call.

Current preflight basis:

- Official pricing source: `https://help.aliyun.com/zh/model-studio/model-pricing`
- Official model reference: `https://www.alibabacloud.com/help/en/model-studio/models`
- Official API reference: `https://help.aliyun.com/zh/model-studio/qwen-api-via-dashscope`
- Target model mapping: `qwen3.7-max`
- Billing range: `0 < Token <= 1M`
- Non-discount, non-Batch, non-Token-Plan basis
- China mainland public price for `qwen3.7-max`: input `CNY 12 / 1M tokens`, output `CNY 36 / 1M tokens`
- Output price covers billable output token classes, including thinking/answer tokens when returned by the Provider

Preflight stop rule: if the model mapping, currency, discount, Token Plan, billing mode, or source availability is
ambiguous, stop before Provider calls.

## Execution Method

Use the existing redacted smoke runner:

- `scripts/ai/run-personal-ai-provider-smoke.mjs`

The runner is reused without edits. It produces sanitized envelopes with usage counts and duration only; it does not
print the secret, raw Prompt, Provider payload, or raw AI output. The calibration wrapper may aggregate those sanitized
counts into cost summaries.

The effective runner output cap is below the approved `1800` max output token ceiling. If any request reports billable
output tokens above `1800`, stop after that request and classify the task as failed or blocked instead of continuing.

## Evidence Rules

Allowed evidence:

- task id, branch, command names, pass/fail/block;
- public Provider/model/host labels;
- pricing source URL and access date;
- request count, retry count, duration summary;
- aggregate input/output/reasoning/cached token counts;
- aggregate estimated cost summary;
- failure category and redacted summary.

Forbidden evidence:

- credentials, token/session/cookie/localStorage/Authorization header, secret/env values, connection strings;
- raw Prompt, Provider payload, raw AI input/output, raw Provider error body;
- full generated content, full question/paper/material/resource/chunk content;
- raw DB rows, internal ids, PII, phone, email, password, plaintext `redeem_code`;
- screenshots, traces, raw DOM, private fixture contents.

## Stop Rules

Stop and do not continue calls if:

- `.env.local` or the single key is missing or empty;
- target Provider/model/host differs from the approved labels;
- pricing source is unavailable or ambiguous;
- preflight estimated spend exceeds `CNY 5.00`;
- any request fails, times out, reports redaction failure, exceeds request/output/cost boundaries, or requires retry;
- any raw prompt/payload/output/secret/full content would enter evidence;
- any DB/browser/staging/prod/schema/migration/seed/dependency/source/test change becomes necessary;
- anyone asks to claim Provider readiness, quota default, release readiness, final Pass, production usability, or
  production readiness.

## Validation Plan

- Bounded cost calibration command.
- Scoped Prettier write.
- Scoped Prettier check.
- `git diff --check`.
- Blocked path diff.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.

## Closeout

After execution and validation, update acceptance/evidence/audit/state/queue, commit the task, fast-forward merge to
`master`, push `origin/master`, and delete the short branch.

## Runtime Summary

The bounded Cost Calibration command completed with `resultStatus=pass`. It used four requests, zero retries, public
target labels only, readonly single-key secret injection in child process memory, and aggregate redacted evidence only.

The measured aggregate cost estimate stayed below the `CNY 5.00` cap. The result is a local calibration sample only and
does not set production pricing, quota defaults, Provider readiness, release readiness, final Pass, production usability,
or production readiness.
