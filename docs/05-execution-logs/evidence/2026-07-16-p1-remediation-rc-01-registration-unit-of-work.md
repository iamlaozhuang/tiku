# P1 RC-01 个人注册工作单元证据

日期：2026-07-16

任务：`p1-remediation-rc-01-registration-unit-of-work-2026-07-16`

前序 checkpoint：`470ddcccf2034d9f63c20c6c0c28039fcd65d464`

transition commit：`4db1e1e1dc346071d749445d807f65c3e65a7da6`

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
- transition pre-push 明确输出 `p1TransitionScopeMode: transition_only` 与 `OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR`；因此 repository checkpoint 保持前序 SHA 符合用户批准的 ancestor checkpoint 例外，产品实现不适用该例外。
- P2、21 项 runtime backlog、F-0013 runtime hold、依赖/schema/数据库/Provider/PR/force push/部署边界保持不变。

## Validation Results

Result: pass

- 初始 RED：7 个聚焦文件中 5 个失败文件、9 个失败测试，分别暴露 service 三段副作用编排、route 未传 key、UI 未复用 key、validator 缺失及单事务守卫失败。
- 首次实现 GREEN 后独立复核得到 `CHANGES_REQUESTED`：弱 key + key/载荷快速摘要会形成快速密码预言机，并且同 key 不同手机号不能 key 级 hard conflict。新增两个 RED 用例确认 UUIDv4 校验与 key-only session identity 尚未实现；该版本未提交。
- 修订 GREEN：强制 UUIDv4 key；session id 只摘要 key；同一事务先获取 namespace `200129` 的 key advisory lock，再获取 F-0001 共享手机号锁；恢复通过 Better Auth 慢哈希核对密码，且不轮换 token。
- 五个写点逐一故障注入均留下空 committed table 集合；同 key 不同手机号、不同 key 同载荷、失败计数、锁定态、密码不匹配、缺失/替换 session 均返回既有 `409001` 语义且无写入。
- 最终聚焦回归：7 个文件、41 个测试通过。
- 完整 unit：403 个文件、2418 个测试通过，耗时 823.58 秒。
- `npm.cmd run lint`、`npm.cmd run typecheck`、`npm.cmd run format:check`、`git diff --check` 均通过。
- P1 manual guard 通过：`p1TransitionScopeMode: standard`、P1=125、P2=18、runtime=21；P0 global baseline 通过：finding=35、impact=143、runtime=21、cluster=8、cycle=0，审计仓 SHA 仍为 `a84224fa12ec85b28e6acd945deba2afa28c6c02`。
- Module pre-commit 首轮按预期 hard-block 8 处 `password:` 字面敏感赋值；改为项目既有常量计算键后复跑通过，scope 15 个文件全部 `OK_SCOPE`，敏感与术语扫描无 finding。P1 `pre_commit` guard 同步通过且 `p1TransitionScopeMode: standard`。
- 隔离 worktree 的 `npm.cmd run build` 因 Next/Turbopack 无法从 `D:/tiku/.worktrees/.../src/app` 解析物理位于 `D:/tiku/node_modules` 的 `next/package.json` 而失败；这是隔离布局限制。ff-only 合入后必须在 fresh `master` 通过标准 build，失败即停止 push/closeout。
- 未执行真实 PostgreSQL 并发、数据库 mutation、runtime/browser acceptance、Provider、P2、PR、force push 或部署。

Cost Calibration Gate remains blocked。

## Round 1

Result: pass

- 第一次独立审查击穿快速摘要与 key 级唯一性，结论 `CHANGES_REQUESTED`；阻断项全部在提交前重构并补 RED/GREEN。
- 五表 writer 位于一个 `database.transaction`，任一 insert 返回异常均由 transaction rollback；service 只调用一次 `createPersonalRegistration`。
- key 锁先于 session 查询和手机号锁；同 key 并发被串行，不同 key 同手机号仍由 F-0001 锁串行，hash 冲突最多增加串行化而不会放宽身份唯一性。
- 普通既有账号没有匹配的 registration session id，锁定、停用或存在登录失败计数的账号在慢哈希前 hard conflict；恢复不会成为普通登录入口。

## Round 2

Result: pass

- 修订后的独立只读复核结论 `APPROVE`，P1 blocking finding 为 0；复核者确认 UUIDv4、key-only session id、key lock 顺序、慢哈希、普通/锁定账号拒绝及 token 不轮换。
- non-blocking：第三方 UUIDv4 随机源质量和 header 禁止日志需外部客户端规范约束；fake transaction 未替代真实 PostgreSQL 锁等待；ADR-002 目录整理保留为独立 P2。均未被误述为 runtime 已验收。

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

## Fresh-Master Closeout Gate

ff-only 合入后必须在真实 `master` 运行标准 Turbopack build、聚焦回归、lint、typecheck、format、P0/P1/Module 门禁并通过，之后才允许普通 push。该后置门禁未被本 evidence 预先标记为完成。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不创建并行产品任务。

nextModuleRunCandidate: `P1-RC-01 login failure atomicity JIT revalidation (F-0130)`；仅声明下一即时复检候选，不预先物化范围。
