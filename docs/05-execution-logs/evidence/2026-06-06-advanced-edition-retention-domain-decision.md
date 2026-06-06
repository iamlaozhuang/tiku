# Advanced Edition Retention Domain Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认采用方案 1：生成内容保留期按内容域拆分治理。

## Changed Documents

- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-retention-domain-decision.md`

## Confirmed Decision

- 个人用户和企业员工的 AI 学习型生成内容使用 `ai_generated_practice_retention_day`，首期为 90 天。
- 企业训练未发布草稿使用 `organization_training_draft_retention_day`，首期为 90 天。
- 已发布企业训练内容使用 `organization_training_published_retention_policy`，首期为长期保留。
- 正式 `question` / `paper` 草稿使用 `question_paper_draft_retention_policy`，继续按现有正式内容管理规则保留。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "Retention Domain Decision|ai_generated_practice_retention_day|organization_training_draft_retention_day|organization_training_published_retention_policy|question_paper_draft_retention_policy|非成本默认值" docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md
```

Result: passed. Confirmed decision markers and unconfirmed markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
