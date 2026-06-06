# Advanced Edition Formal Learning Detail Visibility Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录企业管理员对员工正式学习记录明细的可见性边界。

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

用户确认方案 1：企业管理员只看员工正式学习统计摘要和记录摘要，不看题目级或答案级明细。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不批准正式 `practice`、`mock_exam`、`exam_report` 或 `mistake_book` 的题目级、答案级、解析级或错题明细企业管理员可见性。
- 不定义具体字段、数据库权限、API 路由或页面交互。

## Implementation Notes

- 在原设计记录的员工详情字段可见性中增加正式学习明细不可见规则。
- 在 MVP requirements 的企业管理员角色边界和验收链中增加正式学习明细不可见规则。
- 保持正式学习统计摘要与记录摘要可见，题目级和答案级内容不可见。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
