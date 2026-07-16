# P1 RC-01 学员单会话并发关闭审查

日期：2026-07-16

任务：`p1-remediation-rc-01-single-session-concurrency-2026-07-16`

## Transition Disposition

Decision: APPROVE_SCOPE

F-0131 的原失效交错依赖缺少共同互斥点。当前 P0 实现已在同一事务内用按 `authUserId` 的 transaction advisory lock 串行化 delete → insert，并由 service 将非管理员登录统一路由到 `createSingleActiveSession`，因此允许按 `statically_closed_by_p0` 的 closure-only 范围物化任务。

只允许增加一个静态防退化守卫与治理证据。若发现任何未持锁的既有账号学员登录/轮换路径、锁不覆盖删除与插入，或必须修改产品源码/schema/migration，则本批准自动失效并停止。个人注册初始 session 仅在身份与首个 session 同事务首次创建时是安全例外，并必须进入 writer inventory。

## Round 1

Result: pass

从线性化不变量反推所有生产 session writer：`auth_session` 的 insert 只存在于 `local-session-runtime.ts` 的学员替换、管理员追加和个人注册初始 session 三处。个人注册面对新身份并受独立注册工作单元约束；普通登录只有 `session-service.login` 一个发放编排点。该编排只在 `isAdminLogin` 且适配器提供 `createSession` 时追加管理员 session，其他角色均调用 `createSingleActiveSession`。

学员替换函数只有一个 `database.transaction`。账号检查函数的第一项数据库动作是 `pg_advisory_xact_lock(hashtext(authUserId))`，其后才进行密码复核、删除同用户 session 和插入替代 session；异常会回滚整个事务。同一用户并发被串行，不同用户的 `hashtext` 碰撞最多造成额外串行，不会放宽正确性。开发环境 `local-acceptance-session-service` 只生成受 localhost 与非 production 门禁保护的管理员验收身份，不是学员登录旁路。

结论：F-0131 可静态关闭；应新增 writer inventory、transaction/lock/delete/insert 顺序和 learner/admin 路由守卫。真实 PostgreSQL 锁等待与多实例行为仍属于 RV-0021。

## Round 2

Result: pass

独立只读复核首先以 `CHANGES_REQUESTED` 击穿过宽范围：个人注册工作单元直接插入初始 session，并不调用 `createSingleActiveSession`。queue、plan、evidence 与审查边界随后全部收敛为“既有账号学员登录/轮换路径”，并把身份与首个 session 同事务首次创建的注册 writer 明确列为 inventory 安全例外。

修订后复核结论为 `APPROVE`，P1 blocking 为 0。生产 `auth_session` insert 只有学员替换、管理员追加、个人注册初始 session 三类；既有账号非管理员登录统一选择 `createSingleActiveSession`；账号事务锁严格先于密码复核、delete、insert。守卫实现必须限定函数边界和 writer 数量，避免注释、同名字符串或跨函数顺序造成假阳性。

残余非阻断风险：没有 `auth_session.user_id` 唯一约束或 generation 第二道防线，正确性依赖未来 writer 继续共享同一锁；注册例外依赖 F-0129 工作单元持续成立；不同用户 `hashtext` 碰撞可能增加等待；真实 isolation、跨实例锁等待、连接中断、响应丢失与旧 token 重放只能由 RV-0021 验收。

## Final Disposition

Decision: pending

最终关闭取决于守卫 RED/GREEN、完整回归、两轮审查和 fresh-master closeout 门禁。
