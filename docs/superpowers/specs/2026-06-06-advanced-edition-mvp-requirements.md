# Advanced Edition MVP Requirements

## Purpose

本文档用于沉淀高级版新增能力的首期 MVP 需求规格，并作为后续验收、contract 拆分和实现任务拆分的主依据。

本文档不是实现批准。后续如涉及数据库 schema、迁移、API、服务、UI、依赖、环境变量、AI provider、staging、prod、部署、在线支付或真实企业数据，必须另起任务方案并按项目门禁审批。

## Source Of Truth

本阶段采用“原设计记录作为决策源，新 MVP 文档作为验收源”的治理模型。

决策源：

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- 该设计记录沉淀标准版/高级版、AI 出题、AI 组卷、企业学习运营后台、企业训练、授权升级、AI 额度、异步任务、内容保留和日志脱敏等已定稿决策。
- 本文档不得重新解释或覆盖该设计记录中的已定稿决策。

验收源：

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- 本文档把已定稿决策转成首期 MVP 的需求边界、衔接矩阵、角色数据边界和验收场景。
- 后续 contract、任务队列和实现计划应优先引用本文档的验收口径，同时回链到原设计记录中的决策依据。

写入规则：

- 已确认事项写入正文。
- 未确认事项写入 `Follow-Up Decision Queue`，不得写成既定需求。
- 本文档只描述需求与验收边界，不直接定义数据库迁移、API route handler、service 实现、UI 组件或 worker 实现。
- 命名必须遵守 `AGENTS.md` 和项目术语表，尤其使用 `authorization`、`auth`、`paper`、`redeem_code`、`mock_exam`，不得使用禁用或非项目术语。

## MVP Main Loop

首期主闭环定稿为：

`高级版个人用户 AI 出题/组卷 + 企业管理员创建企业训练 + 员工作答统计 + 运营后台授权/额度管理`

该主闭环用于约束首期范围：

- 高级版个人用户可以在个人学习场景使用 AI 出题和 AI 组卷。
- 企业管理员可以基于企业授权和企业额度创建企业训练内容。
- 企业员工可以作答企业训练，并形成企业训练统计。
- 平台运营管理员可以处理授权升级、额度发放/调整、额度流水和必要的运营治理。
- 正式题库、正式练习、正式模拟考试、考试报告、错题本继续保留原业务口径，不因 AI 或企业训练首期能力被直接污染。

## Non-Goals

首期明确不做：

- 不接入在线支付、支付回调、退款回调、自动对账或发票税务闭环。
- 不引入复杂队列基础设施作为首期硬依赖；AI 生成任务首期仍按数据库任务表、轻量 worker 和可恢复扫描模型推进。
- 不允许 AI 生成内容自动写入正式 `question`、`paper`、`practice`、`mock_exam`、`exam_report` 或 `mistake_book`。
- 不允许企业训练内容一键采纳为平台正式题库或正式试卷。
- 不把企业训练成绩直接并入正式 `exam_report` 或正式 `mistake_book`。
- 不允许企业管理员查看员工个人无关内容、prompt、AI 原始输入输出、员工主观题原文或明文 `redeem_code`。
- 不提供普通运营一键硬删除敏感内容。
- 不连接 staging、prod、cloud、真实 provider、外部支付或真实客户/客户类私密数据。

## Traceability To Existing Decisions

| MVP Requirement Area    | Existing Decision Source                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 标准版/高级版授权与升级 | `Edition Model`, `Authorization Upgrade`, `Auth Upgrade Data Contract`, `Edition Upgrade Redeem Code Relationship`, `Organization Manual Upgrade Operation`                       |
| 授权上下文与权限边界    | `Authorization Context API Contract`, `User And Content Role Segmentation`, `Actor And Owner Model`                                                                               |
| AI 出题与 AI 组卷       | `AI Generated Content Governance`, `AI Generated Question Schema And Validation`, `AI Paper Generation Scope`                                                                     |
| 企业训练                | `Organization Training Minimum Loop`, `Content Domains`, `Statistics Separation`                                                                                                  |
| 企业后台统计            | `Organization Portal Homepage Metrics`, `Employee Detail Field Visibility`, `Organization Snapshot At Answer Time`                                                                |
| AI 额度与异步任务       | `Quota Unit And Configuration`, `Quota Defaults And Consumption Table`, `Quota Package And Ledger Rules`, `Worker Runtime And Recovery`, `Peak Capacity And Degradation Strategy` |
| 内容保留与日志治理      | `Expired Content Governance`, `Log And Evidence Redaction`                                                                                                                        |

## Follow-Up Decision Queue

当前 MVP 需求规格仍需按串行队列继续确认：

1. 新增模块与既有正式模块的衔接矩阵。
2. 个人用户、企业员工、企业管理员、平台内容老师、平台运营管理员之间的角色与数据边界矩阵。
3. 首期主闭环验收场景、失败场景、完成状态和验收证据。
4. 运营配置清单是否进入本文档正文，还是后续单独形成配置 contract。
