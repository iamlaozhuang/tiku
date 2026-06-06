# Advanced Edition Audit Log Retention Decision

## Scope

本任务只维护高级版 MVP 需求设计中的产品决策记录，记录 `audit_log_retention_day` 首期为 1095 天。

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

用户确认：`audit_log_retention_day` 首期为 1095 天。

## Non-Goals

- 不写产品代码、数据库 schema、API、服务、UI、worker、测试代码或迁移。
- 不推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
- 不确认 `ai_call_log_retention_day`。
- 不批准日志存储实现、清理任务、后台页面、导出功能或受控快照实现。

## Implementation Notes

- 在运营配置 contract 中将 `audit_log_retention_day` 的首期值记录为 1095。
- 增加独立决策章节，说明 1095 天审计追溯基线、脱敏边界、配置变更审计和清理边界。
- 在 MVP requirements 中补充回链说明。
- 同步修正本分支已有 evidence 中的“仍未确认”列表。

## Validation

- `git diff --check`
- Prettier check for changed Markdown files.
- 文本检索确认禁用授权术语和非项目 `paper` 术语未引入。
