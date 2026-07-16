# P1 RC-01 学员单会话并发关闭证据

日期：2026-07-16

任务：`p1-remediation-rc-01-single-session-concurrency-2026-07-16`

前序 checkpoint：`f237f54a420e2ceeeb9a9379fcf1a106def33e19`

transition commit：`787dd575687e1ab2226bebb4aae68fbf25406d33`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已读取 F-0131 原始记录、当前 P1 ledger、post-P0 map、P0 RC-01 身份/session 修复证据、标准/高级个人学员与组织员工登录需求、当前 session service/runtime/schema/test 及 RV-0021。审计仓保持 `a84224fa12ec85b28e6acd945deba2afa28c6c02` 且零修改。

## Candidate Correction

Result: pass

F-0129 evidence 中的 F-0130 下一候选提示被当前权威账本否决：F-0130 是原 P0 finding，已在 P0 RC-01 作为 F-0002 的 `root_cause_alias` 静态关闭；当前 P1 ledger 中真正下一个 pending finding 是 F-0131。本记录 supersede 该 handoff 提示，不改写历史 evidence。

## Requirement Mapping Result

- UC-PSTD-001、UC-PADV-001、UC-ORGSTDEMP-001、UC-ORGADVEMP-001 共用学员/员工登录入口，新登录必须撤销旧 session。
- 管理员多 session 是独立合同，不能为关闭 F-0131 而错误收敛。
- ADR-002 要求 service 决定身份策略、repository/runtime 保持持久化事务边界；静态关闭必须同时证明路由选择和事务线性化点。
- ADR-007 的 edition 来源不改变 session 唯一代际要求；标准/高级版均受同一身份边界保护。

## JIT Revalidation Result

Result: pass

F-0131 Verdict: `statically_closed_by_p0`

- 原始基线的 delete → insert 没有共同互斥点，并发双登录可留下两条 session。
- 当前 `createSingleActiveSession` 在一个 `database.transaction` 中先调用 `assertAccountCanCreateSession`。
- `assertAccountCanCreateSession` 先执行 `pg_advisory_xact_lock(hashtext(authUserId))`；transaction-scoped 锁覆盖其后的同用户 session delete 与 replacement insert。
- 对同一 `authUserId`，第二事务必须等待第一事务结束，随后删除第一事务的新 session 再插入自己的 session；最终只有后一代有效。
- `session-service` 仅在管理员登录且适配器提供 `createSession` 时保留多 session；所有既有个人学员与组织员工的登录/轮换均选择 `createSingleActiveSession`。
- 个人注册工作单元直接插入初始 session，但身份与首个 session 在同一事务首次创建，提交前没有可轮换的既有 session，不具备 F-0131 的并发 delete → insert 交错；该 writer 必须作为安全例外进入 inventory 守卫。
- 当前缺口仅是未用独立测试固定上述结构。本任务不需要产品运行时代码或 schema 变更。

## Scope Freeze

Result: pass

只允许新增 `tests/unit/p1-single-session-concurrency-guard.test.ts` 及本任务 state/queue/docs。若守卫实现前发现未锁定的既有账号学员登录/轮换写路径，closure-only 结论失效并立即停止；不得自行扩大到产品源码、唯一约束或 migration。

## Transition Evidence

- 前序 F-0129 已独立提交、ff-only 合入、普通推送并清理；local/tracking/live 均为 `f237f54a420e2ceeeb9a9379fcf1a106def33e19`。
- 当前 transition 只物化 state/queue/plan/evidence/audit，不包含测试或产品实现。
- repository checkpoint 保持前序 SHA；只有 transition-only 守卫通过时才适用用户批准的 ancestor checkpoint 例外。
- P2、21 项 runtime backlog、RV-0021、依赖/schema/数据库/Provider/PR/force push/部署边界保持不变。

## Validation Results

Result: pass

- RED：在新增守卫前执行聚焦命令，Vitest 因 `tests/unit/p1-single-session-concurrency-guard.test.ts` 不存在以 code 1 退出，确认防退化门禁缺失。
- 首版 GREEN 为 3 个 AST 测试，但独立复核构造出 6 类假阴性：table alias/raw SQL writer、嵌套/分支顺序、错误 user id、非首数据库动作/错误锁键、selector 脱离 login，以及注册例外未固定真实执行路径。该版本判 `CHANGES_REQUESTED`，未提交。
- 重写为直接语句级 AST 守卫后，独立复核又两次击穿随机锁调用实参、creator 别名追加 session 与 shorthand destructuring。每次均先修复再复跑，最终结论 `APPROVE`，P1 blocking 为 0。
- 最终 5 个守卫固定：全 `src` 的生产 `auth_session` writer inventory 与常见 alias/namespace/element/raw-literal 旁路；returned 单事务及 callback 参数；顶层 awaited lock → delete → insert；delete/insert 同 `input.authUserId`；首条精确 xact-lock SQL 与 `authUserId` 插值；精确 learner/admin selector、唯一 awaited selector invocation 与 creator 引用盘点；注册同事务同新 `authUserId` 安全例外。
- 最终聚焦回归：3 个文件、44 个测试通过。
- 完整 unit：404 个文件、2423 个测试通过，耗时 959.31 秒。
- `npm.cmd run lint`、`npm.cmd run typecheck`、`npm.cmd run format:check` 与 `git diff --check` 通过。
- P1 manual 与 pre-commit guard 通过：`p1TransitionScopeMode: standard`、P1=125、P2=18、runtime=21；P0 global baseline 通过：finding=35、impact=143、runtime=21、cluster=8、cycle=0，审计仓 SHA 仍为 `a84224fa12ec85b28e6acd945deba2afa28c6c02`。
- Module pre-commit 通过，scope 仅为本任务 evidence、audit 与新增守卫，敏感与术语扫描无 finding。
- 隔离 worktree 的 `npm.cmd run build` 因 Next/Turbopack 无法从 `D:/tiku/.worktrees/.../src/app` 解析物理位于 `D:/tiku/node_modules` 的 `next/package.json` 而失败；这是已知隔离布局限制。ff-only 合入后必须在 fresh `master` 通过标准 build，失败即停止 push/closeout。
- 产品运行时代码、schema、migration、依赖与 lockfile 均为零 diff。
- 未执行真实 PostgreSQL 并发、数据库 mutation、runtime/browser acceptance、Provider、P2、PR、force push 或部署；RV-0021 保持 pending。
- Module closeout 首轮按预期 hard-block 缺失的下一 JIT 候选指针；本次 post-merge evidence-only correction 只补当前 ledger 的 F-0132 handoff，必须在普通 push 前复跑 closeout 并通过。

Cost Calibration Gate remains blocked。

## Round 1

Result: pass

- 主审从线性化点盘点三个生产 writer，确认个人注册初始 session 是身份同事务首次创建的安全例外，既有账号 learner replacement 才是 F-0131 的目标路径。
- 第一轮独立范围复核以 `CHANGES_REQUESTED` 纠正“所有学员发放路径”的过宽表述；queue、plan、evidence 与 audit 均收敛为“既有账号学员登录/轮换路径”。
- 实现阶段首版守卫虽为 GREEN，但对抗复核证明字符串/宽泛 AST 顺序不足以支撑完整 writer 与线性化声明；首版整体废弃，改用符号别名与直接 statement AST 约束。

## Round 2

Result: pass

- 独立复核连续构造错误锁键、creator alias、renamed/shorthand destructuring 等可复现 F-0131 的旁路；所有阻断均在提交前修复。
- 最终独立只读复核结论 `APPROVE`：returned transaction、精确锁实参、首条 transaction-scoped SQL、同用户 delete/insert、selector 唯一调用、creator 引用盘点和注册例外均成立。
- non-blocking：高度动态的 `Reflect.get`、拼接式 raw SQL、赋值式 table alias 不属于纯静态守卫的完备证明；真实 isolation、多实例、连接中断、响应丢失与旧 token 重放继续由 RV-0021 验收。

## Closeout Command Evidence

- `$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; corepack pnpm@10.15.1 exec vitest run tests/unit/p1-single-session-concurrency-guard.test.ts src/server/auth/local-session-runtime.test.ts src/server/services/session-service.test.ts --maxWorkers=1`
- `$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; npm.cmd run test:unit -- --maxWorkers=1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-01-single-session-concurrency-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-01-single-session-concurrency-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-01-single-session-concurrency-2026-07-16 -SkipRemoteAheadCheck`
- `git diff --check`

## Fresh-Master Closeout Gate

ff-only 合入后必须在真实 `master` 运行标准 Turbopack build、聚焦回归、lint、typecheck、format、P0/P1/Module 门禁并通过，之后才允许普通 push。该后置门禁未被本 evidence 预先标记为完成。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不创建并行产品任务。

nextModuleRunCandidate: `P1-RC-01 redeem-code entitlement preview JIT revalidation (F-0132)`；仅声明当前 ledger 的下一即时复检候选，不预先物化范围或授权相关实现。
