# P1 RC-02 卡密权益预览与显式确认证据

日期：2026-07-16

任务：`p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已完成标准与高级版需求、现行 traceability、full-role UI/UX 基线、本地脱敏设计板、F-0132 原始审计、当前 UI/API/service/repository/schema 约束及现有兑换测试的读取。来源时间序一致：2026-07-02 与 2026-07-07 基线均要求 server preview + confirm，多目标显式选择；P0 F-0004 只改变消费语义，不关闭预览缺口。

## Requirement Mapping Result

- `01-user-auth.md` 与 `epic-01-user-auth.md` 固定三类卡密、不可撤销消费、原子兑换与多目标显式选择。
- ADR-002 要求 route 仅适配，解释与确认规则属于 service，数据库读取与条件消费属于 repository。
- ADR-007 固定 source `edition`、`auth_upgrade` 与动态 `effectiveEdition`，升级卡不能新建 `personal_auth`，已高级不得再次消费。
- learner UI/UX 基线要求 preview-then-confirm，并在确认前展示标准开通、高级开通或既有标准授权升级的差异。
- plaintext 卡密例外只适用于合格运营 UI；学员 preview 响应、evidence、audit、日志与提交文档均不得携带明文或 hash。

## JIT Revalidation Result

Result: pass

F-0132 Verdict: `confirmed`

- 当前首次提交只执行 `setReviewedRedeemCode`，没有任何 preview 请求。
- 当前确认区只回显输入卡密和泛化说明；合同没有 `redeemCodeType`、结果版本、期限、目标或 `previewVersion`。
- `/api/v1/redeem-codes/redeem` 直接执行不可逆消费；客户端不能为多条标准授权选择升级目标。
- 现有 repository 会在多目标时拒绝消费并保持原子性，但“到消费时才报错”不等于消费前权益预览。

## Scope Freeze

Result: pass

范围只覆盖 F-0132 的 learner server preview、显式升级目标、previewVersion、事务内 confirm 重验、同用户响应丢失恢复、单实例有界 preview 限流及对应合同/service/repository/UI 单元测试。不实现 F-0133、F-0140、F-0141、P2、schema/migration、依赖、真实数据库或 runtime/browser acceptance。

## Transition Evidence

Result: pending_transition_guard

- 前序 F-0131 已以 `08aee5a3c0ea3285d5063089663203953e4dfa7c` 完成提交、ff-only 合入、origin/master 同步与隔离资源清理。
- local master、origin/master 与实时远端均以该 SHA 为当前 transition ancestor；只允许在 P1 transition-only 守卫通过后使用 ancestor checkpoint。
- 只读审计仓库保持 `a84224fa12ec85b28e6acd945deba2afa28c6c02`，不得修改。
- JIT 深复检确认 F-0132 仍成立：当前 UI 首击只写 React 状态，服务端无 preview API/DTO，确认请求只有 `{ code }`，多升级目标没有客户端选择合同。
- P0 F-0004 已守住三类卡密消费与同码条件更新，但没有提供消费前权益快照；本任务不重复修改已成立的不变量。
- 本 transition 只修改 state、queue、plan、evidence、audit；产品源码和测试仍为零 diff。
- P2、21 项 runtime backlog、RV-0021、schema/migration、数据库、依赖、Provider、browser/e2e、PR、force push 与部署边界保持不变。

## Validation Results

Result: pending

## Round 1

Result: pending

## Round 2

Result: pending

## Closeout Command Evidence

待实现与验证后补录；不得预先声称通过。

Cost Calibration Gate remains blocked。
