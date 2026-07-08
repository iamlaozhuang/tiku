# AI Question Grounded Resource Filter Task Plan

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- `src/server/services/rag-resource-knowledge-runtime.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`
- `tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`

## Branch Scope

只处理矩阵行 `ai-question-grounded-resource-filter-2026-07-08`：

- AI 出题 grounding 必须把结构化 `knowledgeNodePublicIds` 传入本地 RAG 资源检索。
- 本地 RAG 已按专业、等级、知识点 public id 过滤，本分支只补 AI 出题调用链和服务测试。
- AI 组卷题源选择由后续 `ai-paper-knowledge-source-selection-2026-07-08` 处理，本分支不扩到 Provider 和题目生成。
- 不执行 Provider，不改授权/edition 语义，不连接或修改 DB，不读 env，不改 package/lockfile/schema/migration/seed/fixture/rawfiles。

## Implementation Plan

1. 在 owner-preview grounding 测试中加入 AI 出题知识点范围透传断言。
2. 保留 AI 组卷 grounding 现状，避免本分支越界到组卷 source selection。
3. 在 `resolveOwnerPreviewGroundingContext` 中把 AI 出题的 `generationParameters.knowledgeNodePublicIds` 传给 `buildLocalResourceRagRetrievalResult`。
4. 复跑本地 RAG scope 测试，确认资源层过滤仍覆盖 missing scope 的 none 态。
5. 运行 targeted tests、lint、typecheck、diff check、Module Run v2 precommit/prepush。
6. 写脱敏 evidence/audit，提交、合入 master、master 门禁、推送并清理短分支。

## Risk Controls

- 权限：不改变登录、角色、授权、edition 判定。
- 标准/高级版：标准版拒绝仍在上游；高级版仅把已归一化 public id scope 用于资源 grounding。
- 空态/错误态/禁用态：未匹配资源保持 `none` evidence；弱证据仍由现有 RAG evidence status 表达；不制造伪 citation。
- 数据：不连接 DB、不读 rawfiles、不写 schema/migration/seed/fixture。
- Provider：不执行 Provider-enabled 调用，不改 Provider payload、prompt 或 raw AI output。
- 证据：只记录文件路径、测试命令和脱敏结论。

## Validation Commands

- `npm.cmd exec -- vitest run src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-question-grounded-resource-filter-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-question-grounded-resource-filter-2026-07-08 -SkipRemoteAheadCheck`
