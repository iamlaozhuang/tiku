# P1 RC-01 个人注册工作单元审查

日期：2026-07-16

任务：`p1-remediation-rc-01-registration-unit-of-work-2026-07-16`

## Round 1

Result: pass

从持久化事实反推边界，确认 credential、`user`、`student` 和初始 session 缺一不可；异常捕获、跨事务补偿或只合并前两段都不能在进程中断与未知提交结果下保持一致。现有 PostgreSQL transaction 足以承载五表原子写，不需要 schema。

对响应丢失的初版“按手机号和密码恢复”方案进行了攻击：它会让普通既有账号借注册接口验证密码并绕过登录失败计数，因此否决。冻结方案改为必须有高熵 `Idempotency-Key`，并只恢复该 key 与同一规范化载荷派生的仍有效初始 session。

## Round 2

Result: pass

第二轮范围复核确认 idempotency 记录复用 `auth_session.id` 不改变外部 URL 或响应字段；普通 session、不同 key/载荷、过期/替换 session、锁定/停用账号均不得进入恢复路径。route 仍只把 token 写入 HttpOnly Cookie，客户端只持有 idempotency key。

F-0001 的共享手机号锁必须保留在同一事务起点；授权、edition、登录失败计数、员工创建与 schema 均不在本任务修改范围。若实现无法同时满足这些边界，Transition Disposition 自动失效并停止。

## Transition Disposition

Decision: APPROVE_SCOPE

F-0129 当前静态缺陷已确认。批准物化 `p1-remediation-rc-01-registration-unit-of-work-2026-07-16`，仅允许 plan 中的文件 allowlist。实现必须先取得 RED；普通既有账号不得通过注册恢复路径绕过登录失败计数，任何需要 schema/migration 的设计必须停止并请求新鲜批准。

## Final Disposition

Decision: PENDING

等待实现、验证与两轮审查。
