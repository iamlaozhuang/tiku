# P1 RC-01 账号手机号跨域唯一性整改方案

日期：2026-07-16

任务：`p1-remediation-rc-01-account-phone-identity-2026-07-16`

分支：`codex/p1-rc01-registration-phone-uniqueness`

工作树：`D:/tiku/.worktrees/p1-rc01-registration-phone-uniqueness`

## 目标

关闭 F-0001 的静态失效模式：所有会新增 `user` 或 `admin` 的权威写路径必须在同一个数据库事务中，以同一手机号键获取共享事务级互斥锁，再同时复核学员/员工域与管理员域；任一域已占用时返回稳定冲突，不允许跨域双写改变登录选择顺序。

本任务不合并 F-0129 注册工作单元整改，也不声称关闭 F-0049 的组织状态、同域唯一异常或审计语义缺口。

## 已读取规范与权威来源

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/` 全部 ADR，身份与授权边界重点使用 ADR-002、ADR-007
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-12-phone-visibility-and-prelaunch-ai-paper-history-decision.md`
- `docs/01-requirements/traceability/2026-06-29-security-unit-b-auth-role-boundary-static-review.md`
- `docs/05-execution-logs/audits-reviews/2026-07-15-p1-p2-remediation-finding-ledger-v1.yaml`
- `docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-01-jit-revalidation.md`
- `D:/tiku-readonly-audit/findings/finding-register.yaml` 中 F-0001 原始记录

## 第一性原理与当前写路径

手机号唯一性是登录身份不变量，不能由路由顺序或事务外“先查后写”保证。当前服务端只有三个新增账号域行的权威写路径：

1. 公共个人注册：`local-session-runtime.ts` 写 `user`；当前只预查 `user`，写事务也不检查 `admin`。
2. 后台管理员创建：`admin-flow-runtime-repository.ts` 写 `admin`；当前双域预查位于写事务外。
3. 员工账号创建/导入：`admin-organization-org-auth-runtime-repository.ts` 写 `user`；当前有员工专用手机号锁但只复核 `user`，未检查 `admin`，且锁键未与前两条写路径共享。

只修公共注册与管理员创建仍会留下“管理员创建 ↔ 员工创建”竞争窗口，因此三个 writer 必须共同接入一个具名、单一来源的手机号事务锁查询。已有账号绑定为员工不新增手机号身份行，不属于本任务 writer 集合。

## 实现方案

1. 新增共享账号手机号事务锁查询构造器，集中固化 advisory-lock namespace 与手机号键。
2. 公共注册的快速预查同时覆盖 `user`、`admin`；创建 `user` 的事务获取共享锁后再次检查两域。竞争期冲突映射为现有标准 `409001`，不得创建 session。
3. 管理员创建把双域检查移动到获取共享锁后的写事务内；保持现有冲突 reason 与 API envelope。
4. 员工新账号创建改用同一共享锁，并在写入 `user` 前同时检查 `admin`、`user`；复用现有 `account_conflict` 映射。
5. 建立 writer-inventory 守卫，扫描非测试服务端源码中的 `insert(user)` / `insert(admin)`，新增 writer 未接入共享锁时测试失败。
6. F-0129 仍由后续独立任务处理 credential、user/student、session 的单一工作单元；本任务不借并发冲突清理扩大注册原子性范围。

## TDD 与对抗式验证

### RED

- 已有管理员手机号的公共注册必须在创建 credential 前返回 `409001`。
- 公共注册快速预查后发生的事务期手机号竞争必须返回 `409001`，且不创建 session。
- 共享锁查询必须使用稳定 namespace 与手机号键。
- 三个新增账号 writer 必须全部调用共享锁构造器，并同时复核 `user`/`admin`。

### GREEN

- 实现最小共享锁与事务内双域复核，不改 schema、migration、依赖或 API 成功合同。
- 运行定向测试后执行完整 unit/lint/typecheck/format/build 门禁。

### Round 1

攻击预存冲突、事务间竞争、检查顺序、失败后 session 副作用与新增 writer 漏接锁。

### Round 2

独立复核锁键一致性、事务边界、三条 writer 完整性、错误映射、F-0129/F-0049 越界和 P0 不变量回归。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-01-account-phone-identity.md`
- `docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-01-account-phone-identity.md`
- `docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-01-account-phone-identity.md`
- `src/server/repositories/account-phone-identity-lock.ts`
- `src/server/repositories/account-phone-identity-lock.test.ts`
- `src/server/repositories/user-registration-repository.ts`
- `src/server/services/user-registration-service.ts`
- `src/server/services/user-registration-service.test.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/local-session-runtime.test.ts`
- `src/server/repositories/admin-flow-runtime-repository.ts`
- `src/server/repositories/admin-flow-runtime-repository.test.ts`
- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts`
- `tests/unit/p1-account-phone-identity-writer-guard.test.ts`

## 禁止范围

- `AGENTS.md`、依赖清单、lockfile、schema、Drizzle migration、seed、E2E 与环境配置。
- 数据库执行、runtime/browser acceptance、Provider、P2、F-0129 实现、F-0049 整体修复、PR、force push 与部署。
- 修改只读审计仓库 `D:/tiku-readonly-audit`。

## 风险与停止条件

- 若无法在现有事务内以共享 advisory lock 完成三条 writer 的双域复核，或必须引入 schema/migration/数据库操作，立即停止并请求新鲜批准。
- 若当前账号 writer 清单超过三个，先更新范围与证据，不得静默扩大实现。
- advisory lock 只保护所有合规 writer；writer-inventory 测试是防止未来绕过该不变量的静态门禁。
- 任何测试表明 F-0129 的单一工作单元是完成本 finding 的必要前提时，停止本任务，不把两个根因合并。

## 完成条件

- F-0001 的预存管理员反向碰撞与并发双写失效模式均由当前静态实现阻断。
- 三个权威 writer 使用同一事务锁并在锁后复核两个账号域。
- 定向与完整本地门禁、两轮对抗式复核、evidence/audit、独立提交、ff-only 合入、普通 push 和隔离资源清理完成。
- 不声称 runtime acceptance、数据库实测、F-0129、F-0049、P2 或发布就绪完成。
