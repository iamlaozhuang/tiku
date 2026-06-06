# Advanced Edition Operations Configuration Contract

## Status

Accepted requirement-level contract for Phase 30 MVP requirements.

## Purpose

This document defines the operations configuration contract for the advanced edition MVP loop. It separates configurable operational defaults from the main MVP requirements spec so later implementation tasks can map configuration keys to admin UI, service rules, data storage, audit records, and validation evidence without overloading the requirements source of truth.

This document is a requirements contract, not an implementation approval. It does not create database schema, API routes, source code, scripts, provider settings, secrets, payment integration, deployment configuration, or migrations.

## Confirmed Decision

运营配置清单采用独立配置 contract 维护。MVP 需求规格只引用本 contract，不在正文展开全部配置项。

## Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`

## Non-Goals

- 不定稿具体人民币价格、在线支付、订单、发票、退款或支付渠道对账。
- 不定稿 provider token、模型成本、真实 API Key、secret、环境变量或部署配置。
- 不创建或修改数据库表、迁移、Drizzle schema、API route、Server Action、后台页面或测试代码。
- 不把配置变更等同于授权生效；所有授权、额度、任务和日志规则仍必须由 service 层统一校验。

## Configuration Principles

- 配置键在内部使用 `snake_case`；若未来通过 API 暴露，JSON 字段必须映射为 `camelCase`。
- 配置值不得保存 secret、token、数据库 URL、provider payload、prompt、AI 原始输入输出或明文 `redeem_code`。
- 配置必须支持版本或快照追溯；额度预估、最终扣减、异步任务创建和高峰降级都必须能追溯使用的配置版本。
- 平台运营管理员可以调整运营配置；高风险配置变更必须写入 `audit_log`。
- 默认配置变更只影响新任务、新额度包、新授权判断或新治理动作；不得自动回算历史任务和历史额度流水。
- 配置生效范围必须明确，禁止只记录模糊全局值。
- 配置缺失时不得静默放行高风险能力；应进入明确失败状态或使用已审计的内置默认配置。

## Configuration Scope

配置范围按以下优先级计算，后者覆盖前者：

1. `global_default`：平台全局默认配置。
2. `edition_default`：标准版/高级版默认配置。
3. `authorization_scope`：`personal_auth` 或 `org_auth` 对应授权范围配置。
4. `organization_scope`：指定 `organization` 的运营覆盖配置。
5. `actor_scope`：指定角色或员工范围的局部限制配置。

首期不要求实现所有覆盖层级，但配置 contract 必须保留这些范围语义，避免后续扩展时破坏额度流水和审计追溯。

## Configuration Matrix

| Domain            | Configuration Key                             | Scope                                       | Purpose                                            | Initial Value Rule                         | Operations Editable | Audit Requirement |
| ----------------- | --------------------------------------------- | ------------------------------------------- | -------------------------------------------------- | ------------------------------------------ | ------------------- | ----------------- |
| 企业后台开关      | `organization_portal_enabled`                 | `organization_scope`                        | 控制企业学习运营后台是否开放。                     | Must be set before enabling organization.  | Yes                 | `audit_log`       |
| 企业管理员上限    | `organization_admin_limit`                    | `organization_scope`                        | 限制企业管理员数量。                               | Must be set before enabling organization.  | Yes                 | `audit_log`       |
| 额度单位          | `quota_unit`                                  | `global_default`                            | 定义额度点数单位，不暴露 token 或人民币成本。      | Fixed as quota point unless later changed. | Yes                 | `audit_log`       |
| 个人每日额度      | `personal_ai_daily_quota_point`               | `edition_default`, `authorization_scope`    | 控制个人高级版每日 AI 额度。                       | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 个人月度额度      | `personal_ai_monthly_quota_point`             | `edition_default`, `authorization_scope`    | 控制个人高级版月度 AI 额度。                       | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 企业总额度        | `organization_ai_total_quota_point`           | `organization_scope`, `authorization_scope` | 控制企业高级版总 AI 额度。                         | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 员工每日额度      | `employee_ai_daily_quota_point`               | `organization_scope`, `actor_scope`         | 控制员工使用企业授权上下文时的个人每日额度。       | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 员工月度额度      | `employee_ai_monthly_quota_point`             | `organization_scope`, `actor_scope`         | 控制员工使用企业授权上下文时的个人月度额度。       | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 平台内容额度      | `platform_content_teacher_quota_point`        | `global_default`, `actor_scope`             | 控制平台内容老师生成正式草稿前的后台额度。         | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| AI 出题消耗       | `ai_question_generation_base_cost_point`      | `global_default`, `edition_default`         | 定义 AI 出题基础消耗。                             | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| AI 组卷消耗       | `ai_paper_generation_base_cost_point`         | `global_default`, `edition_default`         | 定义 AI 组卷基础消耗。                             | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 企业训练生成消耗  | `organization_training_generation_cost_point` | `organization_scope`, `edition_default`     | 定义企业训练内容生成基础消耗。                     | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 额度消耗顺序      | `quota_consume_order`                         | `global_default`                            | 控制额度包扣减优先级。                             | `earliest_expiring_first`                  | Yes                 | `audit_log`       |
| 购买登记必填字段  | `purchase_grant_required_field`               | `global_default`                            | 控制运营登记式购买必须填写的字段。                 | `external_reference`, `ops_note`           | Yes                 | `audit_log`       |
| 赠送登记必填字段  | `bonus_grant_required_field`                  | `global_default`                            | 控制运营赠送必须填写的字段。                       | reason, quota point, expires_at, operator  | Yes                 | `audit_log`       |
| 人工调整必填字段  | `manual_adjustment_required_field`            | `global_default`                            | 控制额度纠错、补偿或反向流水必须填写的字段。       | reason, direction, quota point, operator   | Yes                 | `audit_log`       |
| 用户任务并发      | `ai_task_user_concurrency_limit`              | `global_default`, `actor_scope`             | 限制单用户同时运行的 AI 任务数。                   | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 企业任务并发      | `ai_task_organization_concurrency_limit`      | `organization_scope`                        | 限制单企业同时运行的 AI 任务数。                   | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 全局任务并发      | `ai_task_global_concurrency_limit`            | `global_default`                            | 限制全平台同时运行的 AI 任务数。                   | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 排队超时          | `ai_task_pending_timeout_minute`              | `global_default`, `edition_default`         | 控制任务排队最大等待时间。                         | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 运行超时          | `ai_task_running_timeout_minute`              | `global_default`, `edition_default`         | 控制任务运行最大时长。                             | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 重试上限          | `ai_task_retry_limit`                         | `global_default`, `edition_default`         | 控制可重试失败的最大重试次数。                     | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 幂等窗口          | `ai_task_idempotency_ttl_minute`              | `global_default`                            | 控制重复提交识别窗口。                             | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 高峰降级级别      | `peak_degradation_level`                      | `global_default`                            | 控制高峰期排队、限流、暂停新建任务等降级级别。     | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 高峰积压阈值      | `peak_pending_threshold`                      | `global_default`                            | 控制进入高峰降级的任务积压阈值。                   | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 高峰等待阈值      | `peak_wait_time_threshold_minute`             | `global_default`                            | 控制进入高峰降级的等待时间阈值。                   | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 生成内容保留期    | `generated_content_retention_day`             | `global_default`, `edition_default`         | 控制个人 AI 内容、企业训练内容和平台草稿的保留期。 | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 到期隐藏宽限期    | `expired_content_hidden_grace_day`            | `global_default`, `edition_default`         | 控制到期隐藏后保留可恢复状态的时间。               | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| 硬删除审批        | `hard_delete_approval_required`               | `global_default`                            | 控制硬删除是否必须经过审批记录。                   | `true`                                     | Yes                 | `audit_log`       |
| 受控快照例外      | `snapshot_exception_required`                 | `global_default`                            | 控制敏感原文排障是否必须进入受控快照例外流程。     | `true`                                     | Yes                 | `audit_log`       |
| 审计日志保留期    | `audit_log_retention_day`                     | `global_default`                            | 控制 `audit_log` 保留期。                          | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| AI 调用日志保留期 | `ai_call_log_retention_day`                   | `global_default`                            | 控制 `ai_call_log` 保留期。                        | To be confirmed before implementation.     | Yes                 | `audit_log`       |
| evidence 脱敏     | `evidence_redaction_enabled`                  | `global_default`                            | 控制 evidence 和运营导出是否默认脱敏。             | `true`                                     | Yes                 | `audit_log`       |
| 敏感字段拒绝清单  | `sensitive_field_denylist`                    | `global_default`                            | 控制日志、evidence 和导出中禁止记录的敏感字段。    | Must include known sensitive fields.       | Yes                 | `audit_log`       |

## Sensitive Field Denylist Baseline

`sensitive_field_denylist` 首期至少覆盖：

- prompt；
- AI 原始输入输出；
- provider payload；
- secret；
- token；
- 数据库 URL；
- 明文 `redeem_code`；
- 员工主观题原文；
- 不应被企业管理员或普通运营入口查看的个人 AI 完整生成内容。

## Default Value Decision Queue

本 contract 已定稿“配置项、作用域、治理规则和审计要求”。以下具体默认值仍需在进入实现拆分前继续确认：

1. 各类额度包的初始点数。
2. AI 出题、AI 组卷、企业训练生成、平台内容老师生成正式草稿的具体消耗点数。
3. 用户级、企业级、全局级并发上限。
4. 排队超时、运行超时、重试上限和幂等窗口。
5. 高峰积压阈值、等待阈值和降级级别映射。
6. 生成内容保留期、到期隐藏宽限期、`audit_log` 保留期和 `ai_call_log` 保留期。

未确认默认值不得在后续实现任务中被写死；实现前必须通过新的决策记录或任务方案补齐。
