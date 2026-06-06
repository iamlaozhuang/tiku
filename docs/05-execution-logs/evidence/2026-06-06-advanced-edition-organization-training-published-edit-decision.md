# Advanced Edition Organization Training Published Edit Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认：企业训练发布后内容不可直接编辑，只允许下架、复制为新草稿、重新发布新版本。

## Changed Documents

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-organization-training-published-edit-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-published-edit-decision.md`

## Confirmed Decision

- 企业训练发布后内容不可直接编辑。
- 已发布企业训练只允许下架、复制为新草稿、重新发布新版本。
- 企业管理员需要修改题目、分值、答案、解析、标题、说明或可见范围时，必须复制为新草稿后再发布。
- 新版本不得覆盖旧版本的内容、组织范围快照、员工 `answer_record`、统计摘要或 `audit_log`。
- 下架旧版本不影响历史作答、统计、审计和额度流水。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-published-edit-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "发布后变更|企业训练发布后内容不可直接编辑|复制为新草稿|重新发布新版本|answer_record" docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md
```

Result: passed. Confirmed decision markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
