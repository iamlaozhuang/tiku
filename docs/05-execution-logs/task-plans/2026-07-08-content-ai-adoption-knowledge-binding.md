# Content AI Adoption Knowledge Binding Task Plan

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- `src/lib/admin-ai-generation-formal-draft-payload.ts`
- `src/server/services/admin-ai-generation-formal-draft-adapter.ts`
- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- targeted tests listed in task queue.

## Branch Scope

只处理矩阵行 `content-ai-adoption-knowledge-binding-2026-07-08`：

- 内容后台 AI 出题 reviewed draft payload 必须携带已提交的结构化 `knowledgeNodePublicIds`。
- formal draft adapter 已保留 reviewedDraft 中的知识点数组，本分支补 payload 生成源和单元覆盖。
- 不改 DB repository、question schema、migration、seed、fixture、Provider、auth/edition 语义或组织草稿写入语义。

## Implementation Plan

1. 给 `createContentAdminFormalReviewedDraftPayload` 增加测试：结构化知识点 public id 会进入 formal question reviewed draft。
2. 最小实现：`createFormalQuestionDraftPayload` 使用 `generationParameters.knowledgeNodePublicIds`，空范围保持空数组。
3. 复跑 formal draft payload 与 adapter targeted tests，确认写入前仍脱敏且不改变 paper adoption。
4. 运行 lint、typecheck、diff check、Module Run v2 gates。
5. 写脱敏 evidence/audit，提交、合入 master、master 门禁、推送并清理短分支。

## Risk Controls

- 权限：不改变 content admin / org admin / standard / advanced 判定。
- 闭环：content admin 仍只写平台 formal draft；组织后台草稿采纳不在本分支写平台正式内容。
- 数据：不连接 DB、不读 rawfiles、不改 schema/migration/seed/fixture。
- Provider：不执行 Provider，不记录 Provider payload、raw prompt 或 raw output。
- 证据：只记录路径、命令和脱敏结论。

## Validation Commands

- `npm.cmd exec -- vitest run src/lib/admin-ai-generation-formal-draft-payload.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-adoption-knowledge-binding-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-adoption-knowledge-binding-2026-07-08 -SkipRemoteAheadCheck`
