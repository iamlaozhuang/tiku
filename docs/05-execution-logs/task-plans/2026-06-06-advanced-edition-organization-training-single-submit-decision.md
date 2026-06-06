# Advanced Edition Organization Training Single Submit Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录企业训练首期作答提交次数策略。

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

用户确认：企业训练首期每名员工每个训练版本只能正式提交一次。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不批准补考、重交、取最高分、取最后一次提交或训练计划。
- 不定义具体状态字段、数据库唯一约束、API 路由或页面交互。

## Implementation Notes

- 在原设计记录的企业训练员工作答中增加单次正式提交决策。
- 在 MVP requirements 的企业员工角色边界和验收链中增加一次提交、草稿保存、提交后只读和统计口径规则。
- 保持首期暂缓补考和多轮训练的边界。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
