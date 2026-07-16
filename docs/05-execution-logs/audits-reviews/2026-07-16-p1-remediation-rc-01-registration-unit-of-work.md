# P1 RC-01 个人注册工作单元审查

日期：2026-07-16

任务：`p1-remediation-rc-01-registration-unit-of-work-2026-07-16`

## Round 1

Result: pass

从持久化事实反推边界，确认 credential、`user`、`student` 和初始 session 缺一不可；异常捕获、跨事务补偿或只合并前两段都不能在进程中断与未知提交结果下保持一致。现有 PostgreSQL transaction 足以承载五表原子写，不需要 schema。

对响应丢失的初版“按手机号和密码恢复”方案进行了攻击：它会让普通既有账号借注册接口验证密码并绕过登录失败计数，因此否决。实现后的第一次独立复核又击穿“key 与载荷共同快速摘要”方案：弱 key 会形成快速密码预言机，同 key 不同手机号也会得到不同 session id。该实现被判 `CHANGES_REQUESTED`，未进入提交。

修订方案强制 UUIDv4 key，session id 只摘要 key，事务先获取 key 级 advisory lock，再获取共享手机号锁；精确载荷通过已持久化手机号/姓名与 Better Auth 慢哈希校验。五个写点故障注入均不形成 fake commit；同 key 不同手机号、不同 key 同载荷、密码不匹配、失败计数、锁定态、替换/缺失 session 均 hard conflict。

## Round 2

Result: pass

第二轮独立只读复核结论为 `APPROVE`：UUIDv4 校验、key-only session id、key 锁先于手机号锁、慢哈希恢复、普通账号/锁定账号拒绝和 token 不轮换均成立。route 仍只把 token 写入 HttpOnly Cookie，客户端只持有 idempotency key。

残余风险：格式无法证明第三方客户端随机源质量；当前只做静态/fake transaction 并发验证，未运行真实 PostgreSQL 锁等待；具体 repository 实现仍位于 `local-session-runtime.ts`，ADR-002 目录整理留待独立 P2。三项均不削弱本任务 P1 静态关闭结论，也不得被误述为 runtime 已验收。

## Transition Disposition

Decision: APPROVE_SCOPE

F-0129 当前静态缺陷已确认。批准物化 `p1-remediation-rc-01-registration-unit-of-work-2026-07-16`，仅允许 plan 中的文件 allowlist。实现必须先取得 RED；普通既有账号不得通过注册恢复路径绕过登录失败计数，任何需要 schema/migration 的设计必须停止并请求新鲜批准。

## Final Disposition

Decision: APPROVE

F-0129 实现已通过两轮对抗复核；最终合入仍以完整 unit、静态质量门禁、治理守卫和 fresh-master build 全部通过为前提。
