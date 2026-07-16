# P1 RC-01 学员单会话并发关闭方案

日期：2026-07-16

任务：`p1-remediation-rc-01-single-session-concurrency-2026-07-16`

分支：`codex/p1-rc01-single-session-concurrency`

工作树：`D:/tiku/.worktrees/p1-rc01-single-session-concurrency`

## 目标

即时深复检 F-0131。若 P0 已建立的同账号事务级 advisory lock 确实把学员 session 的删除与重建串行化，则只增加防退化静态守卫和证据，以 `statically_closed_by_p0` 关闭静态 finding；不重复修改运行时代码，不声称 RV-0021 的真实 PostgreSQL 并发验收完成。

## 已读取规范与权威来源

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/` 全部 ADR；重点复核 ADR-002、ADR-007
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- 当前 P1 finding ledger、post-P0 revalidation map 与 P0 RC-01 静态修复证据
- `D:/tiku-readonly-audit/findings/finding-register.yaml` 的 F-0131 原始记录
- `D:/tiku-readonly-audit/runtime/runtime-validation-backlog.yaml` 的 RV-0021
- 标准/高级个人学员与组织员工的 UC-\*-001 登录用例

## 第一性原理与 JIT 结论

“单活 session”是同一 `auth_user_id` 上 session 代际替换的线性化不变量。原 finding 的失败交错成立条件是两个事务都能在没有共同互斥点时先删除旧行、再各自插入新行。唯一约束是一种实现手段，不是唯一正确性来源；只要所有既有账号学员登录/轮换路径在同一数据库事务内先取得同一账号锁，再执行删除和插入，并发调用就等价于串行顺序：后提交路径会删除前一条新 session，最终只剩一条。

当前实现的 `createSingleActiveSession` 在同一 `database.transaction` 内先调用 `assertAccountCanCreateSession`，后者执行按 `authUserId` 的 `pg_advisory_xact_lock(hashtext(...))`；随后才删除该用户全部 session 并插入替代 session。`session-service` 只允许管理员选择不删除旧 session 的 `createSession`，既有个人学员和组织员工的登录/轮换均落到 `createSingleActiveSession`。个人注册工作单元会直接插入初始 session，但它与新身份在同一事务首次创建，提交前不存在可并发轮换的既有 session，是需由 writer inventory 显式分类的安全例外。因此 F-0131 的原静态失效路径已被 P0 关闭，当前缺口是没有一个独立守卫固定 writer 分类、事务、锁、删除、插入及学员/管理员路由关系。

F-0129 evidence 中的下一候选 F-0130 是过期 handoff 提示；F-0130 已在 P0 RC-01 作为 F-0002 的根因别名静态关闭。本任务按当前 P1 ledger 选择真正 pending 的 F-0131，不重开 F-0130。

## 实现方案

1. 增加一个只读源码结构守卫，解析 `local-session-runtime.ts` 与 `session-service.ts`。
2. 守卫确认 `createSingleActiveSession` 只有一个事务边界，并且账号 advisory lock、session delete、session insert 严格按顺序位于该事务内。
3. 守卫确认管理员可使用 `createSession`，其他既有账号登录角色必须使用 `createSingleActiveSession`；同时盘点生产 `auth_session` insert 只能属于学员替换、管理员追加和个人注册初始 session 三类，避免后续新增未分类旁路。
4. 运行现有 session 单元测试、完整静态回归与 P0/P1/Module 门禁；产品运行时代码保持零 diff。

## TDD 与对抗式验证

### RED

- 新守卫文件尚不存在，当前测试体系不能在锁被移出事务、删除提前到锁前、插入绕过事务或学员路由误选 `createSession` 时稳定失败。

### GREEN

- 只补最小静态守卫，不重写已正确的 P0 产品逻辑。
- 不引入 schema、唯一约束、migration、依赖、数据库执行或 runtime/browser acceptance。

### Round 1

枚举所有生产 session insert 与登录入口，攻击同用户双登录、不同用户哈希碰撞、管理员多 session、注册初始 session 安全例外、密码复核失败及事务回滚；若发现任一未持有同一锁的既有账号学员登录/轮换写路径，立即停止 closure-only 方案。

### Round 2

独立只读复核结构守卫是否存在假阳性、源码匹配是否越界、P0 锁生命周期是否确为 transaction-scoped，以及 RV-0021 是否仍被明确保留。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- 本 task plan、evidence、audit review
- `tests/unit/p1-single-session-concurrency-guard.test.ts`

## 禁止范围

- 产品运行时代码、schema、migration、依赖、lockfile、seed、E2E、环境配置与只读审计仓库。
- 真实数据库/多实例并发、runtime/browser acceptance、Provider、P2、PR、force push 与部署。

## 风险与停止条件

- 若存在任何既有账号学员登录/轮换旁路未调用 `createSingleActiveSession`，停止并重新冻结产品修复范围；个人注册初始 session 仅在身份与 session 同事务首次创建时属于安全例外。
- 若 advisory lock 不覆盖删除与插入的完整事务生命周期，停止，不得以测试文档掩盖产品缺陷。
- `hashtext` 碰撞只会让不同用户额外串行，不会放宽单用户互斥；真实性能影响保留给 runtime 验收。
- 静态守卫只能证明代码结构，不能替代真实 PostgreSQL 锁等待、连接中断和多实例验收。

## 完成条件

- F-0131 被两轮对抗复核为 `statically_closed_by_p0`。
- 新守卫能固定生产 writer inventory、同事务内 lock → delete → insert 与 learner/admin 路由边界。
- 产品运行时代码零变更；聚焦测试、完整 unit、lint、typecheck、format、build 与治理门禁通过。
- evidence 明确保留 RV-0021，完成独立提交、ff-only 合入、普通 push 与隔离资源清理。
