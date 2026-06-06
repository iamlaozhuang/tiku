# Advanced Edition Organization Training Deadline Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录企业训练首期截止时间策略。

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

用户确认：企业训练首期不设置强制截止时间，只支持企业管理员手动下架。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不批准可选截止时间、强制截止时间、到期自动停止新增作答、截止提醒、逾期标记、自动下架或补考。
- 不定义具体状态字段、数据库约束、API 路由或页面交互。

## Implementation Notes

- 在原设计记录的企业训练发布范围中增加“不设置强制截止时间”决策。
- 在 MVP requirements 的企业管理员验收链和横向失败场景中增加手动下架边界。
- 保持历史 `answer_record`、统计摘要、组织快照、`audit_log` 和额度流水保留。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
