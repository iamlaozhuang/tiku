# 2026-07-01 AI 出题 / AI 组卷 P1 核心语义修复执行方案

## 任务边界

- 任务 id：`ai-generation-p1-core-semantics-2026-07-01`
- 分支：`codex/ai-generation-p1-core-semantics`
- 范围：只修 OP-01、OP-05、OP-06 的源代码与 focused tests。
- 不执行：真实 Provider、浏览器登录/e2e、DB reset/seed/import、D 盘资源包导入、`.env*` 读取或修改、依赖/package/lockfile、schema/migration/seed、staging/prod/cloud/deploy、release readiness、final Pass、Cost Calibration。

## 已读取规范

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-core-walkthrough-contract.md`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-central-repair-approval.md`
- `docs/01-requirements/traceability/2026-07-01-ai-generation-root-cause-and-reuse-protocol.md`

## 根因假设

| Issue | 根因边界                                  | 初始判断                                                                                                                                     |
| ----- | ----------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| OP-01 | `service_business_logic`、`route_adapter` | 学员端 AI 出题 / AI 组卷请求虽有 `taskType`，但 Provider 上下文和指令仍主要依赖 `aiFuncType=explanation`，导致真实生成语义可能偏向 AI 解析。 |
| OP-05 | `api_contract`、`ui_interaction_state`    | 后台 AI 出题 / AI 组卷页面局部硬编码旧等级标签，未使用统一的 1-5 级参数合同。                                                                |
| OP-06 | `structured_parser`、`provider_adapter`   | route-integrated Provider 响应只按原文短内容展示，缺少 AI 出题数量校验、结构化草稿预览和结构化解析失败状态。                                 |

## 复用计划

- 优先复用 `src/server/contracts/*ai-generation*` 和 `src/server/services/*ai-generation*` 的现有 Provider 执行边界。
- 结构化结果合同放在现有 route-integrated Provider contract/service 中，避免给个人端、企业端、内容后台分别造语义。
- 后台和学员端只渲染共享 `visibleGeneratedContent` 的安全摘要，不读取或持久化 raw prompt、Provider payload 或 raw AI output。
- 等级合同优先从共享常量或最窄公共 helper 表达；如当前范围内没有合适公共枚举，只在本任务涉及 UI surface 内保持一致，后续再抽离到更上层 glossary-backed contract。

## TDD 步骤

1. RED：更新后台 UI focused test，证明等级不应出现旧标签，且应呈现 1-5 级。
2. RED：更新学员/Provider focused test，证明 AI 出题 / AI 组卷 Provider 上下文必须以 `taskType` 区分。
3. RED：新增或更新结构化结果测试，证明数量 10 要么得到 10 条结构化草稿摘要，要么得到明确结构化解析失败。
4. GREEN：最小修改共享 contract/service 和相关 UI。
5. REFACTOR：只做消除重复和命名收敛，不扩大范围。

## 验证命令

```powershell
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-p1-core-semantics.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-p1-core-semantics.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-p1-core-semantics.md src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts src/server/contracts/route-integrated-provider-execution-contract.ts src/server/contracts/admin-ai-generation-local-contract.ts src/server/services/route-integrated-provider-execution-service.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/contracts/admin-ai-generation-runtime-bridge-contract.ts src/server/services/admin-ai-generation-runtime-bridge-service.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/contracts/personal-ai-generation-runtime-bridge-contract.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-p1-core-semantics-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-p1-core-semantics-2026-07-01 -SkipRemoteAheadCheck
```

## 风险防御

- 不通过真实 Provider 验证语义；本任务使用 fake Provider 和结构化 contract tests。
- 不写入完整题文、试卷、教材、资源、chunk 或 AI 原文到 evidence。
- 不改 schema、seed 或 DB；数据充分性留给后续 data-backed walkthrough。
- 不把 P2 的历史混入、分页、结果位置体验问题塞进 P1。
