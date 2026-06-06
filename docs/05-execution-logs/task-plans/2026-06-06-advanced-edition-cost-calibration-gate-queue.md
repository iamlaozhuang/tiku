# Advanced Edition Cost Calibration Gate Queue Task Plan

## Task

- Queue task: `phase-30-advanced-edition-cost-calibration-gate`.
- Branch: `codex/advanced-edition-cost-calibration-gate`.
- Scope: docs-only / blocked-gate queue creation for the future cost calibration gate.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`

## Confirmed Decision

Use `方案 B`: create a `Cost Calibration Gate` task queue entry as a docs-only / blocked-gate task. The task defines required inputs, sample categories, approval evidence, and forbidden actions only.

## Scope Guard

- Do not measure real provider costs in this task.
- Do not call any real provider.
- Do not configure provider secrets, environment variables, staging, production, cloud, deployment, online payment, or external services.
- Do not change code, schema, migrations, tests, scripts, package files, lockfiles, or `drizzle/**`.
- Do not record raw prompts, raw model responses, provider payloads, secrets, tokens, database URLs, real customer data, or plaintext `redeem_code`.

## Gate Inputs To Define

Future execution of the `Cost Calibration Gate` must require:

1. provider model selection and unit-cost assumptions;
2. representative AI 出题, AI 组卷, 企业训练生成, and platform content teacher formal-draft generation samples;
3. cost-impact dimensions such as question count, question type complexity, knowledge retrieval, generated `analysis`, generated `paper`, retry count, timeout, cancellation, and failure recovery;
4. pricing assumptions for purchase grants, bonus grants, and manual adjustments;
5. evidence redaction requirements and allowed summary fields;
6. human approval proving that real provider or production-like cost measurement is allowed.

## Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-cost-calibration-gate-queue.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-cost-calibration-gate-queue.md`
- `Select-String -Path docs\04-agent-system\state\task-queue.yaml -Pattern 'phase-30-advanced-edition-cost-calibration-gate','blocked_gate','humanApprovalRequired','Cost Calibration Gate','provider_cost_measurement'`
