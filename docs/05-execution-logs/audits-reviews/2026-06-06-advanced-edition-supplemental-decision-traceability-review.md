# Advanced Edition Supplemental Decision Traceability Review

## Purpose

本审查用于自检 Phase 30 高级版补充需求决策是否完整、正确、详尽地汇总到原设计源、MVP 验收源和 evidence，并为后续实现拆分提供可追溯索引。

本审查不是实现批准，不创建数据库 schema、API、UI、worker、迁移、provider 配置、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。

## Self-Check Summary

自检结论：通过。

- 本轮 12 个补充决策均已有对应 task plan 和 evidence。
- 每个补充决策均已落到原设计记录、MVP 验收源或 ops config contract。
- 本轮新增决策均为已确认事项，没有把未确认的额度点数、AI 行为消耗点数、并发阈值、任务超时阈值、高峰阈值或 provider 成本假设写成结论。
- 企业管理员可见性边界在正式学习、企业训练、员工企业额度 AI 学习、额度消耗和导出能力之间保持一致：只看统计摘要或记录摘要，不看敏感原文、逐题明细、单个 AI 任务详情或导出文件。
- 企业训练生命周期边界保持一致：发布后不可直接编辑、单版本单次正式提交、首期无强制截止时间、下架后只保留历史结果摘要。

## Supplemental Decision Index

| Decision Area            | Confirmed Decision                                                                                                                | Source Location                                                                                                 | MVP / Contract Location                                                                                    | Evidence                                                                                                                 |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 内容域保留期             | 个人/员工 AI 学习型生成内容和企业训练未发布草稿首期 90 天；已发布企业训练长期保留；正式 `question` / `paper` 草稿按现有规则保留。 | `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md#retention-domain-decision`           | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#operations-configuration-contract` | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-retention-domain-decision.md`                               |
| 到期隐藏恢复窗口         | `expired_content_hidden_grace_day` 首期为 30 天。                                                                                 | `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md#expired-hidden-grace-decision`       | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#operations-configuration-contract` | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-expired-hidden-grace-decision.md`                           |
| 审计日志保留期           | `audit_log_retention_day` 首期为 1095 天。                                                                                        | `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md#audit-log-retention-decision`        | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#operations-configuration-contract` | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-audit-log-retention-decision.md`                            |
| AI 调用日志保留期        | `ai_call_log_retention_day` 首期为 180 天。                                                                                       | `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md#ai-call-log-retention-decision`      | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#operations-configuration-contract` | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-ai-call-log-retention-decision.md`                          |
| 企业训练发布后变更       | 已发布企业训练不可直接编辑；只允许下架、复制为新草稿、重新发布新版本。                                                            | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md#organization-training-minimum-loop` | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#main-acceptance-chains`            | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-published-edit-decision.md`           |
| 企业训练单次提交         | 每名员工每个企业训练版本只允许一次正式提交；正式提交前可保存草稿作答。                                                            | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md#organization-training-minimum-loop` | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#main-acceptance-chains`            | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-single-submit-decision.md`            |
| 企业训练截止时间         | 首期不设置强制截止时间；停止新增作答以企业管理员手动下架为准。                                                                    | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md#organization-training-minimum-loop` | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#main-acceptance-chains`            | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-deadline-decision.md`                 |
| 企业训练下架后员工可见性 | 下架后员工仍可查看自己的历史结果摘要，但不能重新进入题目详情、答案解析或新增作答。                                                | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md#organization-training-minimum-loop` | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#horizontal-failure-scenarios`      | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-takedown-visibility-decision.md`      |
| 企业训练逐题作答明细     | 企业管理员首期不可查看员工企业训练逐题作答明细，只看训练级和员工级统计摘要。                                                      | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md#employee-detail-field-visibility`   | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#role-boundary-rules`               | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-answer-detail-visibility-decision.md` |
| 员工企业额度 AI 学习任务 | 企业管理员只能看员工使用企业额度进行个人 AI 学习的统计摘要和额度消耗摘要，不看单个任务详情。                                      | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md#employee-detail-field-visibility`   | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#main-acceptance-chains`            | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-employee-ai-task-visibility-decision.md`                    |
| 员工正式学习明细         | 企业管理员只看员工正式学习统计摘要和记录摘要，不看题目级或答案级明细。                                                            | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md#employee-detail-field-visibility`   | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#main-acceptance-chains`            | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-formal-learning-detail-visibility-decision.md`              |
| 员工统计导出             | 企业管理员首期不提供员工统计数据导出，只提供后台在线查看摘要。                                                                    | `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md#privacy-boundary`                   | `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md#main-acceptance-chains`            | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-employee-stat-export-decision.md`                           |

## Role And Data Visibility Consistency Review

| Actor          | Allowed In First Release                                                                       | Explicitly Not Allowed In First Release                                                                | Consistency Result |
| -------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------ |
| 企业员工       | 作答可见企业训练；每个训练版本一次正式提交；下架后查看自己的历史结果摘要。                     | 下架后新增作答、重新进入题目详情或答案解析。                                                           | Pass               |
| 企业管理员     | 管理企业训练草稿、发布、下架；查看训练级和员工级统计摘要；在线查看员工统计摘要和额度消耗摘要。 | 查看逐题作答明细、客观题逐题对错、正式学习题目级或答案级明细、员工单个 AI 任务详情、员工统计数据导出。 | Pass               |
| 平台运营管理员 | 治理 `authorization`、`redeem_code`、额度、到期隐藏、取消隐藏、硬删除审批和审计摘要。          | 普通入口查看员工主观题原文、个人 AI 完整生成内容、prompt、AI 原始输入输出或 provider payload。         | Pass               |
| 平台内容老师   | 采纳 AI 草稿为正式 `question` / `paper` 草稿。                                                 | 管理授权、额度、企业员工隐私数据或明文 `redeem_code`。                                                 | Pass               |

## Acceptance Assertion Review

后续实现验收至少需要覆盖以下补充断言：

- 企业训练发布后不可直接编辑；任何修改必须复制为新草稿并发布新版本。
- 新版本不得覆盖旧版本内容、组织范围快照、员工 `answer_record`、统计摘要或 `audit_log`。
- 每名员工每个企业训练版本只允许一次正式提交，重复提交、补考、取最高分和取最后一次提交均不属于首期。
- 企业训练首期无强制截止时间，停止新增作答只通过企业管理员手动下架。
- 下架后员工只能查看自己的历史结果摘要，不得新增作答或重新进入题目详情和答案解析。
- 企业管理员不得查看员工企业训练逐题作答明细、客观题逐题对错、正式学习题目级或答案级明细、员工企业额度 AI 学习单个任务详情。
- 企业管理员首期不得导出员工统计数据。
- 内容域保留期、到期隐藏恢复窗口、`audit_log` 保留期和 `ai_call_log` 保留期必须按 ops config contract 执行，并写入审计追溯。

## Remaining Work

仍未确认且不应在本会话推进：

- 额度包初始点数。
- AI 出题、AI 组卷、企业训练生成、平台内容老师生成正式草稿的具体消耗点数。
- 用户级、企业级、全局级并发上限。
- 排队超时、运行超时、重试上限和幂等窗口。
- 高峰积压阈值、等待阈值和降级级别映射。
- provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。
