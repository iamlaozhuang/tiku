# P0 RC-04 Content And Paper Aggregate Snapshot Plan

Date: 2026-07-15

Task: `p0-remediation-rc-04-content-paper-aggregate-snapshot-2026-07-14`

Branch: `codex/p0-rc-04-content-paper-aggregate-snapshot`

Worktree: `D:/tiku/.worktrees/p0-rc-04`

Status: `implementation_complete_pending_closeout`

## Recovery Baseline

- source master/origin/live remote: `4d1d011d4a6c1fa63d2f2e547b0e4f9cda42af65`
- audit baseline: `D:/tiku-readonly-audit@a84224fa12ec85b28e6acd945deba2afa28c6c02`，只读且干净。
- RC-03 已完成 fresh-master 全量门禁、普通 push、远端同步、worktree 与短分支清理。
- 审计 baseline `7aac83765ca4b650b73b1612013e26a0111775ae` 到当前 master 的 RC-04 目标文件差异仅涉及 `student-flow-runtime-repository.ts` 的 employee authorization scope 查询；`buildPaperSnapshot`、practice/mock start 和 RC-04 证据行未变化。因此 F-0050/F-0051/F-0092/F-0093/F-0171 均保持 `confirmed`，不是无依据重开全审计。

## Mandatory Reading

已完整读取 `AGENTS.md`、品味十诫、ADR-001 至 ADR-007、`project-state.yaml`、`task-queue.yaml`、RC-03 evidence、串行 standing authorization、schema/migration source approval、启动包与 finding ledger。

已读取当前 RC 的 SSOT 与证据：

- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- F-0050/F-0051/F-0092/F-0093/F-0171 原始 finding 与 RV-0011/RV-0012/RV-0015/RV-0021 backlog。
- question/material 编辑器、共享 content integrity、validator/service/repository、paper contract/validator/service/repository/schema/composer、student snapshot/start repository、mock scoring consumer 及对应测试。

未发现无法按来源层级或时间序消解的需求冲突。未使用 Subagent。

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/traceability/2026-06-21-paper-question-count-and-type-policy.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/02-architecture/adr/ADR-001-monorepo-and-modular-monolith.md`
- `docs/02-architecture/adr/ADR-002-database-and-orm.md`
- `docs/02-architecture/adr/ADR-003-api-contract.md`
- `docs/02-architecture/adr/ADR-004-state-management.md`
- `docs/02-architecture/adr/ADR-005-ai-provider-abstraction.md`
- `docs/02-architecture/adr/ADR-006-testing-strategy.md`
- `docs/02-architecture/adr/ADR-007-authorization-model.md`

上述 SSOT 均已完整读取；授权需求仅用于校准跨角色访问与 organization 边界，本任务不改变 authorization 数据模型。

## Findings And First-Principles Invariants

| finding | status    | invariant                                                                                                                                                 |
| ------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F-0050  | confirmed | 编辑器必须无损承载受支持的安全 HTML；修改无关字段不得剥离内容；陈旧写不能覆盖新版本。                                                                     |
| F-0051  | confirmed | 每个 `question_type` 只能进入唯一合法评分路径：客观题 `auto_match`，主观题 `ai_scoring`，仅 `fill_blank` 可二选一；`multi_choice_rule` 仅多选题可非默认。 |
| F-0092  | confirmed | paper 是带 revision 的聚合根；草稿写、发布、下架与开考必须以数据库可原子强制的状态条件串行化；重复命令不得重复副作用。                                    |
| F-0093  | confirmed | `question_group` 以稳定 public ID 标识而非 `sort_order`；组 material 必须等于子题真实 material；同材料多组必须显式创建。                                  |
| F-0171  | confirmed | published learner snapshot 必须一等复制每个 paper scoring point 的稳定 public ID、描述、分值和顺序；缺失或合计错误 fail closed，禁止伪造 overall。        |

## Implementation Boundary

1. 富文本：编辑表单加载保留原始 rich text；题目/材料更新携带 `expectedUpdatedAt`，repository 以 public ID、未锁定状态和版本条件写入，冲突返回稳定 409。
2. 题型联合合同：共享纯函数统一 UI、server validator、paper publish 与 mock/practice snapshot 消费者；修正题型切换默认，补七型正反矩阵。
3. paper aggregate：新增单调 `revision`；所有草稿子写、发布、下架、删除和复制以 expected revision/status 条件写；删除与小计重算同事务；每次 aggregate mutation 更新 revision。
4. 幂等：为 create/copy/add/publish 建立持久 `paper_command`，以 command public ID、actor、kind 和 request hash 防止响应丢失重试产生重复对象或副作用。
5. group identity：`question_group.public_id` 一等持久化并进入 DTO；加入既有组按 public ID，创建新组显式生成新 public ID；repository 对账 paper、section、material 与 source question。
6. published snapshot：`paper_scoring_point.public_id` 一等持久化；学员 snapshot 批量加载 scoring points 与 group lineage；评分消费者拒绝缺失/重复/未知/合计错误规则。
7. 开考互锁：practice/mock create 在事务内锁定并重新确认 paper 仍 `published`，与 archive 的状态更新和终止扫描形成同一行锁顺序。

## Schema And Data Compatibility

- 已获批：schema/migration source 编写、生成、静态测试和独立提交。
- 预计新增 `paper.revision`、`question_group.public_id`、`paper_scoring_point.public_id` 与 `paper_command`。
- migration source 为历史 group/scoring point 生成不可推导内部自增 ID 的随机 public ID；历史 paper revision 初始化为 1。
- 历史非法题型组合、缺 scoring point snapshot 或矛盾 group 不伪造业务事实：新写/新发布/新开考 fail closed；本任务不连接数据库，不执行历史数据诊断或回填。

## TDD RED Matrix

- rich text：题目/材料格式、表格、受管图片、纯图片及无关字段编辑 round-trip；陈旧 `expectedUpdatedAt` 409 且无写入。
- scoring：七题型合法矩阵与反向组合；objective+AI、subjective+auto、非多选 partial rule 均 RED。
- aggregate：两个相同 revision 的并发写仅一个成功；第 100/101 题交错；发布与 add/update/remove 交错；删除子写失败全回滚；相同 command 重试单一结果；同 key 不同 payload 冲突。
- group：同材料两题复用显式 group；显式新 group 可并存；错 material、跨 paper/section group、并发加入拒绝。
- snapshot：卷内调整 scoring point 全量进入 learner snapshot；copy 保留规则；缺失、重复、合计错误拒绝；mock 不生成 overall fallback。
- start/archive：两种锁顺序均保证 archived 后无新 in-progress，先开始的记录被同一 archive 事务终止。

## Validation

- focused unit/integration/contract tests and migration-source guard。
- `git diff --check`
- P0 serial guard、Module Run pre-commit/closeout/pre-push。
- full unit、lint、typecheck、format:check、build。
- 合入后 detached fresh-master 复跑全量必要门禁。
- 两轮自对抗复核：第一轮聚焦 aggregate authority、CAS、事务/幂等、schema 兼容与 XSS；第二轮聚焦跨角色 snapshot 消费、API/枚举、P1/P2 语义影响和反向回归。未批准 Subagent，不声称独立审查者。

## P1/P2 Impact Mapping Only

- potentially covered：F-0024、F-0052、F-0053、F-0055、F-0056、F-0058、F-0074、F-0094、F-0095、F-0096、F-0098、F-0100、F-0155。
- semantic change：F-0057、F-0073。
- 以上全部保留到 P0 后重基线；本任务不提前修复、关闭或降级 P1/P2。

## Explicit Exclusions

- 不执行 database apply/read/write、fixture/seed、runtime/browser/e2e/Provider 或 21 项 runtime validation。
- 不改依赖、package/lockfile、env/secret、外部配置；不创建 PR、不 force push、不部署。
- 不修改 `D:/tiku-readonly-audit`，不改原始 finding 状态。
- 不处理 RC-05 及以后根因；知识关系、AI executor、answer/report 和 organization training 仅保持影响映射。

## Implementation Outcome

- F-0050、F-0051、F-0092、F-0093、F-0171 的静态整改边界已实现，finding 均保持独立且为 `confirmed`，未因同簇关系降级或合并。
- focused regression `24/24` files、`283/283` tests；full unit `385/385` files、`2274/2274` tests；lint、typecheck、format、build、diff 均通过。
- 两轮自对抗复核均通过；第一轮聚焦根因、事务、并发、幂等和安全，第二轮聚焦跨角色、状态机、API 契约与反向回归。
- schema/migration 仅完成已批准的源码、静态测试和独立提交；database、runtime、browser/e2e 与 Provider 边界保持未执行。
- 下一步仅执行 branch guards、可审查提交、ff-only 合入、fresh-master 门禁、普通 push 和隔离资源清理；这些动作全部成功前不领取 RC-05。
