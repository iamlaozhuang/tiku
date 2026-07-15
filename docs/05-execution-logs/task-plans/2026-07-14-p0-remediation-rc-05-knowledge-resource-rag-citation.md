# P0 RC-05 Knowledge Resource RAG And Citation Plan

Date: 2026-07-15

Task: `p0-remediation-rc-05-knowledge-resource-rag-citation-2026-07-14`

Branch: `codex/p0-rc-05-knowledge-resource-rag-citation`

Worktree: `D:/tiku/.worktrees/p0-rc-05`

Status: `in_progress`

## Recovery Baseline

- source master/origin/live remote: `d8ea27882f98679db8f83992316cd9c6661bee3d`
- audit baseline: `D:/tiku-readonly-audit@a84224fa12ec85b28e6acd945deba2afa28c6c02`，branch `feat/calibration`，clean/read-only。
- RC-04 已完成 branch/fresh-master 全量门禁、普通 push、远端同步、worktree 与短分支清理。
- 审计 source baseline `7aac83765ca4b650b73b1612013e26a0111775ae` 到当前 baseline 的 RC-05 权威 schema/repository/service 目标文件均无变化；仅 recommendation UI 因 RC-04 编辑并发契约发生变化，不解释本簇根因。因此 F-0068/F-0075/F-0076/F-0080/F-0081/F-0084 均保持 `confirmed`。

## Mandatory Reading

已完整读取 `AGENTS.md`、品味十诫、ADR-001 至 ADR-007、`project-state.yaml`、`task-queue.yaml`、RC-04 evidence、standing authorization、schema/migration source approval、启动包、finding ledger、六个原始 finding 和 RV-0013/RV-0014 backlog。

已按 AI 基线恢复规则读取：

- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- 最新 AI generation acceptance-baseline normalization 与 goal-completion audit
- `docs/05-execution-logs/evidence/2026-07-08-ai-generation-knowledge-scope-contract-evidence.md`

已按高级版规则读取 requirements 总索引、高级版索引、edition-aware authorization requirements、ADR-007、module/story 04/05、content resource UI/UX contract 与 knowledge-node/resource closure plan。旧 AI generation 20 类问题保持 closed/superseded，本任务不无证据重开。未发现无法按来源层级或时间序消解的 SSOT 冲突。未使用 Subagent。

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-08-ai-generation-knowledge-scope-contract-evidence.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/ADR-001-monorepo-and-modular-monolith.md`
- `docs/02-architecture/adr/ADR-002-database-and-orm.md`
- `docs/02-architecture/adr/ADR-003-api-contract.md`
- `docs/02-architecture/adr/ADR-004-state-management.md`
- `docs/02-architecture/adr/ADR-005-ai-provider-abstraction.md`
- `docs/02-architecture/adr/ADR-006-testing-strategy.md`
- `docs/02-architecture/adr/ADR-007-authorization-model.md`

上述来源均已完整读取；execution logs 只用于确认 supersession 与恢复入口，不替代稳定需求 SSOT。

## Findings And First-Principles Invariants

| finding | status    | invariant                                                                                                                                                                       |
| ------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-0068  | confirmed | `knowledge_base` 是 scope truth；parent/current/base 必须在同一事务锁定并保持同 base、同 profession；跨 scope 原地移动 fail closed，数据库约束抵御竞态。                        |
| F-0075  | confirmed | 推荐成功只能来自真实可用 executor、真实 model/prompt facts 与持久 RAG evidence；字符串匹配、首节点 fallback、伪 model/prompt/citation 不得进入生产成功路径。                    |
| F-0076  | confirmed | 每个 question 当前 revision 只有一个持久任务；结果、候选、supersession、confirm/ignore 和 actor/time 都是数据库事实，重复/并发命令幂等且旧 revision 不可确认。                  |
| F-0080  | confirmed | `rag_ready` 表示一个完整且原子激活的持久 index generation；chunk、keyword facts、vector facts 与 generation 必须可追溯，keyword 和 semantic 分数不得由同一 token overlap 伪造。 |
| F-0081  | confirmed | disabled resource 的 rebuild 是稳定无副作用拒绝；重建期间旧 active generation 持续服务，失败/过期 generation 不替换它。                                                         |
| F-0084  | confirmed | `knowledge_node_resource` 是资源知识范围唯一事实；完整关联集必须同 base、同 profession、active 且事务校验，禁止 first-100 截断；子树检索从持久关系递归得出。                    |

以上 finding 保持独立验收义务；同簇不等于 duplicate、alias 或已解决。

## Implementation Boundary

1. scope：为 knowledge base/node 增加可由数据库强制的复合 scope 约束；create/move 在 repository transaction 中锁定 base/current/parent，跨 base/profession 与 self-parent fail closed。
2. resource relation：资源写路径一次接收并验证完整 node public ID 集合，再原子替换 `knowledge_node_resource`；列表/详情/检索只从该表读取，不使用 catalog、分页样本或任意字符串作为 production truth。
3. index generation：持久化 immutable generation 和 chunk；rebuild 只创建 pending generation；只有带真实独立 keyword/vector facts 的完整结果可在事务中原子激活并置 `rag_ready`；旧 active generation 在成功切换前保留。
4. retrieval/citation：production retrieval 查询 active generation、eligible resource 和持久 scope；keyword 与 semantic 分数来自不同事实，Top3 citation 携带 resource/chunk/generation/text hash；无 vector/provider 时明确降级为 `keyword_only`/unavailable，绝不伪造 semantic 或 citation。
5. recommendation：question create/update/disable 事务内 enqueue/supersede current-revision task；手动触发复用同 revision task；executor unavailable 时保持诚实状态；候选及 citation provenance 持久化；confirm/ignore 以 task/question revision CAS 和 actor 审计更新。
6. API/UI：保持 public ID、camelCase、标准 envelope、`null`/`[]`；UI 显示 pending/failed/superseded/reviewed 事实，不把本地 React state 当持久审核结果。

## Schema And Data Compatibility

- 已获批：本 Goal 内修复 P0 所必需的 schema/migration source 编写、静态测试和独立提交。
- 预计新增 resource index generation/chunk 与 knowledge recommendation task/candidate/review facts，并增加 knowledge base/node scope constraint；具体名称严格遵循 glossary 与 snake_case。
- 历史无 generation、无 relation 或 scope 矛盾的数据不伪造：新 rebuild/retrieval/recommendation fail closed 或进入明确不可用状态；migration source 不生成虚假 embedding、citation 或 recommendation。
- 本任务不连接数据库，不执行 apply/read/write、历史诊断、backfill、fixture 或 seed。

## TDD RED Matrix

- scope：跨 profession/base parent、self-parent、parent 并发漂移、base profession 漂移、非法空集合与 stale write。
- relation：超过 100 节点、跨 profession/base、disabled node、重复 ID、缺失 ID、完整替换失败回滚、子树移动后检索。
- generation：disabled 九状态矩阵、重复 rebuild、并发 rebuild、partial chunk failure、维度/内容 hash 不一致、激活失败回滚、旧 generation retention。
- retrieval：keyword/vector 独立来源、无 vector keyword-only、无证据 none、Top3、跨 profession/level/unauthorized resource、disabled/stale/non-active generation 排除、citation hash/provenance。
- recommendation：create/update auto enqueue、同 revision manual retry、old task supersede、executor/config unavailable、1-5 candidates、非法 node/citation、confirm/ignore 幂等、stale revision 与并发 review。
- API/UI：pending/failed/superseded/reviewed 枚举、标准 envelope、null/[]、public ID、无 numeric ID/raw prompt/provider payload/fake citation。

## Validation

- focused unit/integration/contract tests and migration-source guard。
- `git diff --check`、P0 serial guard、Module Run pre-commit/closeout/pre-push。
- full unit、lint、typecheck、format:check、build；合入后 detached fresh-master 复跑必要全量门禁。
- 两轮当前 Agent 自对抗复核：第一轮聚焦 authority、transaction/lock/idempotency、schema/data compatibility 与越权；第二轮聚焦跨角色状态交接、API/enum/citation、P1/P2 影响和反向回归。未获批 Subagent，不声称独立审查者。

## P1/P2 Impact Mapping Only

- potentially covered：F-0069、F-0070、F-0071、F-0088、F-0029、F-0040、F-0032、F-0035、F-0085、F-0031、F-0089、F-0037、F-0082、F-0086、F-0087。
- semantic change：F-0083（resource 双 source 行为将因数据库 fact authority 改变）。
- 以上全部保留到 P0 后重新复验；本任务不提前关闭、降级或顺手修复 P1/P2。

## Explicit Exclusions

- 不执行 database apply/read/write、fixture/seed/backfill、runtime/browser/e2e、真实 embedding/vector Provider、AI Provider 或 21 项 runtime validation。
- 不新增/升级依赖，不改 package/lockfile、env/secret、外部配置；不创建 PR、不 force push、不部署。
- 不修改 `D:/tiku-readonly-audit` 或原始 finding 状态；不实施 RC-06 AI config/provider lifecycle、RC-07、RC-08 或 P1/P2。

## Stop Conditions

- 必须调用真实 Provider、连接数据库、修改依赖/外部配置，或 SSOT 冲突无法消解。
- schema 无法在不伪造历史业务事实的前提下兼容，或静态修复无法形成独立可审查提交。
- 两轮复核仍有 P0/P1 反向破坏，full/fresh-master 门禁失败，或远端/审计基线出现未解释漂移。
