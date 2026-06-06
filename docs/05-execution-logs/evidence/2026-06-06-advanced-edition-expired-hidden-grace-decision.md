# Advanced Edition Expired Hidden Grace Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认：到期隐藏后的恢复窗口 `expired_content_hidden_grace_day` 首期为 30 天。

## Changed Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-expired-hidden-grace-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-expired-hidden-grace-decision.md`

## Confirmed Decision

- `expired_content_hidden_grace_day` 首期为 30 天。
- 30 天恢复窗口内，平台运营管理员可以通过运营治理入口执行取消隐藏。
- 取消隐藏必须填写恢复原因，并记录操作人、时间、对象范围、恢复原因和 `audit_log`。
- 恢复不得绕过 `authorization`、`effectiveEdition`、组织范围、内容域边界或脱敏规则。
- 超过 30 天后不得通过普通取消隐藏流程恢复；如确需处理，必须进入后续审批或受控治理流程。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-expired-hidden-grace-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "Expired Hidden Grace Decision|expired_content_hidden_grace_day|30 天|audit_log_retention_day|ai_call_log_retention_day" docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md
```

Result: passed. Confirmed decision and remaining unconfirmed markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
