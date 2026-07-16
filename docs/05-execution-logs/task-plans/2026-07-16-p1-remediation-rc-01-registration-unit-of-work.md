# P1 RC-01 个人注册工作单元整改方案

日期：2026-07-16

任务：`p1-remediation-rc-01-registration-unit-of-work-2026-07-16`

分支：`codex/p1-rc01-registration-unit-of-work`

工作树：`D:/tiku/.worktrees/p1-rc01-registration-unit-of-work`

## 目标

关闭 F-0129 的静态失效模式：一次个人注册必须以一个数据库事务原子提交 `auth_user`、`auth_account`、`user`、`student` 和初始 `auth_session`；任一写点失败时不得留下部分身份。请求在提交后丢失响应时，携带同一 `Idempotency-Key` 和同一注册载荷的重试必须恢复同一初始 session，而不是创建重复身份或返回不可解释的冲突。

本任务不修改 schema、migration、依赖、登录锁定策略、授权/edition 计算，也不处理员工创建工作单元或其他 P1 finding。

## 已读取规范与权威来源

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/` 全部 ADR；身份、服务边界与版本授权重点复核 ADR-002、ADR-007
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md` 的 US-01-01 历史行
- `docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-01-jit-revalidation.md`
- `D:/tiku-readonly-audit/findings/finding-register.yaml` 中 F-0129 原始记录
- `D:/tiku-readonly-audit/catalog/roles/personal-standard-student.yaml` 的 UC-PSTD-001
- `D:/tiku-readonly-audit/catalog/roles/personal-advanced-student.yaml` 的 UC-PADV-001
- `D:/tiku-readonly-audit/catalog/shared-capability-catalog.yaml` 的 SC-ATOMICITY-IDEMPOTENCY

## 第一性原理与当前失效路径

注册成功的最小持久事实不是单张 `user` 行，而是一组必须共同成立的身份事实：密码凭据可验证、业务用户与学员身份存在、初始 session 可恢复。当前 service 先后调用三个适配器，默认 runtime 分别开启三个事务；因此后续失败无法回滚先前提交。

仅把 credential 与 user 合并仍会留下“账号已创建但初始 session 失败”；仅捕获异常并删除补偿又会在进程中断和未知提交结果下失效。正确边界是一个数据库事务包含五张表的全部写入，并在 F-0001 已建立的共享手机号锁后完成冲突检查。

原子提交仍不能单独解决“提交成功、HTTP 响应丢失”。本任务要求客户端为一次表单尝试生成并在重试时复用 `Idempotency-Key`；服务端把 key 与规范化注册载荷摘要映射为初始 session 内部 id。只有该内部 id、手机号、个人用户、学员关联和仍有效的初始 session 全部对应时才恢复同一 session。普通重复注册、不同 key、不同载荷、已替换/过期 session、锁定或停用账号继续返回 `409001`，不得把注册接口变成绕过登录失败计数的替代登录入口。

## 实现方案

1. 将 `UserRegistrationRepository` 收敛为单一 `createPersonalRegistration` 工作单元，输入包含规范化注册载荷、idempotency key、注册时间和初始 session 到期时间；返回 `created | recovered | conflict`。
2. 默认 PostgreSQL repository 在一个 `database.transaction` 内获取共享手机号锁、检查 `admin`/`user`，依次写入 credential、`user`/`student` 与 session；所有时间戳使用同一注册时刻。
3. 初始 session id 由 `Idempotency-Key` 和规范化载荷的单向摘要派生。相同重试只读回该 session；不得删除或轮换 session，也不得返回另一次登录创建的 session。
4. service 只调用一次工作单元，不再编排 credential、业务用户和 session 三段副作用；现有成功 envelope、`409001` 与 Cookie token 隔离保持不变。
5. route 从 `Idempotency-Key` header 传入 service；注册页在输入不变的网络/服务失败重试中复用同一 key，任一表单字段变化即生成新 key。
6. 增加结构守卫与故障注入测试：五个写点任一失败均不形成 fake transaction commit；提交后响应丢失的相同重试恢复同一 session；非匹配重试 hard conflict。

## TDD 与对抗式验证

### RED

- service 源码不得再出现 `createPasswordCredential`、`createPersonalUser`、`createSingleActiveSession` 三段编排。
- credential、`user`/`student` 或 session 任一点失败时，事务外 committed write 集合必须为空。
- 同一 key/载荷在首次提交结果丢失后重试，必须返回同一 session token 且不新增写入。
- 不同 key、不同载荷、普通既有账号、非初始 session、锁定/停用账号必须保持 `409001`。
- 注册页网络失败后的原样重试必须复用 `Idempotency-Key`；修改字段后必须换 key。

### GREEN

- 用最小单事务 repository 与现有 session 表内部 id 完成原子性和窄恢复语义。
- 不新增 schema、migration、依赖或外部可见自增主键。
- 定向通过后执行完整 unit、lint、typecheck、format、build 与治理门禁。

### Round 1

攻击每个写点故障、锁后冲突、相同/不同 key 并发、响应丢失、session 已替换/过期及普通账号重放。

### Round 2

独立复核单事务边界、恢复授权条件、token/Cookie 边界、登录锁定绕过、F-0001 不变量、API 字段命名和越界范围。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-16-p1-remediation-rc-01-registration-unit-of-work.md`
- `docs/05-execution-logs/evidence/2026-07-16-p1-remediation-rc-01-registration-unit-of-work.md`
- `docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-rc-01-registration-unit-of-work.md`
- `src/server/repositories/user-registration-repository.ts`
- `src/server/services/user-registration-service.ts`
- `src/server/services/user-registration-service.test.ts`
- `src/server/auth/user-registration-boundary.ts`
- `src/server/auth/user-registration-route.ts`
- `src/server/auth/user-registration-route.test.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/auth/local-session-runtime.test.ts`
- `src/server/validators/user-registration.ts`
- `src/server/validators/user-registration.test.ts`
- `src/app/(auth)/register/page.tsx`
- `tests/unit/student-register-ui.test.ts`
- `tests/unit/p1-registration-unit-of-work-guard.test.ts`

## 禁止范围

- `AGENTS.md`、依赖清单、lockfile、schema、migration、seed、E2E 与环境配置。
- 数据库执行、runtime/browser acceptance、Provider、P2、员工创建工作单元、登录失败计数策略、授权/edition、PR、force push 与部署。
- 修改只读审计仓库 `D:/tiku-readonly-audit`。

## 风险与停止条件

- 若 session 内部 id 无法安全承载窄 idempotency 恢复，或必须新增持久表/字段，停止并请求 schema/migration 新鲜批准。
- 若恢复路径需要对普通既有账号验证密码而形成免计数登录旁路，停止；不得以关闭响应丢失为由削弱锁定策略。
- 若 F-0001 writer guard、共享手机号锁或现有 route Cookie 隔离被破坏，停止并回退设计。
- 若外部客户端无法提供 `Idempotency-Key` 且必须改变兼容策略，先记录冲突并请求用户决策。

## 完成条件

- F-0129 的五表持久副作用只有一个事务提交点，任一失败不留下部分身份。
- 相同 idempotency key/载荷可恢复同一仍有效的初始 session；非匹配重放不获得 session。
- API 成功/冲突 envelope、Cookie token 隔离、F-0001 手机号锁与标准/高级版共同账号入口保持稳定。
- 定向与完整本地门禁、两轮对抗复核、evidence/audit、独立提交、ff-only 合入、普通 push 和隔离资源清理完成。
- 不声称真实 PostgreSQL 故障注入、runtime acceptance、P2、发布就绪或 Cost Calibration 完成。
