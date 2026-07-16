# P1 RC-01 个人注册工作单元证据

日期：2026-07-16

任务：`p1-remediation-rc-01-registration-unit-of-work-2026-07-16`

transition 基线：`470ddcccf2034d9f63c20c6c0c28039fcd65d464`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已读取 F-0129 原始记录、P1 finding ledger、标准/高级版身份与授权需求入口、US-01-01、UC-PSTD-001、UC-PADV-001、SC-ATOMICITY-IDEMPOTENCY、当前 registration service/repository/runtime/route/UI/schema/test，以及 F-0001 已合入的共享手机号锁。2026-06-21 fulfillment matrix 的历史 `covered` 行明确要求 fresh evidence，已被 2026-07-14 原始 finding 与当前代码证据具体化，不构成需求冲突。

## Requirement Mapping Result

- US-01-01 要求一次注册创建账号并进入卡密页；UC-PSTD-001 明确输出 `user` 与 learner session，二者属于同一主流程。
- UC-PADV-001 复用同一注册/登录入口，advanced 只在后续授权上下文扩展；本任务不得改变 `personal_auth`、`effectiveEdition` 或 quota。
- SC-ATOMICITY-IDEMPOTENCY 要求关键表单在部分成功、响应丢失、重放与并发下保持单一可解释结果。
- ADR-002 要求 service 编排业务策略、repository 持有持久化原子边界；三个独立 repository transaction 不能构成注册工作单元。
- ADR-007 只约束授权 edition 来源；注册身份原子性对标准版和高级版共同成立。

## JIT Revalidation Result

Result: pass

F-0129 Verdict: `confirmed`

- 当前 service 仍依次调用 `createPasswordCredential`、`createPersonalUser`、`createSingleActiveSession`。
- 默认 runtime 分别为 credential、user/student、session 启动三个 `database.transaction`；后一步失败无法回滚前一步。
- F-0001 只把 `user` 写入置于共享手机号锁内；在锁后发现竞争时，先前 credential 仍已独立提交。
- 当前测试覆盖非法、冲突和成功，但没有五个写点故障、提交后响应丢失、相同/不同 idempotency key 重放。
- 现有 `auth_session.id` 为内部 text 主键，可在不改 schema 的前提下持有注册尝试摘要；恢复必须严格限定为相同 key/载荷对应的仍有效初始 session。

## Scope Freeze

Result: pass

本任务只覆盖 F-0129。允许收敛 registration service/repository/runtime/route/validator、注册页的 idempotency header、对应单元/静态守卫测试及治理证据；不允许 schema、migration、依赖、真实数据库、runtime/browser acceptance、员工创建工作单元、登录锁定策略、授权/edition、P2、PR、force push 或部署。

## Transition Evidence

- 前序 F-0001 已提交、ff-only 合入并普通推送；local/tracking/live 均为 `470ddcccf2034d9f63c20c6c0c28039fcd65d464`。
- 前序 worktree 与短分支已清理。
- 当前 transition 仅物化 state/queue/plan/evidence/audit，不含产品实现。
- P2、21 项 runtime backlog、F-0013 runtime hold、依赖/schema/数据库/Provider/PR/force push/部署边界保持不变。

## Validation Results

Result: pending

等待 RED、GREEN、完整静态回归与 fresh-master build。

Cost Calibration Gate remains blocked。

## Round 1

Result: pending

等待实现后故障点、重放、锁定绕过与事务边界复核。

## Round 2

Result: pending

等待独立只读复核。

## Closeout Command Evidence

- `$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; corepack pnpm@10.15.1 exec vitest run src/server/validators/user-registration.test.ts src/server/services/user-registration-service.test.ts src/server/auth/user-registration-route.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/student-register-ui.test.ts tests/unit/p1-registration-unit-of-work-guard.test.ts tests/unit/p1-account-phone-identity-writer-guard.test.ts --maxWorkers=1`
- `npm.cmd run test:unit -- --maxWorkers=1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-01-registration-unit-of-work-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-01-registration-unit-of-work-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-01-registration-unit-of-work-2026-07-16 -SkipRemoteAheadCheck`
- `git diff --check`

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不创建并行产品任务。

nextModuleRunCandidate: `P1-RC-01 login failure atomicity JIT revalidation (F-0130)`；仅声明下一即时复检候选，不预先物化范围。
