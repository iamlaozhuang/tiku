# Advanced Edition Organization Training Takedown Visibility Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录企业训练下架后的员工端历史结果可见性。

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

用户确认：企业训练下架后，员工可以查看自己的历史结果摘要，但不能重新进入题目详情或新增作答。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不批准下架后继续查看完整题目、答案解析、员工主观题原文或敏感原文。
- 不定义具体状态字段、数据库约束、API 路由或页面交互。

## Implementation Notes

- 在原设计记录的企业训练下架规则中增加员工历史结果摘要可见性。
- 在 MVP requirements 的企业员工角色边界和横向失败场景中增加下架后可见性边界。
- 下架后保留学习反馈和完成证明，但不继续传播完整训练内容。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
