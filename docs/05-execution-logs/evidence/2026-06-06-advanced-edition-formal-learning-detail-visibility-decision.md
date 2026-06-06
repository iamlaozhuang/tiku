# Advanced Edition Formal Learning Detail Visibility Decision Evidence

## Summary

本次为 docs-only 产品决策记录维护。用户确认方案 1：企业管理员只看员工正式学习统计摘要和记录摘要，不看题目级或答案级明细。

## Changed Documents

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/task-plans/2026-06-06-advanced-edition-formal-learning-detail-visibility-decision.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-formal-learning-detail-visibility-decision.md`

## Confirmed Decision

- 企业管理员只看员工正式学习统计摘要和记录摘要。
- 企业管理员不可查看员工正式学习题目级或答案级明细。
- 正式 `practice`、`mock_exam`、`exam_report` 和 `mistake_book` 在企业后台不展示题目原文、选项原文、标准答案、员工答案、逐题对错、解析全文、错题详情或主观题原文。
- 如后续需要开放正式 `mock_exam` 报告摘要之外的诊断明细，必须新增产品与隐私边界决策。

## Still Unconfirmed

- 额度点数、AI 行为消耗点数、并发阈值、高峰阈值、任务超时阈值和 provider 成本假设

## Validation Commands

```powershell
git diff --check
```

Result: passed.

```powershell
node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-05-advanced-edition-ai-generation-design.md docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\superpowers\specs\2026-06-06-advanced-edition-ops-config-contract.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-retention-domain-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-expired-hidden-grace-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-audit-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-ai-call-log-retention-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-published-edit-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-single-submit-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-single-submit-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-deadline-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-deadline-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-takedown-visibility-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-takedown-visibility-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-organization-training-answer-detail-visibility-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-organization-training-answer-detail-visibility-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-employee-ai-task-visibility-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-employee-ai-task-visibility-decision.md docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-formal-learning-detail-visibility-decision.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-formal-learning-detail-visibility-decision.md
```

Result: passed.

Naming scan result: no banned authorization term or non-project `paper` term found in changed spec files.

```powershell
rg -n "正式学习题目级|答案级明细|题目原文|选项原文|标准答案|逐题对错|错题详情" docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md
```

Result: passed. Confirmed decision markers are present.

## Boundary Confirmation

- No source code changes.
- No database schema or migration changes.
- No dependency or lockfile changes.
- No provider call, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
