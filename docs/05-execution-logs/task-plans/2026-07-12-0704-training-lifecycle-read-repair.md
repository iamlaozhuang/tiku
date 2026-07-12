# 0704 企业训练生命周期读取修复方案

## 任务信息

- taskId：`0704-training-lifecycle-read-repair-2026-07-11`
- 批次：B1B / A02、A03
- 分支：`codex/0704-training-lifecycle-read-repair`
- 基线：`677c2689d9daa4ff5a748a3b24c4d48285e77e61`
- 目标：在持久化读取边界隔离不完整历史版本行，保证管理端和员工端仅消费可验证的企业训练版本，不推断发布范围。

## 已读取约束

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`，含 ADR-007
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/2026-06-21-enterprise-training-path-closure-plan.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-06-29-repair-organization-training-capability-source-boundary.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-organization-training-analytics-ai-generation-role-flow.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/task-plans/2026-07-11-0704-acceptance-remediation-ledger.md`

## 根因与边界

- 仓储网关把数据库结果强制断言为完整 `OrganizationTrainingVersionRow`，列表路径随后直接复制发布范围并调用日期 `toISOString()`；历史缺失或损坏字段会让整个列表抛错。
- 管理端生命周期列表和员工可见列表复用该不安全映射，因此一条异常历史行会放大为整页 500。
- 修复必须在持久化读取边界校验完整性；异常行只能隔离，禁止补默认组织、发布范围、发布时间、状态或授权上下文。
- 管理端返回脱敏的完整性状态和固定告警码，为 B3/A04 禁用创建入口提供合同；不得返回异常行内容、内部 ID 或字段明细。
- 员工端只能得到当前组织授权范围内且完整、已发布、可作答的版本；异常行不得进入可见列表或 AI 本地题源。
- Provider、env/secret、直接数据库、schema/migration/seed、依赖、staging/production/deploy 和 Cost Calibration 均禁止。

## TDD 步骤

1. 在 mapper/repository 测试中构造缺失发布范围和发布时间的历史行，确认当前管理端与员工端路径出现预期 RED。
2. 新增持久化行安全解析结果，逐项验证 DTO 必需字段和不可伪造的发布范围；保持既有严格 mapper 用于已验证行。
3. 列表读取仅映射有效行，并返回 `complete` / `partial` 完整性状态及固定脱敏告警码；员工题源路径同样排除异常版本。
4. 路由合同透传完整性状态，验证响应中不包含异常内容、内部 ID、授权血缘或原始快照。
5. 运行 focused tests、B0+B1A 累计回归、全量 unit、lint、typecheck、format check、diff check 与 Module Run v2。
6. 写脱敏 evidence/audit，提交、`--ff-only` 合入本地 `master`，合入后复核并安全清理 worktree；禁止 push。

## 验收标准

- 合法草稿和版本继续显示，单条不完整历史版本不会导致管理端列表 500。
- 管理端版本读取结果标记 `partial` 并只返回固定脱敏告警码，不返回异常行字段、内部 ID 或原始内容。
- 不完整版本不进入员工可见列表、员工本地题源或组织管理员本地题源。
- 解析器不生成默认发布范围、发布时间、组织、授权、状态或题目快照。
- 完整版本保持原有排序、分页、详情、发布/下架/复制语义；标准版/高级版和组织范围守卫不变。

## 允许文件

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-12-0704-training-lifecycle-read-repair.md`
- `docs/05-execution-logs/evidence/2026-07-12-0704-training-lifecycle-read-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-0704-training-lifecycle-read-repair-audit.md`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/mappers/organization-training-mapper.ts`
- `src/server/mappers/organization-training-mapper.test.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
