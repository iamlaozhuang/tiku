# 2026-07-05 Stage C-3 Cost Calibration Execution Boundary Plan

Task ID: `stage-c-3-cost-calibration-execution-boundary-2026-07-05`

Branch: `codex/stage-c-3-cost-calibration-boundary-2026-07-05`

Status: closed.

## Read Gate

Read before materialization:

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
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-05-stage-c-1-provider-freshness-env-local-single-key-rerun.md`
- `docs/05-execution-logs/evidence/2026-07-05-stage-c-1-provider-freshness-env-local-single-key-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-stage-c-1-provider-freshness-env-local-single-key-rerun.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/acceptance/2026-06-23-provider-cost-staging-decision-package.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing.md`
- `docs/05-execution-logs/audits-reviews/2026-06-19-ap-01-qwen-in-app-ai-one-request-execution.md`

Public official references checked for boundary definition only:

- Alibaba Cloud Model Studio pricing source: `https://help.aliyun.com/zh/model-studio/model-pricing`
- Alibaba Cloud Model Studio model reference: `https://www.alibabacloud.com/help/en/model-studio/models`
- Alibaba Cloud Model Studio DashScope API billing-related reference:
  `https://help.aliyun.com/zh/model-studio/qwen-api-via-dashscope`

## Scope

This task only materializes the execution boundary for a future Stage C-3 Cost Calibration run.

It does not execute Cost Calibration, call Provider, read `.env.local`, read secrets, start browser/runtime, connect to
DB, change source/tests, change dependencies, touch schema/migration/seed, use staging/prod, or claim release/final/prod
readiness.

## Boundary To Materialize

- Target Provider labels: `openai_compatible / alibaba-qwen / qwen3.7-max / dashscope.aliyuncs.com`.
- Pricing source/date: official Alibaba Cloud Model Studio pricing page, access date `2026-07-05`.
- Pricing values: not recorded in this docs-only task; the future execution task must re-read official pricing before
  any call and stop if the price source is unavailable, ambiguous, or not matched to the target model.
- Future sample size cap: at most `4` Provider requests.
- Future retry cap: `0`.
- Future timeout cap: `60000 ms` per request.
- Future max output tokens: `1800` per request.
- Future max spend cap: `CNY 5.00` based on the execution-time official pricing preflight.
- Future evidence: aggregate token/cost/duration/status summaries only.
- Future non-claims: no Provider readiness, quota default, release readiness, final Pass, production usability, or
  production readiness.

## Stop Rules

Stop before any future execution if:

- Provider/model/host differs from the approved target labels.
- Pricing source is unavailable, ambiguous, or does not clearly cover `qwen3.7-max`.
- Pricing page uses a discount, plan, or billing mode that cannot be deterministically applied.
- Preflight estimated max cost exceeds the approved spend cap.
- Secret source is missing, would be printed, or would be recorded.
- Any raw Prompt, Provider payload, raw AI I/O, full generated content, full question/paper/material/resource content,
  raw DB rows, internal ids, PII, token/session/cookie/header, screenshot, trace, or raw DOM would enter evidence.
- More than `4` requests, any retry, longer timeout, higher output cap, DB/browser/staging/prod/source/dependency/schema
  work, or production quota decision becomes necessary.

## Validation Plan

- Scoped Prettier write.
- Scoped Prettier check.
- `git diff --check`.
- Blocked path diff for product/source/runtime/secret/archive paths.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.

## Closeout

After validation, update evidence/audit/state/queue, commit this docs-only package, fast-forward merge to `master`, push
`origin/master`, and delete the short branch.
