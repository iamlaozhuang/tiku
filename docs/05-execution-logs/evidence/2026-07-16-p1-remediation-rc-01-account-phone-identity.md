# P1 RC-01 账号手机号跨域唯一性证据

日期：2026-07-16

任务：`p1-remediation-rc-01-account-phone-identity-2026-07-16`

transition 基线：`7557afc85d4c884b8ed12b222c0bf2de4c8a5612`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已读取 F-0001 原始记录、P1 finding ledger、当前需求 SSOT、标准/高级版身份与授权入口、三条账号创建 writer、登录选择顺序、schema 唯一键、现有服务/仓储测试及 P0 的事务级 advisory-lock 类比实现。需求时间序与来源层级无冲突。

## Requirement Mapping Result

- `01-user-auth.md` 与 `06-admin-ops.md` 明确：学员/员工统一账号域内部可绑定复用，但管理员账号域与学员/员工账号域不得复用同一手机号。
- `epic-01-user-auth.md` 把跨账号域不复用列为个人注册验收条件。
- 手机号展示/脱敏决策明确不改变登录、注册、员工创建与唯一性规则。
- ADR-002 要求服务层拥有业务策略；事务外 UI/route 预查不能替代 repository 的并发不变量。
- ADR-007 的 edition/authorization 计算不受本任务改变；本任务只保护身份键。

## JIT Revalidation Result

Result: pass

F-0001 Verdict: `confirmed`

- 公共注册当前快速预查只查 `user`，已有 `admin.phone` 可直接穿透。
- 公共注册、管理员创建、员工创建是当前非测试服务端源码中仅有的三个 `user`/`admin` 新增 writer。
- 管理员创建虽双域预查，但位于写事务外；公共注册和员工创建未在同一锁键下检查管理员域。
- `user.phone` 与 `admin.phone` 仍只有各表唯一索引；登录先查 `user` 再查 `admin`，跨域双写会稳定改变管理员登录选择顺序。
- 静态关闭不需要 schema 变更：三个 writer 可在各自现有事务中使用同一手机号 advisory lock，并在锁后复核两域。

F-0129 仍为 `confirmed` 且保持独立：其根因是 credential、user/student、session 三段提交，不是跨 writer 的手机号互斥。F-0049 的组织状态竞争、同域唯一异常和 failed audit 语义也不在本任务关闭范围。

## Scope Freeze

Result: pass

本任务只覆盖 F-0001 的共享账号手机号身份不变量。允许变更共享锁构造器、三个账号 writer、公共注册冲突合同及对应定向/静态 writer 守卫测试；不允许 schema、migration、依赖、数据库运行、runtime acceptance、F-0129、F-0049 整体修复或其他产品域变更。

## Transition Evidence

- 前序 F-0003 已提交、ff-only 合入并普通推送到 `origin/master`；local/tracking/live 均为 `7557afc85d4c884b8ed12b222c0bf2de4c8a5612`。
- 前序 worktree 与短分支已清理。
- 当前 transition 仅物化本任务的 state/queue/plan/evidence/audit，不含产品实现。
- P2、21 项 runtime backlog、F-0013 runtime hold、依赖/schema/数据库/Provider/PR/force push/部署边界保持不变。

## Validation Results

Result: pass

- RED：新共享锁模块尚不存在；公共注册仍调用旧的单域预查；管理员创建仍在事务外预查；writer guard 检出三条 writer 均未接入共享锁。定向套件得到 5 个失败文件、7 个失败测试，失败语义与 F-0001 一致。
- GREEN：共享 helper 使用固定 namespace `200113` 和手机号 hash；公共注册、管理员创建、员工创建均在各自写事务内先获取同一锁，再依次检查 `admin`、`user`；定向 5 文件、28 项通过。
- 公共注册预存管理员冲突在 credential 创建前返回标准 `409001`；快速预查后的事务期冲突同样返回 `409001`，且不创建 session。
- 管理员写路径保持 `admin_phone_exists` / `learner_employee_phone_exists`；员工写路径保持 `account_conflict`，未改变外部 envelope。
- writer inventory 确认当前非测试服务端源码只有三处 `insert(user)` / `insert(admin)`，三处均在共享锁后写入。
- `npm.cmd run lint`：通过，无 warning。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run format:check`：通过。
- `git diff --check`：通过。
- 完整单元回归最终通过：402 个测试文件、2400 项测试，`--maxWorkers=1`，耗时 780.17 秒。
- 前两轮完整回归分别命中两个互不相同、与本任务文件无依赖的既有异步 UI 抖动：`student-mock-exam-report-ui` 的重试计数和 `phase-20-ra-06-03` 的组织授权行等待。前者单测 3/3、整文件 3/3 通过；后者定向呈 2/3 通过、整文件 2/2 通过，证明是可独立复现的基线时序波动。本任务未越界修改这些测试；第三次原命令完整通过，未把失败伪报为通过。
- 隔离 worktree 的 `npm.cmd run build` 再次因 Next/Turbopack 不允许从 project root 外解析物理位于 `D:/tiku/node_modules` 的 `next/package.json` 而失败；与前序任务的隔离布局限制一致。标准 build 必须在 ff-only 合入后的 fresh `master` 执行并通过，失败即停止 push 和 closeout。
- 未执行真实 PostgreSQL 并发、数据库 mutation、runtime/browser acceptance、Provider、P2、PR、force push 或部署。

Cost Calibration Gate remains blocked。

## Round 1

Result: pass

- 从所有 `user` / `admin` 新增 writer 反推不变量，确认公共注册、管理员创建、员工创建三条路径完整覆盖；已有账号绑定为员工不新增手机号身份，不属于 writer。
- advisory lock 使用单一 helper 和双参数 namespace，hash 冲突最多造成额外串行化，不会放宽唯一性。
- 双域查询发生在锁后、插入前；并发双方不论谁先获得锁，后者都能观察前者已提交的账号域行并返回冲突。
- 公共注册竞争失败不会创建 `user` 或 session；可能遗留 credential 的问题仍由 F-0129 独立处理。
- 管理员的组织 active 预查仍在事务外，明确保留给 F-0049，不将部分改善误报为其关闭。

## Round 2

Result: pass

- 独立只读审查结论 `APPROVE`，blocking finding 为 0；复核者单独确认三条 writer、同一锁键、锁后双域检查、公共注册 `409001` 与无 session 副作用、管理员/员工冲突合同及 F-0129/F-0049 边界。
- 复核者独立执行 `typecheck --incremental false`、定向 28 项与 `git diff --check`，均通过。
- non-blocking 观察：writer guard 面向当前 TypeScript 字面 writer，别名/raw SQL 或同文件新增第二 writer 仍需未来守卫演进与人工审查；当前三条 writer 已逐一人工确认，因此不影响本次结论。
- 本任务只证明静态事务编排与 SQL 形态；没有把未执行的真实 PostgreSQL 并发验证描述为 runtime acceptance。

## Closeout Command Evidence

- `$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; corepack pnpm@10.15.1 exec vitest run src/server/repositories/account-phone-identity-lock.test.ts src/server/services/user-registration-service.test.ts src/server/auth/local-session-runtime.test.ts src/server/repositories/admin-flow-runtime-repository.test.ts tests/unit/p1-account-phone-identity-writer-guard.test.ts --maxWorkers=1`：5 文件、28 项通过；复用主工作树已有依赖，不安装或变更依赖。
- `npm.cmd run test:unit -- --maxWorkers=1`：最终 402 文件、2400 项通过；前两次非本任务异步 UI 波动及复现结果已如实记录。
- `npm.cmd run lint`：通过。
- `npm.cmd run typecheck`：通过。
- `npm.cmd run format:check`：通过。
- `npm.cmd run build`：隔离 worktree 受上述 Next/Turbopack 物理依赖布局限制；保留到 ff-only 合入后的 fresh `master` 强制执行。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`：在产品提交与 closeout 前后执行，结果必须为 pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`：在产品提交与 closeout 前后执行，结果必须为 pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-01-account-phone-identity-2026-07-16`：产品提交与 closeout 状态提交前执行，结果必须为 pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-01-account-phone-identity-2026-07-16`：ready-for-closeout 状态物化后执行，结果必须为 pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-01-account-phone-identity-2026-07-16 -SkipRemoteAheadCheck`：ready-for-closeout 状态物化后执行，结果必须为 pass。
- `git diff --check`：通过。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不创建并行产品任务。

nextModuleRunCandidate: `P1-RC-01 registration unit-of-work JIT revalidation (F-0129)`；仅声明下一即时复检候选，不预先物化范围。

## Fresh-Master Closeout Gate

ff-only 合入后必须在真实 `master` 运行标准 Turbopack build、定向回归、lint、typecheck、format、P0/P1/Module 门禁并通过，之后才允许普通 push。该后置门禁未被本 evidence 预先标记为完成。
