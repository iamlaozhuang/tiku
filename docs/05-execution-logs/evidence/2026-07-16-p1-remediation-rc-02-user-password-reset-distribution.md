# P1 RC-02 用户密码重置一次性分发证据

日期：2026-07-16

任务：`p1-remediation-rc-02-user-password-reset-distribution-2026-07-16`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已完成标准与高级版需求索引、员工/运营/授权需求、D05、CT-REQ-046、CT-REQ-054、相关 UI/UX 基线、F-0108 原始审计、当前 production UI/runtime/repository/合同与测试读取。现行要求一致：只有平台运营或超级管理员可重置员工账号；服务端生成凭据、撤销会话、提供一次性分发窗口；首版不强制首次登录改密。

## Requirement Mapping Result

- D05 固定平台运营/超级管理员执行用户密码重置、撤销有效 session 并提供一次性分发窗口，同时明确首版不强制首次登录改密。
- CT-REQ-046 要求生成一次性分发凭据并撤销 session；CT-REQ-054 禁止组织管理员获得员工重置权限。
- ADR-002 要求 route/runtime 负责应用编排、repository 负责持久化；客户端不得决定认证秘密。
- 现有 `AdminUserPasswordResetResultDto` 已提供 `oneTimePasswordPlainText`、`visibleOnce`、`expiresAt`、脱敏提示和 session 撤销状态，无需新合同或 schema。

## JIT Revalidation Result

Result: pass

F-0108 Verdict: `confirmed`

- 当前 UI 使用 `resetPasswordInput` 收集运营指定密码，并向用户重置接口发送 `{ newPassword }`。
- 当前 validator 要求 `newPassword`，runtime 将该值直接交给 repository hash；运营可选定并长期保留用户凭据。
- 成功响应为 `data: null`，没有一次性分发窗口，也没有 `Cache-Control: no-store`。
- 管理员账号重置已有服务端高熵生成、`no-store` 与内存一次性显示的相近实现，可在不引入依赖或 schema 的前提下复用模式。

## Patch Contract

- Root cause: 用户重置把认证秘密的选择权交给运营客户端，同时没有安全的一次性分发响应。
- Security property: 最终密码只由服务端生成；成功响应仅在 `no-store` 标准 envelope 的一次性窗口返回；session 撤销、权限与审计脱敏不回归。
- Exact touchpoints: `AdminOpsManagement.tsx`、`admin-flow-runtime.ts`、既有用户重置 DTO、删除失效 validator 及对应聚焦测试。
- Explicit exclusions: schema/migration/dependency、reset token、邮件/短信、首次登录强制改密、F-0030 原子性、真实 DB/runtime/browser、P2/PR/deploy。
- Required RED: 客户端密码不可控、成功 `no-store` + 一次性 DTO、审计无 secret、UI 无密码输入且只保留最新秘密。

## Scope Freeze

Result: pass

范围只覆盖 F-0108 的服务端生成用户密码、成功响应一次性分发、UI 去除密码输入、保留 session 撤销/权限/脱敏审计，以及管理员账号重置回归。不修改 repository 持久化语义，不合并 F-0030，不实现首登强制改密、外部分发或 runtime acceptance。

## Transition Evidence

Result: pass

- 前序 F-0132 的实现提交 `6af0fbb08bcab9373f3d1a9b8181f03f6364b02c` 与 ready-for-closeout 提交 `9683c2191628be162b8c6f09318fe15af24c1bd1` 已完成 ff-only 合入、fresh-master build/完整回归、origin/master 同步与隔离资源清理。
- local master、origin/master 与实时远端均为 `9683c2191628be162b8c6f09318fe15af24c1bd1`；F-0132 五项 closeout checkpoint 均为 pass。
- 只读审计仓库保持 `a84224fa12ec85b28e6acd945deba2afa28c6c02`，不得修改。
- 本 transition 只修改 state、queue、新 plan、新 evidence、新 audit；产品源码和测试保持零 diff。
- 只有该治理提交通过 P1 `transition_only` 与 Module ancestor checkpoint 后才能合入并开始产品修改；任何其他 `in_progress` SHA 漂移继续 hard-block。
- P2、RV-0016、schema/migration、数据库、依赖、Provider、browser/e2e、PR、force push 与部署边界保持不变。

## Validation Results

Result: pending_product_tdd

transition 阶段只记录 JIT、scope freeze 与治理门禁；产品测试、实现、两轮审查及完整 closeout 结果必须在实际执行后补充，不预先声明通过。

## Closeout Command Evidence

- `corepack pnpm@10.15.1 exec vitest run src/server/services/admin-flow-runtime.test.ts tests/unit/admin-ops-summary-first-ui.test.ts tests/unit/phase-11-auth-session-account-hardening.test.ts tests/unit/phase-20-ra-01-05-password-reset-ops-flow.test.ts tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts --maxWorkers=1`
- `npm.cmd run test:unit -- --maxWorkers=1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-user-password-reset-distribution-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-user-password-reset-distribution-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-user-password-reset-distribution-2026-07-16 -SkipRemoteAheadCheck`
- `git diff --check`

Cost Calibration Gate remains blocked。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不并行物化下一产品任务。
