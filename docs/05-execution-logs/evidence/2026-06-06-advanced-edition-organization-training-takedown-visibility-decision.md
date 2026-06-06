# Advanced Edition Organization Training Takedown Visibility Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认：企业训练下架后，员工可以查看自己的历史结果摘要，但不能重新进入题目详情或新增作答。

## Changed Documents

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-organization-training-takedown-visibility-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-takedown-visibility-decision.md`

## Confirmed Decision

- 企业训练下架后，员工仍可查看自己的历史结果摘要。
- 员工不能重新进入题目详情、答案解析或新增作答。
- 历史结果摘要只展示训练名称、版本摘要、提交时间、得分、完成状态和必要反馈摘要。
- 下架后的普通员工入口不得展示完整题目、答案、解析或敏感原文。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-single-submit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-single-submit-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-deadline-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-deadline-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-takedown-visibility-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-takedown-visibility-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "下架后，员工仍可查看自己的历史结果摘要|不能重新进入题目详情|答案解析|新增作答|历史结果摘要" docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md
```

Result: passed. Confirmed decision markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
