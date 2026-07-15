# P0 RC-01 身份、session 与后台账号生命周期整改计划

日期：2026-07-14

任务：`p0-remediation-rc-01-identity-session-admin-account-2026-07-14`

状态：`ready_for_closeout`

分支：`codex/p0-rc-01-identity-session-admin-account`

基线：`071d4ecd23ac0ec94bf3ca506d1e61b4c5fa5ac5`

## Goal

以一个内聚根因簇关闭 F-0002、F-0045、F-0130 的静态缺陷：把登录锁定和后台账号生命周期从进程内、单值角色、分散写入改为数据库可强制的持久原子状态机；提供受权的后台账号多角色、单组织绑定、停用/启用、密码重置、session 撤销与脱敏审计闭环。

本任务只作静态整改和本地非数据库验证，不执行 RV-0006、RV-0010、RV-0016、RV-0019、RV-0021。

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` 至 `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/01-requirements/traceability/2026-06-29-security-db-schema-migration-risk-inventory.md`
- `docs/01-requirements/traceability/2026-06-29-security-db-migration-policy-reconciliation.md`
- `docs/01-requirements/traceability/2026-06-29-security-db-migration-command-guard-implementation.md`
- 仓库外只读设计板 `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/` 四个脱敏文件

## Requirement Decision Map

| 决策           | 当前口径                                                      | 本任务约束                                                             |
| -------------- | ------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 学员/员工锁定  | 连续失败 3 次锁 5 分钟；只阻止新登录                          | 数据库原子递增、过期重启、成功清零；既有 session 不撤销                |
| 后台锁定       | 连续失败 5 次锁 15 分钟；允许多设备                           | 持久化到 admin 域；跨实例共享；不使用进程 Map                          |
| 后台角色       | 一个后台账号可有多个角色                                      | 角色赋权使用独立持久关系；API/UI 使用 `adminRoles` 数组                |
| 组织管理员     | 一个账号首期绑定一个 `organization`                           | 数据库唯一约束；无 org 角色时不得残留绑定；有 org 角色时必须绑定       |
| 管理权         | `super_admin` 管平台/组织后台账号；`ops_admin` 只管组织管理员 | 服务端按目标现有和目标角色双重校验，低角色不能借更新提升权限           |
| 生命周期       | 支持角色/组织变更、停用/启用、重置密码                        | 权威 admin 写路径，不复用只操作 user 表的接口；受影响 session 立即撤销 |
| 超级管理员保护 | 不得失去最后一个可用 `super_admin`                            | 角色移除/停用使用事务内保护；并发请求只能有一个成功                    |
| UI             | 运营页按账号家族分区，危险动作说明影响                        | 保持摘要优先、确认、禁用原因、一次性密码分发和安全 public id           |

对应稳定行：`CT-REQ-009`、`CT-REQ-010`、`CT-REQ-011`、`CT-REQ-032`、`CT-REQ-046`、`CT-REQ-050`、`CT-REQ-051`、`CT-REQ-054`、`CT-REQ-056`；UI 基线 `UX-REQ-08`、Batch 0 四层结构、Batch 1 “User Operations Must Separate Account Families And Risky Actions”。

## Requirement Mapping

| Finding | 业务不变量                                                               | 静态修复边界                                                          | 运行时入口                                |
| ------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------- | ----------------------------------------- |
| F-0002  | 五次失败在任意实例/重启后仍形成十五分钟后台锁定                          | admin 锁定字段、原子 repository transition、默认 runtime 读取持久状态 | RV-0006、RV-0019（本任务不执行）          |
| F-0045  | 后台账号可多角色、唯一组织绑定、受权变更、停启、重置、撤销 session、审计 | admin 角色关系、生命周期 command/API/UI、最后 super 保护、CAS/事务    | RV-0010、RV-0016、RV-0019（本任务不执行） |
| F-0130  | 并发失败不丢计数，成功/失败交错有数据库线性化结果                        | user/admin 共用原子失败 transition，service 以返回状态决定响应        | RV-0021（本任务不执行）                   |

关联角色：`personal_standard_student`、`personal_advanced_student`、`org_standard_employee`、`org_advanced_employee`、`super_admin`、`ops_admin`、`content_admin`、`org_standard_admin`、`org_advanced_admin`。

P1/P2 仅保留影响映射：F-0001、F-0030、F-0041、F-0046、F-0047、F-0048、F-0049、F-0106、F-0129、F-0131；不在本任务顺手整改。

## Evidence-Only Sources

- `D:/tiku-readonly-audit/findings/finding-register.yaml` 中 F-0002、F-0045、F-0130 原始记录
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`
- `docs/05-execution-logs/evidence/2026-07-14-p0-remediation-serial-program-bootstrap.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-serial-program-bootstrap.md`

上述文件只作审计/历史证据，不替代需求 SSOT，不修改只读审计仓库。

## Conflict Check

- `modules/06-admin-ops.md`、Epic 06、D18/D21、CT-REQ-032/046 对多角色、管理权、停启、重置和 session 撤销一致。
- `ops_admin` 管理组织管理员的边界已由现有创建权限和 CT-REQ-010/054 收敛：只允许目标现有与目标角色均为组织管理员；不能管理平台角色。
- 多角色与“组织管理员一个组织”可并存：账号只要含组织管理员角色就必须且只能有一个组织绑定。
- UI 基线已给出账号家族、风险动作和影响说明，不需要在本实现任务发明新的产品流程。
- 未发现无法由时间序、SSOT 或最新 traceability 消解的需求冲突。`conflictsFound: false`。

## First-Principles Root Cause

认证安全和权限撤销必须在所有实例共享且可串行化的数据源上成立。当前服务把快照计数加一后盲写，admin 又退化为进程 Map；后台账号授权则把“账号”与“一个角色值”混为一体，创建后没有权威 command。根因不是缺几个按钮，而是缺失数据库强制的状态与关系，以及围绕这些状态的事务 command。

## Planned Data Contract（fresh approval 已取得）

仅采用无依赖、前向兼容的加法迁移：

1. `admin` 增加 `login_failed_count`、`locked_until_at`、`disabled_at`。
2. 新增 `admin_role_assignment`，唯一键 `(admin_id, admin_role)`；迁移将现有 `admin.admin_role` 回填为一条 assignment。旧单值列暂作兼容标记，不作为运行时授权 SSOT，避免当前包执行破坏性删除。
3. `admin_organization.admin_id` 增加唯一索引，强制一个后台账号最多一个组织；若现存数据违反约束，未来迁移 apply 必须失败并进入单独数据治理，禁止静默选第一行。
4. 生成 Drizzle migration、snapshot、journal；本任务不 apply migration、不连接数据库、不读取 `.env.local`。

批准请求：`docs/05-execution-logs/acceptance/2026-07-14-p0-remediation-rc-01-schema-migration-approval-request.md`。

## Planned API And Transaction Boundary

- `GET /api/v1/admin-accounts/{publicId}`：脱敏详情。
- `PATCH /api/v1/admin-accounts/{publicId}`：名称、`adminRoles`、`organizationPublicId` 与 `expectedUpdatedAt`；事务内替换角色/组织、保护最后 super、撤销目标 session、写 audit。
- `POST /api/v1/admin-accounts/{publicId}/disable`、`/enable`：幂等状态 command；停用事务内撤销 session；保护最后 super。
- `POST /api/v1/admin-accounts/{publicId}/reset-password`：生成一次性密码，事务内更新 credential、清锁、撤销 session、写 audit；响应 `no-store`，不写日志/证据。
- 登录失败 repository 以一次数据库 UPDATE 原子递增并返回计数/锁定；service 不再基于旧快照计算新计数。

## TDD Sequence

1. RED-A：schema tests 证明 admin 锁字段、角色 assignment、单组织唯一约束缺失。
2. RED-B：session tests 证明并发失败仍读后覆盖、admin runtime 重建后锁定丢失。
3. RED-C：admin lifecycle contract/service/repository/UI tests 证明无详情、无多角色、无停启/重置/session revoke/最后 super 保护。
4. GREEN-A：批准后实现 additive schema/migration；检查生成 diff 无旁路漂移。
5. GREEN-B：实现原子 login transition 并更新默认 runtime。
6. GREEN-C：实现 admin lifecycle transaction、API、UI 与脱敏审计。
7. focused → impacted full unit → lint/typecheck/format/build/diff → 两轮复核。

schema/migration fresh approval 已于 2026-07-14 取得；现在按 RED → GREEN 顺序推进。数据库 apply、数据库连接和数据治理仍未获批。

恢复补充：批准范围内的 generation 揭示 `20260706052000_snapshot.json` 与 `20260710110500_snapshot.json` 共享同一 `id/prevId` 的历史链碰撞。用户已于 2026-07-15 批准专用请求；只修复了后一个 snapshot 的顶层 `id/prevId`，随后生成并复核本任务 migration/snapshot/journal。23 个 snapshot 的全链唯一性和线性关系已由测试与独立脚本验证。

## Precise Scope

预计产品源码/测试（批准前只读，批准后仍以 queue 精确 allowlist 为准）：

- session：`src/server/repositories/session-repository.ts`、`src/server/services/session-service.ts`、`src/server/auth/local-session-runtime.ts` 及对应测试。
- admin lifecycle：`src/server/contracts/admin-user-org-auth-ops-contract.ts`、`src/server/validators/admin-account-*.ts`、`src/server/repositories/admin-flow-runtime-repository.ts`、`src/server/services/admin-flow-runtime.ts`、admin-account API routes、`src/features/admin/admin-ops-management/AdminOpsManagement.tsx` 及对应测试。
- data：`src/db/schema/auth.ts`、schema/model/seed 适配测试、单个生成 migration/snapshot/journal（必须先批准）。
- governance：本计划、state/queue、evidence、security review、approval record。

排除：依赖、package/lockfile、数据库 apply/read/write、fixture/seed 执行、浏览器/e2e、Provider、secret/env、PR、force push、部署、P1/P2 实现、下一 RC。

## Validation Contract

- focused：schema、session、admin flow service/repository/validator/UI source-contract tests。
- adversarial：并发恰好阈值、锁定到期、成功/失败交错、两个 runtime 实例、重复 command、CAS conflict、事务中途失败回滚、空角色/重复角色、缺组织/多组织、低角色管理高角色、最后 super、目标 session 与其他主体隔离。
- contracts：camelCase、`null`/`[]`、public id、标准 envelope、`no-store`、密码/session/内部 id 不泄露。
- impacted：`npm.cmd run test:unit`、`npm.cmd run lint`、`npm.cmd run typecheck`、`npm.cmd run format:check`、`npm.cmd run build`、`git diff --check`。
- migration source：journal/snapshot/SQL 对齐、无 `drizzle-kit push`、无 apply、无 DB 连接。
- closeout：P0 Program Guard、Module Run precommit/closeout/prepush、fresh master gate。

## Two-Round Adversarial Review

### Round 1

根因与 diff：确认所有安全状态由数据库权威写路径强制；攻击进程重启、多实例、丢更新、最后 super 并发、事务中途失败、角色/组织不一致、session 撤销与审计原子性。状态：`pass`。

### Round 2

跨角色与回归：确认九角色 allow/deny、工作区选择、多角色消费者、P1/P2 语义、API/枚举、一次性密码/手机号/session 脱敏、seed/历史数据兼容和 UI 反向破坏。状态：`pass`。

未批准 Subagent；两轮由当前 Agent 以不同检查重点自对抗执行，不表述为独立审查者。

## Stop Conditions

- schema/migration/backfill authoring未取得 fresh approval；
- 需要读取 `.env.local`、连接/修改数据库或 apply migration；
- 需要新增依赖；
- 现有数据兼容只能靠静默删改或无法保护最后 super；
- 需求 SSOT 出现无法消解冲突；
- focused/full/fresh checkout 门禁失败或两轮复核仍有 P0/P1 回归。
