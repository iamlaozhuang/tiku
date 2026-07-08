# Knowledge Node AI Closure Plan Evidence

## Task

- Task id: `knowledge-node-ai-closure-plan-2026-07-08`
- Branch: `codex/knowledge-node-ai-closure-plan-2026-07-08`
- Scope: docs-only requirement materialization, control matrix, redacted evidence, adversarial audit.
- Runtime exclusions: no browser, no DB connection, no DB write, no Provider execution, no env read, no product source edit.

## Requirement Mapping Result

| Requirement                                                    | Mapped artifact                                                                                        | Result   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | -------- |
| 物化知识点树与知识点文档、教材资源、题目的关系                 | `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`              | mapped   |
| 梳理四角色 AI 出题和 AI 组卷知识点参数                         | `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`              | mapped   |
| 建立可核销总控矩阵                                             | `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`             | mapped   |
| 三轮细致自检复核                                               | `docs/05-execution-logs/audits-reviews/2026-07-08-knowledge-node-ai-closure-plan-adversarial-audit.md` | mapped   |
| 不改产品源码、不碰 DB/Provider/env/package/schema/seed/fixture | `task-queue.yaml` allowed/blocked files and capabilities                                               | enforced |

## Read Evidence

已读取并用于结论的规范和需求入口：

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- AI generation traceability docs dated 2026-07-02, 2026-07-05, 2026-07-06, 2026-07-07.

本地资料只登记脱敏路径和统计结论：

- `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated\resource-pack-manifest.json`
- `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated\source-coverage.csv`
- `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated\knowledge-node-candidates.csv`
- 结论：资源包包含物流、营销、专卖相关教材、鉴定点和资源来源；知识点候选按专业有可用候选集合；本 evidence 未记录完整资源正文。

## Static Code Evidence

只记录代码符号级结论：

- `src/db/schema/ai-rag.ts`：存在 `knowledge_base`、`resource`、`knowledge_node`、`knowledge_node_resource`。
- `src/db/schema/paper.ts`：存在 `question`、`question_knowledge_node`、`paper_question`。
- `src/db/owner-preview-resource-import.ts`：当前资源和知识点关系导入存在粗粒度映射风险。
- `src/server/contracts/route-integrated-provider-execution-contract.ts`：当前 AI 参数以 `knowledgeNode` 文本字段为主。
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`：当前学员端 AI 请求未提交结构化知识点范围。
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`：当前后台端 AI 请求使用文本或覆盖模式文案承载知识点。
- `src/server/services/rag-resource-knowledge-runtime.ts`：当前资源检索未按 `knowledge_node_resource` 收窄。
- `src/server/services/ai-paper-route-source-resolution-service.ts`：当前正式题源解析未用用户选择的知识点范围预过滤。
- `src/server/services/ai-paper-plan-and-select-service.ts`：当前组卷选择需要区分空知识点范围和 exact 命中。
- `src/lib/admin-ai-generation-formal-draft-payload.ts`：当前内容 AI 出题采纳草稿未写入知识点 public id 列表。

## Created Artifacts

- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- `docs/05-execution-logs/audits-reviews/2026-07-08-knowledge-node-ai-closure-plan-adversarial-audit.md`

## Validation Results

Completed commands:

- `npm.cmd exec -- prettier --write --ignore-unknown ...`: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown ...`: pass.
- `git diff --check`: pass.
- `git diff --name-only -- AGENTS.md .env* package.json package-lock.yaml package-lock.json pnpm-lock.yaml pnpm-workspace.yaml src tests e2e src/db/schema drizzle migrations seed compose.yaml playwright-report test-results .next .runtime rawfiles`: pass, no blocked file diff.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId knowledge-node-ai-closure-plan-2026-07-08`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId knowledge-node-ai-closure-plan-2026-07-08 -SkipRemoteAheadCheck`
  : pass.

## Safety Result

- Product source changed: no.
- Tests changed: no.
- DB read/write executed: no.
- Provider call executed: no.
- Package or lockfile changed: no.
- Schema/migration/seed/fixture changed: no.
- Browser runtime executed: no.
- Staging/prod/deploy/cost calibration executed: no.
