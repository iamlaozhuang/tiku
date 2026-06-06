# Advanced Edition Organization Training Deadline Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认：企业训练首期不设置强制截止时间，只支持企业管理员手动下架。

## Changed Documents

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-organization-training-deadline-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-deadline-decision.md`

## Confirmed Decision

- 企业训练首期不设置强制截止时间。
- 停止新增作答以企业管理员手动下架为准。
- 首期不提供到期自动停止新增作答、截止提醒、逾期标记、补考或自动下架。
- 下架后员工不得新增作答，但历史 `answer_record`、统计摘要、组织快照、`audit_log` 和额度流水必须保留。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-single-submit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-single-submit-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-deadline-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-deadline-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "不设置强制截止时间|手动下架|到期自动停止新增作答|截止提醒|逾期标记|自动下架|企业训练下架" docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md
```

Result: passed. Confirmed decision markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
