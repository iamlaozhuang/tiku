# 2026-07-01 AI 出题 / AI 组卷 P2 历史与体验修复执行方案

## 任务边界

- 任务 id：`ai-generation-p2-history-ux-2026-07-01`
- 分支：`codex/ai-generation-p2-history-ux`
- 范围：只修 OP-02、OP-07、OP-08、OP-09 的源代码与 focused tests。
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

| Issue | 根因边界                                                         | 初始判断                                                                     |
| ----- | ---------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| OP-02 | `data_availability`、`ui_interaction_state`                      | 空库或资料不足时页面没有把缺知识点、缺题库等前置条件表达清楚，容易误导生成。 |
| OP-07 | `ui_interaction_state`                                           | 当前生成结果渲染位置与操作区距离过远，缺少提交后的近场反馈或定位锚点。       |
| OP-08 | `history_query_isolation`、`api_contract`                        | AI 出题和 AI 组卷历史缺少生成类型过滤，导致列表混入不同生成类型。            |
| OP-09 | `api_contract`、`repository_persistence`、`ui_interaction_state` | 历史查询和 UI 缺少明确分页/筛选合同，默认倒序和长列表体验不可验收。          |

## 复用计划

- 优先复用现有 `src/server/contracts/*ai-generation*` 历史合同，不新增平行的角色专用数据结构。
- 历史过滤、倒序和分页放在现有 service/repository contract 中，UI 只消费标准 `{ code, message, data, pagination }` 或本地等价 DTO。
- 后台和学员端共享相同的 `taskType` / `generationKind` 语义，避免 AI 出题与 AI 组卷分别复制查询逻辑。
- 空状态和近场结果反馈只改现有 AI generation 页面，不引入新组件库或视觉体系。

## TDD 步骤

1. RED：更新后台 UI focused test，证明提交后生成结果必须出现在操作区附近，历史列表带生成类型筛选/分页提示。
2. RED：更新学员 UI focused test，证明 AI 出题 / AI 组卷历史按任务类型分离，且空数据前置条件有明确提示。
3. RED：更新后台 route/repository focused tests，证明 `generationKind=question|paper`、`page`、`pageSize` 被解析、传递、倒序和分页。
4. RED：更新学员 route/service/repository focused tests，证明 `taskType=ai_question_generation|ai_paper_generation`、`page`、`pageSize` 被解析、传递、倒序和分页。
5. GREEN：最小修改合同、service/repository 和页面状态。
6. REFACTOR：只做去重和命名收敛，不扩大到 Provider、DB、schema 或资源导入。

## 验证命令

```powershell
npm.cmd run test:unit -- tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/student-personal-ai-generation-ui.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-request-history-service.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/server/mappers/personal-ai-generation-request-mapper.test.ts
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-01-ai-generation-p2-history-ux.md docs/05-execution-logs/evidence/2026-07-01-ai-generation-p2-history-ux.md docs/05-execution-logs/audits-reviews/2026-07-01-ai-generation-p2-history-ux.md src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/admin-ai-generation-entry-surface.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts src/server/contracts/admin-ai-generation-local-contract.ts src/server/contracts/admin-ai-generation-task-persistence-contract.ts src/server/contracts/admin-ai-generation-result-persistence-contract.ts src/server/services/admin-ai-generation-local-contract-route.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/repositories/admin-ai-generation-task-persistence-repository.ts src/server/repositories/admin-ai-generation-task-persistence-repository.test.ts src/server/repositories/admin-ai-generation-result-persistence-repository.ts src/server/repositories/admin-ai-generation-result-persistence-repository.test.ts src/server/contracts/personal-ai-generation-request-history-contract.ts src/server/contracts/personal-ai-generation-result-history-contract.ts src/server/validators/personal-ai-generation-request-history.ts src/server/validators/personal-ai-generation-result-history.ts src/server/services/personal-ai-generation-request-route.ts src/server/services/personal-ai-generation-result-route.ts src/server/services/personal-ai-generation-request-history-service.ts src/server/services/personal-ai-generation-request-history-service.test.ts src/server/services/personal-ai-generation-result-history-service.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/repositories/personal-ai-generation-request-repository.ts src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.ts src/server/repositories/personal-ai-generation-result-repository.test.ts
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-p2-history-ux-2026-07-01
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-p2-history-ux-2026-07-01 -SkipRemoteAheadCheck
```

## 风险防御

- 不连接数据库；repository 测试只用 fake/in-memory gateway。
- 不调用 Provider，不读取或配置 `.env*`，不记录 prompt、payload 或 AI 原文。
- 不记录完整题文、试卷、教材、资源、chunk、内部自增 id、账号标识或 PII。
- 不把资料导入或真实生成质量验收混入 P2；资料完备体验留给后续 data-backed walkthrough。
