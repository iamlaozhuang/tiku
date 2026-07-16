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

Result: pending implementation

将在 RED/GREEN、完整静态门禁、两轮对抗式复核和 fresh-master build 后填写。
