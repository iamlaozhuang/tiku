# 2026-07-06 AI paper admin route repository wiring

## 任务

在上一包已暴露 admin/content AI组卷 `paperAssembly` 容器交接合同的基础上，把 route 默认路径接到真实 repository-backed resolver：默认使用平台正式题库 repository 和企业训练版本 repository 完成本地选题；测试仍通过注入 fake repository 验证，不执行 DB runtime。

## 已读取规范与恢复入口

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- TDD skill: `superpowers:test-driven-development`

## 范围

- 只做本地源码、单测、治理 state、脱敏 evidence、audit。
- 不执行 DB runtime、Provider、浏览器、dev server、staging/prod/deploy、Cost Calibration。
- 不新增依赖，不改 package/lockfile，不改 schema/migration/seed。
- 不改变 AI出题完整题目草稿闭环。
- 本包只接 admin/content route 的默认 repository-backed paper assembly resolver；personal/employee 和 UI/UX 另包处理。

## TDD 计划

1. RED：新增 route 单测，要求未显式传入 `paperAssemblyResolver` 时，organization advanced admin AI组卷使用注入的 question repository 和 organization training repository 组装 `paperAssembly`。
2. GREEN：route options 增加 repository 注入点；默认 resolver 调用 `resolveAndAssembleAiPaperFromRoute`；生产默认使用现有 Postgres repository 工厂，测试不触发真实 DB。
3. 回归：保留显式 `paperAssemblyResolver` 覆盖优先级；AI出题不调用组卷 resolver；rejected assembly 仍返回 409015 且不持久化。
4. 验证：focused unit、diffcheck、typecheck、lint、scoped prettier、Module Run v2 precommit hardening。

## 风险防御

- Repository wiring 不记录 DB URL、原始行、内部 id、题干、答案、解析、材料、Provider payload、raw prompt、raw AI output。
- 单测 fake repository 只返回最小脱敏结构；不连接数据库。
- 默认 Postgres repository 只在运行时 route 需要组卷时通过 lazy getter 使用；本包不执行 runtime。
