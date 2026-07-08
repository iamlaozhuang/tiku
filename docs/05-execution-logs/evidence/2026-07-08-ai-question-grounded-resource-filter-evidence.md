# AI Question Grounded Resource Filter Evidence

## Requirement Mapping Result

- 矩阵行：`ai-question-grounded-resource-filter-2026-07-08`
- 覆盖角色：personal advanced student；organization advanced employee；organization advanced admin；content admin。
- 覆盖范围：AI 出题服务层 grounding，不跑 Provider。
- 需求映射：结构化 `knowledgeNodePublicIds` 已从 AI 出题 generation parameters 传入本地 RAG resource grounding；资源层继续按 profession、level、knowledge_node scope 过滤。
- 分支边界：AI 组卷题源选择留在已登记的 `ai-paper-knowledge-source-selection-2026-07-08` 行，不在本分支改变题源选择语义。

## Changed Files

- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-08-ai-question-grounded-resource-filter.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`

## Validation

- `npm.cmd exec -- vitest run src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`：pass，2 files，12 tests。
- `npm.cmd run lint`：pass。
- `npm.cmd run typecheck`：pass。
- `git diff --check`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-question-grounded-resource-filter-2026-07-08`：pass。
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-question-grounded-resource-filter-2026-07-08 -SkipRemoteAheadCheck`：pass。

## Redaction And Safety

- 未连接 DB，未读取或写入 DB rows。
- 未执行 Provider-enabled 调用，未记录 Provider payload、raw prompt 或 raw AI output。
- 未读取 env 值，未记录凭证、cookie、session、token、localStorage 或 Authorization header。
- 未读写 rawfiles，未记录完整题目、试卷、材料或资源正文。
- 未改 package/lockfile、schema/migration/seed/fixture。
