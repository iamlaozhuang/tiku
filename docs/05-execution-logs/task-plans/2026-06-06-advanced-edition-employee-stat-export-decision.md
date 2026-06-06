# Advanced Edition Employee Stat Export Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录企业管理员首期员工统计数据导出策略。

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

用户确认方案 1：企业管理员首期不提供员工统计数据导出，只提供后台在线查看摘要。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不批准组织级汇总导出、员工级摘要导出、导出字段白名单、导出文件生成、导出下载、导出审计或导出文件流转治理。
- 不定义导出格式、导出权限、导出 API、导出任务或页面交互。

## Implementation Notes

- 在原设计记录的企业后台统计首期暂缓项中补充员工统计数据导出边界。
- 在 MVP requirements 的企业管理员角色边界和验收链中增加“仅在线查看摘要，不提供导出”。
- 保持员工统计数据仅在企业后台受权限约束在线查看。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
