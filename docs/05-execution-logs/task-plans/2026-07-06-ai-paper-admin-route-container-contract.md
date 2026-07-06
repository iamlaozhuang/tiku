# 2026-07-06 AI paper admin route container contract

## 任务

在已完成的 AI 组卷 plan/select、本地题源 resolution、route plan assembly、route plan select wiring 基础上，把 content admin / organization advanced admin 的 route local contract 增加“AI 组卷容器交接”边界。

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
- 最新本地 evidence：AI 生成 recontract requirements materialization 及前置 AI paper 6 包 evidence

## 范围

- 只做本地源码、单测、治理 state、脱敏 evidence、audit。
- 不执行 DB runtime、Provider、浏览器、dev server、staging/prod/deploy、Cost Calibration。
- 不新增依赖，不改 package/lockfile，不改 schema/migration/seed。
- 不改变 AI 出题完整题目草稿合同。
- 本包只接 admin/content route 合同的 paper assembly 容器交接；真实 DB-backed repository 默认接线、personal/employee route、UI/UX 另包处理。

## TDD 计划

1. RED：在 `admin-ai-generation-local-contract-route.test.ts` 增加 AI 组卷 route 用例，要求 paper request 调用注入的 assembly resolver，并在返回 DTO / 持久化前 local contract 中暴露脱敏 `paperAssembly` 容器摘要。
2. GREEN：为 admin local contract DTO 增加 `paperAssembly` 字段；route 在 `generationKind=paper` 且 Provider 可见 plan 可接受后，调用 resolver 并映射为安全 DTO。
3. 反例：question request 不调用 assembly resolver；paper assembly rejected 时返回现有 409015，不落 task/result persistence。
4. 验证：focused unit、diffcheck、typecheck、lint、scoped prettier、Module Run v2 precommit hardening。

## 风险防御

- `paperAssembly` 只允许保存/返回容器结构、数量、source category、public question id 和降级统计，不包含题干、答案、解析、材料、Provider payload、raw prompt、raw AI output。
- rejected assembly 复用现有不可接受输出边界，避免把 Provider 生成题目正文带入草稿。
- 真实题库查询不在本包执行，避免隐式 DB runtime 和内部 id 泄露。
