# P0 RC-02 Organization Scope, Quota And Employee Lifecycle Plan

## Task identity

- taskId: `p0-remediation-rc-02-organization-scope-quota-employee-2026-07-14`
- branch: `codex/p0-rc-02-organization-scope-quota-employee`
- base: `2e529ea3d721af1511d5663bb6bcbaa5b39886fb`
- findings: `F-0005`, `F-0006`, `F-0109`, `F-0111`, `F-0113`
- WIP: 1；RC-03 在本任务完全关闭前保持 pending。

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

已完整读取或按任务相关范围读取：

- `AGENTS.md`、品味十诫、ADR-001～ADR-007。
- 需求总索引、用户授权与后台运营 module/story、高级版索引、edition-aware 授权要求、授权与额度 module/story。
- `2026-06-21-org-auth-scope-product-decision.md`、当前线程需求 ledger、ops authorization UI/UX contract、角色分离基线与本地设计板入口链。
- finding register、P0 ledger、startup package、RC-01 plan/evidence/audit、runtime backlog 的 RV-0018～RV-0021。
- 当前组织、授权、员工、session、学习、训练、门户消费者源码及既有 focused tests。

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ops-authorization-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-finding-ledger-v1.yaml`
- `docs/05-execution-logs/audits-reviews/2026-07-14-p0-remediation-startup-package-v1.md`

## Baseline revalidation

审计源基线为 `7aac83765ca4b650b73b1612013e26a0111775ae`，当前任务基线为 `2e529ea3d721af1511d5663bb6bcbaa5b39886fb`。相对审计基线，RC-02 引用路径中只有 `src/db/schema/auth.ts`、`src/server/auth/local-session-runtime.ts`、`src/server/repositories/admin-flow-runtime-repository.ts` 发生变化；逐 hunk 核对显示这些变化属于 RC-01 管理员账号/session 生命周期，没有改变组织树、员工 quota、org_auth scope 或有效授权根因。

当前分类：

| finding | revalidation     | 结论                                                                                    |
| ------- | ---------------- | --------------------------------------------------------------------------------------- |
| F-0005  | confirmed        | 所有员工激活入口仍未共享原子额度命令，有效授权仍不证明额度占用。                        |
| F-0006  | confirmed        | overlap 谓词仍错误包含 `auth_scope_type`。                                              |
| F-0109  | confirmed        | 通用 PATCH 仍允许 ops 修改 parent/tier/status，且无整树/revision 事务。                 |
| F-0111  | confirmed        | `current_and_descendants` 仍是创建时静态快照，消费者仍信任旧关联。                      |
| F-0113  | root_cause_alias | 风险独立成立，但实现根因归并到统一员工 quota/lifecycle command；不得按 duplicate 关闭。 |

## First-principles invariants

1. `auth_scope_type` 只是覆盖表达；实际 organization、profession、level、时间窗相交才定义 overlap。
2. `current_and_descendants` 的权威事实是当前无环组织树，不是创建时快照。
3. active employee 对其继承的每条有效/待生效 `org_auth` 各占一个可证明的 quota slot；没有占用证明就不得授予组织授权。
4. 新建、绑定、导入、启用、调动、解绑和停用必须复用同一数据库事务命令；失败不得留下 credential/user/employee、session、training 或 quota 半状态。
5. 资料编辑、super-only move、disable、enable 是四个不同领域命令；状态和 parent/tier 不得由通用 PATCH 覆盖。
6. 组织树 revision、scope、quota 和员工归属必须在同一锁序下验证并提交；重复或并发请求只能产生一个可解释结果。

## Design

### Schema / migration

- `organization.revision`：非空正整数，所有组织写命令使用 compare-and-set 并递增。
- `employee_org_auth`：按命名规范建立 `employee` 与 `org_auth` 的唯一关联，作为 quota reservation / eligibility proof；唯一约束 `(employee_id, org_auth_id)`。
- migration 对现存 active employee 按当前树动态覆盖回填；每个 `org_auth` 按员工创建时间及 id 稳定排序，只回填 `account_quota` 内记录，超额遗留员工 fail closed；随后重算 `used_quota`。
- migration 只编写、测试和提交，不 apply；批准证据见 `docs/05-execution-logs/acceptance/2026-07-14-p0-remediation-rc-02-schema-migration-approval.md`。

### Dynamic organization coverage

- 新建共享 SQL scope helper：`specified_nodes` 读取显式关联；`current_and_descendants` 从候选节点沿当前 parent 链受限递归到 purchaser。
- 递归携带 visited path 和最大四级保护；遗留循环 fail closed，不无限递归。
- 学员 effective authorization / practice / mock / report、mistake book、组织 admin workspace、门户、训练、运营 detail/quota/termination 全部改用同一动态谓词；员工访问还必须存在 `employee_org_auth`。

### Quota command

- 固定锁序：组织树 advisory lock → employee identity lock → 排序后的 `org_auth` quota locks → 行写入。
- 新建 credential、user、employee 与 quota reservation 在同一事务；quota 失败整体回滚。
- bind/create/import/enable/transfer 必须为目标组织覆盖的全部相关原子授权取得 slot，任一不足则全部拒绝；disable/unbind/transfer 原组织同步释放并刷新 `used_quota`。
- 调动同时撤销 session、把旧组织 in-progress training 转只读并保留历史 snapshot。
- 移除可逐行指定任意 organization 的生产兼容导入；所有导入只接受页面和请求携带的一个 target organization。

### Organization commands

- 通用 PATCH 仅允许 name/contact/remark + expectedRevision。
- 新增 `POST /api/v1/organizations/{publicId}/move`，仅 `super_admin`，输入目标 parent + expectedRevision；节点 tier 不可借 move 改写。
- move 在事务中锁树、拒绝 self/descendant、验证整棵子树最多四级、重验 overlap、重建受影响 quota reservations；任何冲突回滚。
- disable/enable 使用独立命令、expectedRevision、可选 cascade、终止副作用和幂等语义；PATCH 不得修改 status。
- UI 对 ops 隐藏 move 字段；super 使用独立 move 确认，不再通过资料 PATCH 变更结构或状态。

## Requirement Mapping Result

- `CT-REQ-004/008`：按实际有效组织范围阻断 overlap，`auth_scope_type` 不参与原子身份。
- `CT-REQ-009/011/012/051`：员工只绑定一个 target organization，导入不携带员工级授权范围。
- `CT-REQ-010`：组织管理员继续只读，平台角色才可写。
- `CT-REQ-013/014/043`：员工状态、调动、解绑联动 quota/session/training，保留历史。
- `CT-REQ-015`：move 仅 super_admin。
- `CT-REQ-041/042`：树、继承授权和 quota 结果可解释；不自动合并 overlap。
- `CT-REQ-050/054/058`：写操作平台所有，actor/phone/organization 语义保持规范。

## TDD and acceptance contract

先新增失败测试，再实现：

- 正常：create/bind/import/enable/transfer/unbind；新建下级、移入、移出动态范围；跨类型 overlap 双向阻断；资料编辑与 super move。
- 越权：ops move、组织管理员写、跨 organization 目标、旧兼容每行目标均拒绝。
- 状态：PATCH status/parent/tier 拒绝，非法 tier、self/descendant、最大深度、disabled parent、stale revision 拒绝。
- 并发/幂等：最后一个 quota slot、双创建、双启用、move vs disable、重复 import/transfer/disable。
- 失败：credential 后续失败、reservation 中途失败、session/training 更新失败、scope reconcile 失败均整体回滚。
- 边界：null、空集合、零/满 quota、没有覆盖授权、future/expired/cancelled auth、遗留循环和遗留超额。
- 契约：camelCase、标准 envelope、null/[]、公开 ID、revision、脱敏 quota 错误；前后端字段和枚举一致。
- 回归角色：super_admin、ops_admin、org_standard_admin、org_advanced_admin、org_standard_employee、org_advanced_employee。
- runtime IDs 仅关联 `RV-0018`、`RV-0019`、`RV-0020`、`RV-0021`，本任务不执行。

## P1/P2 impact map only

- 可能被根因修复覆盖：F-0004、F-0007、F-0008、F-0009、F-0012、F-0015、F-0107、F-0110、F-0112、F-0114、F-0115、F-0116、F-0117、F-0119、F-0140。
- 可能发生语义变化：F-0010、F-0017、F-0118、F-0120。
- 上述 finding 均保留原状态，RC-02 只更新影响映射；P0 冻结后重新复验，不提前整改。

## Validation gates

1. focused behavior/source/schema/contract tests and explicit RED→GREEN evidence。
2. affected unit/integration contract suites；不执行 browser/e2e、数据库或 runtime acceptance。
3. `lint`、`typecheck`、`format:check`、`build`、`git diff --check`。
4. P0 serial guard、Module Run pre-commit/closeout/pre-push。
5. Round 1：根因、权威写路径、事务/锁序、schema compatibility、越权与 diff。
6. Round 2：跨角色消费者、状态机、API/UI、P1/P2 影响和反向回归；与 Round 1 使用不同 checklist。
7. migration/schema 独立提交；业务实现、测试、evidence 为一个可审查业务提交。
8. ff-only 合入 master 后在 fresh master 重跑必要门禁，正常 push origin/master，再清理 worktree 和短分支。

## Stop conditions

- 需求 SSOT 无法按来源和时间序消解。
- 新依赖、数据库 apply/read/write、runtime/browser/Provider、PR、force push 或部署。
- schema 设计超出已批准的 revision 与 quota reservation 边界。
- focused/full regression、两轮复核或 fresh-master gate 仍存在 P0/P1 回归。
