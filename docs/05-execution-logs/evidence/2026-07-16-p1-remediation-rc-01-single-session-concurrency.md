# P1 RC-01 学员单会话并发关闭证据

日期：2026-07-16

任务：`p1-remediation-rc-01-single-session-concurrency-2026-07-16`

前序 checkpoint：`f237f54a420e2ceeeb9a9379fcf1a106def33e19`

transition commit：待 transition-only 提交后回填

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

Result: pending

待完成 RED/GREEN、两轮审查、完整静态回归及 fresh-master closeout 后回填。未执行真实 PostgreSQL 并发、数据库 mutation、runtime/browser acceptance 或 Provider。

Cost Calibration Gate remains blocked。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不创建并行产品任务。
