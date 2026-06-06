# Advanced Edition Audit Log Retention Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认：`audit_log_retention_day` 首期为 1095 天。

## Changed Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-retention-domain-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-expired-hidden-grace-decision.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-audit-log-retention-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-audit-log-retention-decision.md`

## Confirmed Decision

- `audit_log_retention_day` 首期为 1095 天。
- `audit_log` 用于追溯授权、额度、恢复、硬删除审批、运营配置变更和受控治理动作。
- `audit_log` 不得记录 prompt、AI 原始输入输出、provider payload、secret、token、数据库 URL、明文 `redeem_code` 或员工主观题原文。
- `audit_log` 保留期变更必须写入新的 `audit_log`，并记录配置版本、操作人、时间和变更原因。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-audit-log-retention-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "Audit Log Retention Decision|audit_log_retention_day|1095|ai_call_log_retention_day|仍未确认" docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md
```

Result: passed. Confirmed decision and remaining unconfirmed markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
