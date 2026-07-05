# 2026-07-05 Stage C-4 AI Cost Quota Decision Package Plan

Task ID: `stage-c-4-ai-cost-quota-decision-package-2026-07-05`

Branch: `codex/stage-c-4-ai-cost-quota-decision-package-2026-07-05`

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
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-provider-cost-staging-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-local-acceptance-rollup-and-residual-risk-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-05-stage-c-3-cost-calibration-execution.md`
- `docs/05-execution-logs/acceptance/2026-07-05-stage-c-3-cost-calibration-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-stage-c-3-cost-calibration-execution.md`
- official Alibaba Cloud Model Studio pricing source
- official Alibaba Cloud Model Studio model reference
- official Alibaba Cloud Model Studio DashScope API reference

## Scope

Materialize a docs-only decision package that converts the bounded Stage C-3 sample into a local budget and quota
discussion vocabulary.

This task does not run Provider calls, Cost Calibration, DB, browser, dev server, e2e, staging/prod, schema/migration,
seed, dependency, source/test edits, or secret access. It does not set production quota defaults or production pricing.

## Inputs

- Stage C-3 target labels: `openai_compatible / alibaba-qwen / qwen3.7-max / dashscope.aliyuncs.com`.
- Stage C-3 aggregate sample: four requests, zero retries, input `96`, output `1994`, total `2090`, reasoning `1970`,
  cached input `0`, estimated cost `CNY 0.072936`.
- Stage C-3 pricing basis: input `CNY 12 / 1M tokens`, output `CNY 36 / 1M tokens`, official source accessed on
  `2026-07-05`.

## Derivation

Record the formula:

```text
estimated_cost_cny = input_tokens * 12 / 1_000_000 + output_tokens * 36 / 1_000_000
```

Derived local discussion values:

- Average sample cost per request: `CNY 0.018234`.
- Average sample input tokens per request: `24`.
- Average sample output tokens per request: `498.5`.
- Average sample total tokens per request: `522.5`.
- Average sample reasoning tokens per request: `492.5`.

The output token class dominates the measured cost, so any quota discussion must consider billable output tokens and
budget caps, not only request count.

## Decision Package Contents

The acceptance packet must include:

- exact source sample and formula;
- sample-equivalent request math for local budget discussion;
- conservative multiplier bands for longer product routes;
- quota decision axes for `personal_auth`, `org_auth`, organization training, content draft/review, and platform probe
  contexts;
- required future decisions before any production default;
- explicit non-claims.

## Evidence Rules

Allowed evidence:

- task id, branch, command names, pass/fail/block;
- public Provider/model/host labels;
- pricing source URL/access date;
- aggregate Stage C-3 sample counts and derived local discussion math;
- validation status and redacted summary.

Forbidden evidence:

- credentials, token/session/cookie/localStorage/Authorization header, secret/env values, connection strings;
- raw Prompt, Provider payload, raw AI input/output, raw Provider error body;
- full generated content, full question/paper/material/resource/chunk content;
- raw DB rows, internal ids, PII, phone, email, password, plaintext `redeem_code`;
- screenshots, traces, raw DOM, private fixture contents.

## Stop Rules

Stop if:

- a Provider call, secret/env read, DB access, browser runtime, staging/prod action, source/test/dependency/schema edit, or
  migration/seed becomes necessary;
- official pricing source is unavailable and a new current price would be asserted as production fact;
- a product quota default, Provider readiness, release readiness, final Pass, production usability, or production
  readiness claim would be introduced;
- evidence would include any forbidden material.

## Validation Plan

- Scoped Prettier write.
- Scoped Prettier check.
- `git diff --check`.
- Blocked path diff.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.

## Closeout

After validation, commit the docs/state package, fast-forward merge to `master`, push `origin/master`, and delete the
short branch.
