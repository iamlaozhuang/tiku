# L6 Owner Preview Readiness Package

packageId: L6_OWNER_PREVIEW_READINESS_2026_06_23
status: prepared_no_actual_walkthrough_executed
preparedAt: "2026-06-23T00:36:31-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
sourceTaskId: acceptance-l6-owner-preview-readiness-2026-06-23

## 这个包解决什么问题

L5 seeded local account 已经证明：本地 dev 环境里，个人授权、企业授权、升级、企业训练、学员答题、系统运营、
内容运营、审计和 AI 调用日志摘要等现有路径能跑通。

L6 owner preview 要解决的是另一个问题：你作为唯一验收负责人，要不要接受这些本地证据，并亲自看一遍关键页面和流程，
确认它们足以支撑下一步决策。

这个包只是准备，不是实际预览。它不代表你已经看过页面，也不代表 Standard MVP 或 Advanced MVP 已经通过最终验收。

## 当前可以作为 L6 准入的证据

| 证据                       | 当前结论       | 对 L6 的意义                                                       |
| -------------------------- | -------------- | ------------------------------------------------------------------ |
| L5 browser/runtime scope   | 已补充         | 本地浏览器、路由保护和安全 smoke 有基础证据。                      |
| fixture-only role coverage | 已补充         | 页面和权限分支在模拟数据下能表现正确，但不能单独作为真实流程证明。 |
| seeded local account run   | 已通过现有路径 | 本地数据库、seed、浏览器/API 和角色流程有运行时证据。              |
| final decision review      | 仍为 Blocked   | 之前最终验收没有通过；后续必须重新评审，不能沿用旧结论。           |

## 你作为 owner 要确认的核心问题

| 问题                                      | 普通话说明                                                   | 通过条件                                              | 阻塞条件                                          |
| ----------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------- | ------------------------------------------------- |
| 这些本地流程是否代表你想验收的 MVP 主路径 | 不是看代码，而是看系统能不能完成用户会真的做的事。           | 关键页面、按钮、状态和结果都符合预期。                | 核心流程打不开、路径不清楚、状态明显错误。        |
| 标准版和高级版是否区分清楚                | 用户、企业、升级、回落、额度和范围不能混淆。                 | 页面和证据能解释标准版、高级版和升级后的实际权益。    | UI 或证据无法判断当前到底是什么版本。             |
| 单人 owner 模式是否可接受                 | 你承担账号、数据、证据、监控、回滚、停止和最终评审责任。     | 你明确认可自己作为唯一责任主体，Codex 只整理证据。    | 你认为必须有其他真实负责人或组织代表才能验收。    |
| 本地证据是否可以推进下一步                | 本地 dev 不等于 staging/prod，但可以作为进入下一决策的依据。 | 你接受“本地现有路径可进入下一决策，但仍非最终 Pass”。 | 你要求先补独立角色账号、staging 或真实 Provider。 |
| 残余缺口是否可接受                        | 独立角色账号和部分高级 release gate 仍未补齐。               | 缺口被记录，并作为后续任务或阻塞门禁处理。            | 你认为缺口必须先补齐，否则不能继续。              |

## 建议的 L6 owner preview 顺序

| 顺序 | 你看什么                 | 重点判断                                                                   | 可以接受的证据                                   | 不应记录的内容                                          |
| ---- | ------------------------ | -------------------------------------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------- |
| 0    | 登录页和未登录保护       | 未登录用户不能进入受保护页面。                                             | 路由、角色标签、pass/fail。                      | token、cookie、localStorage。                           |
| 1    | 学员首页和授权状态       | 学员能看到自己的授权状态和可用入口。                                       | 角色标签、页面状态摘要。                         | 账号密码、内部 DB 行。                                  |
| 2    | 个人标准版/高级版/升级   | 标准版、高级版、升级、过期和撤销回落能解释清楚。                           | `personal_auth`、`auth_upgrade` 的红acted 摘要。 | plaintext `redeem_code`、内部自增 `id`。                |
| 3    | 练习、模考、报告、错题本 | 学员能完成 `practice`、`mock_exam`、`exam_report`、`mistake_book` 主路径。 | 页面状态、完成状态、报告可达性。                 | 原始作答文本、完整题目和完整试卷。                      |
| 4    | 企业授权和企业训练       | `org_auth`、企业训练、员工答题路径能跑通。                                 | 企业标签、员工流程状态、训练完成摘要。           | 员工原始答案、真实企业信息。                            |
| 5    | 内容运营入口             | `question`、`material`、`paper`、`knowledge_node` 管理入口可识别。         | 页面和动作状态摘要。                             | 完整材料、完整 OCR、完整试卷内容。                      |
| 6    | 系统运营入口             | `user`、`organization`、`redeem_code`、`authorization`、联系配置可识别。   | 计数、状态、权限边界摘要。                       | 明文卡密、手机号明文、内部自增 id。                     |
| 7    | 审计和 AI 调用日志       | `audit_log` 和 `ai_call_log` 只能看脱敏摘要，不暴露敏感信息。              | 日志条数、动作类型、红acted metadata。           | raw prompt、raw answer、Provider payload、AI 原始输出。 |
| 8    | 残余缺口确认             | 明确哪些不通过、哪些只是本地通过、哪些需要另批。                           | 缺口列表、下一步决策。                           | 把 blocked gate 改写成 pass。                           |

## L6 owner gate table

| Gate               | 责任人    | 当前状态                                  | L6 readiness 结论                                       |
| ------------------ | --------- | ----------------------------------------- | ------------------------------------------------------- |
| 账号盘点           | laozhuang | 单人 owner 模式已确认                     | 可进入准备；实际账号明细不提交。                        |
| 账号创建           | laozhuang | 本任务不创建账号                          | 实际创建或扩展账号需单独批准。                          |
| 账号禁用           | laozhuang | 本任务不禁用账号                          | 真实账号或 staging 账号禁用需单独计划。                 |
| 最终验收评审       | laozhuang | 本任务只准备，不最终评审                  | 最终 Pass 仍需后续 final decision review。              |
| 样本数据           | laozhuang | 当前为本地 synthetic seed 和动态 e2e 数据 | 可用于本地预览，不可当生产样本。                        |
| 来源审核           | laozhuang | L5 证据来源已列明                         | 外部或导入数据需另批。                                  |
| 脱敏核验           | laozhuang | Codex 可协助扫描和整理                    | 你仍是最终脱敏责任主体。                                |
| 监控               | laozhuang | 本地 dev 无 staging 监控                  | staging 监控必须另批。                                  |
| 事故响应           | laozhuang | 本地任务只记录停止条件                    | staging/prod 事故响应必须另批。                         |
| 回滚               | laozhuang | 本任务不部署、不迁移                      | 部署或迁移回滚必须另批。                                |
| 停止执行           | laozhuang | 任何越界、敏感暴露、P0/P1 都停止          | 可作为实际 walkthrough 停止标准。                       |
| 证据脱敏           | laozhuang | Codex 整理脱敏证据                        | 禁止提交敏感原文。                                      |
| staging 资源负责人 | laozhuang | staging 未批准                            | 未有 staging 资源隔离证据前，不能 claim staging ready。 |

## L6 判定标准

| 决策                                    | 何时使用                                            | 后续动作                                            |
| --------------------------------------- | --------------------------------------------------- | --------------------------------------------------- |
| `ready_for_actual_owner_preview`        | readiness 包完整，L5 现有路径证据可支撑你亲自预览。 | 需要你批准实际 walkthrough。                        |
| `blocked_until_dedicated_role_accounts` | 你要求每类角色必须用独立账号证明。                  | 新开 test-only fixture 或 seed/test 扩展任务。      |
| `blocked_until_staging`                 | 你认为本地 dev 不足以评审 owner preview。           | 先准备 staging approval package，不直接部署。       |
| `blocked_until_provider_or_cost`        | 你要求真实 Provider 或成本数据先证明。              | 先准备 Provider/Cost approval package，不直接调用。 |
| `not_ready_due_to_p0_p1`                | 发现核心流程不可用、安全或数据边界问题。            | 停止验收，进入缺陷修复。                            |

## 当前建议判定

建议把本任务判定为：

`ready_for_actual_owner_preview_with_recorded_gaps`

含义是：L6 人工预览已经具备准备条件，但实际预览还没有执行；独立角色账号、Provider、Cost Calibration、
staging、payment、external-service 和最终 Pass 仍然阻塞。

## 实际 owner walkthrough 的精确批准语句

如果你要进入实际本地 owner walkthrough，可以明确回复：

`批准 L6_OWNER_PREVIEW_ACTUAL_WALKTHROUGH_2026_06_23`

这条批准如果给出，也只应允许：

- 本地 `127.0.0.1` / `localhost`；
- 你作为 laozhuang 亲自查看页面；
- Codex 只记录角色标签、路线、结果和脱敏摘要；
- 不记录密码、token、cookie、localStorage、数据库 URL、明文卡密、raw prompt、raw answer、Provider payload、
  完整试卷、完整材料或原始 DB 行。

它不批准 staging、prod、Provider、Cost Calibration、payment、external-service、schema migration、dependency
change、push、PR、force push 或最终验收 Pass。

## 不建议现在直接批准的事项

| 事项                     | 为什么不建议直接批准                                                 |
| ------------------------ | -------------------------------------------------------------------- |
| Provider/model runtime   | 还没有 owner preview 结论，且会涉及 env/secret、payload 和成本风险。 |
| Cost Calibration         | 需要单独口径、样本、计量和责任确认，不能从 L5/L6 自动推出。          |
| staging                  | 需要资源隔离、secret 分离、监控、回滚、停止负责人和数据边界。        |
| payment/external-service | 当前 MVP 验收没有足够外部系统边界证据。                              |
| production release       | 当前证据仍是本地/准备层级，不是发布层级。                            |
