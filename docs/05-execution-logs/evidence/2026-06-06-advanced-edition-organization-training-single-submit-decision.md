# Advanced Edition Organization Training Single Submit Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认：企业训练首期每名员工每个训练版本只能正式提交一次。

## Changed Documents

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-organization-training-single-submit-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-single-submit-decision.md`

## Confirmed Decision

- 每名员工每个企业训练版本只允许一次正式提交。
- 正式提交前可以保存草稿作答。
- 正式提交后，该训练版本的员工结果进入只读状态。
- 企业训练统计、完成率、排行和得分摘要只基于正式提交记录计算。
- 首期不提供补考、重交、取最高分或取最后一次提交；如需重新训练，企业管理员应发布新训练版本。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-single-submit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-single-submit-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "每名员工每个企业训练版本只允许一次正式提交|草稿作答|正式提交后.*只读|统计.*正式提交记录|补考、重交、取最高分" docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md
```

Result: passed. Confirmed decision markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
