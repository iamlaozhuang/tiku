# Advanced Edition Employee AI Task Visibility Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录企业管理员对员工使用企业额度进行个人 AI 学习任务的可见性边界。

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

用户确认：企业管理员只能看员工使用企业额度进行个人 AI 学习的统计摘要和额度消耗摘要，不看单个任务详情。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不批准单个任务详情、单个任务列表摘要、任务公开标识、具体生成时间线、用户输入摘要、生成内容摘要、prompt 或 AI 原始输入输出的企业管理员可见性。
- 不定义具体字段、数据库权限、API 路由或页面交互。

## Implementation Notes

- 在原设计记录的企业额度下 AI 自主学习可见边界中增加任务明细不可见规则。
- 在 MVP requirements 的企业管理员角色边界和验收链中增加“只看统计摘要和额度消耗摘要”。
- 保持个人 AI 学习内容归个人，企业仅做额度治理和统计摘要可见。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
