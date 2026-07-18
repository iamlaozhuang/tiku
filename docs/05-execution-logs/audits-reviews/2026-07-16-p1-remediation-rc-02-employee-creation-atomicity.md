# P1 RC-02 员工创建原子性审查

日期：2026-07-16

任务：`p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

## Transition Disposition

Decision: APPROVE_SCOPE

批准对 F-0115 做 post-P0 即时深复检，范围严格限定为 employee credential/membership/quota 创建原子性、批量异常结果与一次性初始密码提交一致性，以及对应 service/repository/route/static tests。

旧 finding 基于凭据 adapter 与 employee repository 分属两个事务；当前 P0 anchor 已变化，因此禁止按旧证据直接实现。必须先证明当前事务所有权与可复现 residual，再选择零代码关闭或最小修复。

不得引入持久 batch command、secret recovery 表、schema/migration、真实数据库、外部分发服务、依赖、Provider、browser/e2e、其他 finding、P2、PR、force push或部署。若 response-loss 安全只能靠持久化幂等/secret recovery，必须停止并申请独立授权。

## Round 1

Result: pass

范围主审确认旧 finding 的双事务根因已被 P0 实质改变，不能重复实现 credential adapter 补偿。当前最小攻击面是同一事务内各副作用后的回滚证明，以及批量第 N 行抛异常时已提交结果是否仍可解释、未提交行是否泄露 initial password。

断链/非 JSON/重试被单列为未知结果问题：当前没有持久 batch identity 或可恢复 secret 事实，不能把“手机号已存在”误判为可安全重放，也不能重新生成不同密码冒充原结果。

## Round 2

Result: pass

transition 阶段只允许五份治理文件。产品复检开始前必须通过 P1 `transition_only` 与 Module ancestor checkpoint；该例外只适用于已通过 transition-only 的治理提交，其他 `in_progress` SHA 漂移继续 hard-block。

第二轮范围复核确认：catch 单行异常可以作为无 schema 的 bounded residual 候选，但它不能关闭响应丢失。若 TDD/独立审查确认完整 F-0115 必须持久 batch command 或 secret recovery，必须按 stop condition 请求独立授权，不得扩大本提交。

## Initial Stop-Disposition（已被 fresh approval 取代）

Decision: BLOCK_SUPERSEDED

P0 已静态关闭 credential/membership 双事务，但 F-0115 不能在当前 no-schema 边界完整关闭：batch unknown throw、audit-after-commit failure 与 HTTP response loss 均缺少持久 command/result 关联，一次性随机密码也没有安全恢复事实。两路独立只读审查结论一致。

另有可独立修复的 bounded quota residual：create/bind 必须要求当前有效 `org_auth`。但按本任务 stop condition，发现完整安全属性依赖持久 batch command/secret recovery 后不得先提交部分修复并宣称关闭。

需 fresh approval 才能启动独立设计/实现：持久 batch idempotency、可查询结果与受控一次性 secret recovery，或两阶段激活协议；这可能涉及 schema/migration。当前没有产品源码 diff，不创建实现提交，不把 ancestor checkpoint 例外扩展到其他 `in_progress` SHA。

RV-0018、真实数据库、Provider、P2、PR、force push与部署继续阻断。

## Approved Scope Supersession

用户随后批准持久 command/outcome、placeholder + versioned rotate、完整书面规格，以及 F-0115 精确 scope-correction 治理热修。治理热修以独立 transition-only 提交通过 P1/Module smoke、ff-only 合入并推送；其 ancestor checkpoint 仅适用于该已验证治理提交，其他 `in_progress` SHA 漂移继续 hard-block。

产品实现严格限定于 task queue 精确 allowlist；Drizzle 迁移仅生成源文件，未执行数据库、Provider、browser/e2e、P2、PR、force push或部署。

## Final Product Review

### Round 1

Result: pass

初审发现 cancel/current-authorization quota TOCTOU Important。修复后 `cancelOrgAuth` 整体进入 transaction，并在更新 `org_auth` 前取得与 employee create/bind/import 相同的 `lockOrganizationScopeMutation`。最终独立复核：APPROVE，0 Critical / 0 Important / 0 Minor。

### Round 2

Result: pass

初审发现 history state 覆盖与跨 session stale command anchor 两个 Important。修复后 writer 保留 Router/其他调用方 state，只维护本功能 key；session change、401/403/404 与明确关闭清理 command query，并阻止新 token 自动读取旧 command。最终独立复核：APPROVE，0 Critical / 0 Important / 0 Minor。

## Final Disposition

Decision: APPROVE

Disposition: APPROVE_STATIC_READY_FOR_PRODUCT_COMMIT

F-0115 静态产品候选满足持久 command 幂等恢复、逐行 savepoint、identity/credential/membership/current authorization quota/outcome/audit 事务归属、placeholder + versioned rotate 一次性分发，以及 session/revision/credential baseline fail-closed 设计。聚焦矩阵 21 文件 278/278、完整 unit 416 文件 2618/2618、lint/typecheck/format/build/diff check 均通过。

RV-0018 继续为明确 runtime hold：真实 PostgreSQL rollback、双连接锁竞争、SAVEPOINT、commit acknowledgment loss、迁移应用与断连未验证，不得表述为 runtime closure。
