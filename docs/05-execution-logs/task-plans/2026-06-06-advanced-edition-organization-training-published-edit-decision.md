# Advanced Edition Organization Training Published Edit Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录企业训练发布后的内容变更策略。

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`

## Confirmed Input

用户确认：企业训练发布后内容不可直接编辑，只允许下架、复制为新草稿、重新发布新版本。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不定义具体版本号字段、数据库表、API 路由或页面交互。
- 不批准企业训练跨企业共享、企业训练一键采纳到正式 `question` / `paper`、自动通知或补考流程。

## Implementation Notes

- 在原设计记录的企业训练最小闭环中增加“发布后变更”决策。
- 在 MVP requirements 的角色边界和验收链中，把“编辑企业训练”收敛为“编辑未发布草稿”。
- 已发布训练的内容、组织范围快照、员工 `answer_record`、统计摘要和 `audit_log` 不得被新版本覆盖。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
