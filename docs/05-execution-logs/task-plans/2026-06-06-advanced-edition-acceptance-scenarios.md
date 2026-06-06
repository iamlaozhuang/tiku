# Advanced Edition MVP Acceptance Scenarios Task Plan

## Task

- Queue task: `phase-30-advanced-edition-acceptance-scenarios`.
- Branch: `codex/advanced-edition-acceptance-scenarios`.
- Scope: docs-only update to define MVP acceptance scenarios, failure scenarios, completion states, and evidence requirements.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-role-boundary-matrix.md`

## Confirmed Decision

Use `方案 B`: organize MVP acceptance as four main acceptance chains plus horizontal failure scenarios.

The four main chains are:

1. 高级版个人用户 AI 出题/AI 组卷。
2. 企业管理员创建企业训练。
3. 企业员工完成作答并形成统计。
4. 平台运营管理员完成授权/额度治理。

Horizontal failure scenarios cover authorization不足、额度不足、异步任务失败/超时、组织越权、内容到期隐藏/恢复、日志脱敏。

## Implementation Notes

- Add an `Acceptance Scenarios` section to the MVP requirements spec.
- Keep the content at requirement level; do not introduce API routes, database schemas, migrations, or UI implementation details.
- Update the follow-up queue without removing unconfirmed operations configuration decisions.
- Update project state and task queue for this docs-only task.
- Write evidence with validation command results.

## Validation Plan

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-06-06-advanced-edition-acceptance-scenarios.md docs\05-execution-logs\evidence\2026-06-06-advanced-edition-acceptance-scenarios.md`
- `Select-String -Path docs\superpowers\specs\2026-06-06-advanced-edition-mvp-requirements.md -Pattern 'Acceptance Scenarios','AI 出题','AI 组卷','企业训练','授权','额度','失败场景','验收证据'`
