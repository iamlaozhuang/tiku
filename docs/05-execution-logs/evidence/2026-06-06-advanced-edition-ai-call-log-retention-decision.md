# Advanced Edition AI Call Log Retention Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认：`ai_call_log_retention_day` 首期为 180 天。

## Changed Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-retention-domain-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-expired-hidden-grace-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-audit-log-retention-decision.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-ai-call-log-retention-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-ai-call-log-retention-decision.md`

## Confirmed Decision

- `ai_call_log_retention_day` 首期为 180 天。
- `ai_call_log` 用于追溯 AI 任务状态、失败分类、重试、模型配置公开标识、额度消耗摘要和排障摘要。
- `ai_call_log` 不得记录 prompt、AI 原始输入输出、provider payload、secret、token、数据库 URL、明文 `redeem_code` 或员工主观题原文。
- `ai_call_log` 可以记录任务公开标识、`model_provider`、`model_config` 公开配置标识、token 统计摘要、成本统计摘要、失败分类、重试次数、`evidence_status` 和脱敏摘要。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-ai-call-log-retention-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "AI Call Log Retention Decision|ai_call_log_retention_day|180|保留与日志治理类非成本默认值已全部定稿|额度点数" docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md
```

Result: passed. Confirmed decision and remaining cost-gated markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
