# P0 RC-03 显式 authorization 上下文与对象级范围校验执行方案

Date: 2026-07-15

Task: `p0-remediation-rc-03-authorization-object-scope-2026-07-14`

Branch: `codex/p0-rc-03-authorization-object-scope`

Base: `4be7cfb8e264dd0a42def6a2e744e2cc108238d9`

## 目标与边界

- WIP=1，只整改 F-0011、F-0014、F-0016，不提前整改 RC-04～RC-08 或 P1/P2。
- F-0011、F-0014 在 RC-01/02 后仍为 `confirmed`；F-0016 保持 `root_cause_alias`，独立验收义务不合并。
- 只编写业务源码、单元/契约测试和治理证据；不新增 schema/migration，不访问或修改数据库，不执行 runtime/browser/e2e/Provider，不改依赖、lockfile、env、外部配置，不创建 PR 或部署。
- 若最小正确修复被证明必须新增 schema/migration、依赖或运行时权限，立即停止在对应审批边界，不绕过。

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/` 下 ADR-001～ADR-007
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md` 中 CT-REQ-008、012、016、019、021、024、033、036、037、048、053、055
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-final-local-goal-rollup-audit.md`
- P0 serial plan、startup package、finding ledger，以及只读审计仓库中 F-0011/F-0014/F-0016 原始 finding 全文。
- 当前涉及的 effective authorization、personal/admin AI generation、organization training route/service/repository/validator/schema 与现有测试。

requirementsMapped: true

conflictsFound: false

AI 生成历史关闭基线只关闭旧的 20 类问题，不覆盖 2026-07-14 新发现的对象级 authorization scope 越权；本任务不重开被 supersede 的旧缺口，也不改变 AI组卷 plan-and-select 合同。

## Requirement Mapping Result

- F-0011 映射 enterprise training 管理员生产写链；服务端必须重验选中的 `org_auth` 与 organization、profession、level、edition 和时间窗。
- F-0014 映射 personal、employee、organization admin AI 生成；显式 authorization public id 必须与请求 scope 精确一致。
- F-0016 映射 enterprise training 员工对象级读写；每个 version lineage 必须与全部当前 advanced 原子授权上下文求交。
- 三个 finding 都保留独立验收义务；P1/P2 只记录影响映射，不提前整改。

## RC-01/02 影响重基线

- F-0011：RC-02 把训练 lineage 的 organization 覆盖改为当前动态树，但查询仍未校验目标 `org_auth` 的状态、时间窗、effective edition、profession/level；风险继续成立。
- F-0014：RC-02 让 employee effective authorization 使用动态 organization coverage 和 quota reservation，local session 也保留所选 authorization public id；个人/员工/组织管理员 AI 消费者仍未把 generation profession/level 与该 ID 对应上下文比较，风险继续成立。
- F-0016：employee effective authorization 已要求 quota reservation，但 resolver 仍先选任意 advanced context；训练列表、详情、保存、提交和只读结果仍未与 version authorization lineage/profession/level 联结，保持 `root_cause_alias`。

## 第一性原理不变量

1. 一次对象操作的授权事实必须唯一绑定 `authorizationPublicId + owner + organization + profession + level + effectiveEdition + capability + validity window`。
2. 服务端只能验证调用方显式选中的 authorization；不得为获得 advanced 能力或额度静默切换到另一来源。
3. 客户端 `capabilityContext`、`effectiveEdition`、`isAuthorizationActive`、`isScopeAllowed` 均不是授权证据。
4. 对象读取、写入和持久化前必须从权威来源重验；授权取消、到期、组织变化或 lineage 不一致时 fail closed。
5. 幂等重放只能复用同一 owner、同一 scope、同一 authorization 的原任务；不得因 key 碰撞复用其他 authorization/scope。
6. 已持久历史记录不无证据改写；静态修复不表述为 RV-0020 或业务运行时验收通过。

## 实现步骤

1. 先补 RED：共享 selector、个人/员工 AI 跨 profession/level、组织管理员会话 authorization 错配、训练无效/standard/过期/错 scope lineage、员工跨 version lineage、取消竞态和幂等 scope 混淆。
2. 建立共享对象级 scope selector/service；要求唯一上下文、精确 source ID、owner、organization、profession、level、advanced、capability 和当前有效性。
3. 个人/员工 AI route 以 `generationParameters` 校验所选 effective authorization，移除服务器提前固定 scope 通过的旁路；持久化入口保留 scope 事实并在 authoritative write 前重验。
4. 组织管理员 AI 继续使用 session 已选 authorization public id，但在请求 scope 上由服务端重新解析；不自动选择另一条匹配 authorization。
5. 企业训练 admin 写链由服务端解析真实 authorization context；manual draft、publish、copy、source attach 的 lineage 同时校验 organization、profession、level、状态、时间和 effective edition。
6. 企业训练 employee 列表按全部有效 advanced 原子上下文与 version lineage 求交；详情、保存、提交、只读结果逐对象重验，不使用任意第一条 advanced context。
7. 保持 idempotency、事务失败回滚、标准 envelope、public ID、camelCase、`null`/`[]`、脱敏与 AI 正式内容隔离合同。
8. 执行 focused tests、full unit、lint、typecheck、format、build、diff/serial/module gates；完成两轮不同重点的当前 Agent 自对抗复核。

## 两轮复核重点

- Round 1：权威写路径、selected authorization、有效期/升级、锁/事务/幂等、TOCTOU、失败回滚和历史兼容。
- Round 2：personal advanced、org advanced admin/employee 与全部 standard 角色；AI出题/AI组卷、RAG/题源、training list/detail/save/submit/result 的跨角色回归、API/枚举/脱敏和 P1/P2 语义影响。

## P1/P2 影响映射（只映射）

- potentially covered：F-0025、F-0036、F-0143、F-0146、F-0148、F-0149。
- semantic change：F-0151、F-0153、F-0154、F-0157、F-0158、F-0170。
- 以上 finding 在 RC-03 中不声明关闭；P0 完成后统一重基线。

## 风险防御

- 爆炸半径：effective authorization、个人/员工/组织管理员 AI、enterprise training、quota attribution、RAG/source selection。
- 数据兼容：不回写历史 AI task/training attribution；历史错配仅留待批准后的诊断/治理。
- 安全：拒绝跨 profession、level、organization、授权包和角色边界；错误消息不泄露授权候选或内部 ID。
- 性能：列表过滤不得产生 N+1；优先集合查询和可索引条件。
- 暂停条件：需求 SSOT 冲突、需要 schema/migration/依赖/DB/runtime/Provider 权限、focused/full regression 失败无法在本簇内解释、远端漂移或无法形成独立可审查提交。

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_rc_03_closeout

nextModuleRunCandidate: `p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14`
