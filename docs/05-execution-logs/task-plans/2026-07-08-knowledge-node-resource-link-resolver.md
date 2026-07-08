# Knowledge Node Resource Link Resolver Task Plan

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
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- `src/db/owner-preview-resource-import.ts`
- `src/server/services/rag-resource-knowledge-runtime.ts`
- `tests/unit/owner-preview-resource-import.test.ts`
- `tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`

## Branch Scope

只处理矩阵行 `knowledge-node-resource-link-resolver-2026-07-08`：

- 修正 owner preview 资源导入时资源到 `knowledge_node` 的关联解析，禁止同专业第一个节点兜底。
- local RAG 检索输入增加可选知识点 public id 范围，目录资源声明关联时按范围过滤。
- 不改 schema、migration、seed、fixture、Provider、DB 运行、env、package/lockfile、浏览器。

## Implementation Plan

1. 在 `tests/unit/owner-preview-resource-import.test.ts` 增加纯函数测试：资源必须按 profession、level、subject 匹配知识点；无匹配时返回空，不做 profession-only 兜底。
2. 在 `tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts` 增加 local RAG 测试：传入 knowledge node 范围时只返回声明关联的资源；无匹配返回 none。
3. 在 `src/db/owner-preview-resource-import.ts` 暴露并使用确定性解析函数，支持一个资源关联多个可解释匹配节点。
4. 在 `src/server/services/rag-resource-knowledge-runtime.ts` 给 local catalog entry 增加可选 `knowledgeNodePublicIds` 兼容读取，并在 `buildLocalResourceRagRetrievalResult` 中按输入范围过滤。
5. 运行 targeted tests、lint、typecheck、diff check、Module Run v2 gates。

## Risk Controls

- 权限边界：不改 content admin、super_admin、ops_admin 的权限判断。
- edition 边界：本分支不改标准版/高级版判定。
- 数据边界：不连接数据库，不读取 env，不运行 import execute，不跑 Provider。
- 空态/错误态：无匹配知识点时不写关联；local RAG 指定知识点范围但没有资源时返回 none。

## Validation Commands

- `npm.cmd exec -- vitest run tests/unit/owner-preview-resource-import.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId knowledge-node-resource-link-resolver-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId knowledge-node-resource-link-resolver-2026-07-08 -SkipRemoteAheadCheck`
