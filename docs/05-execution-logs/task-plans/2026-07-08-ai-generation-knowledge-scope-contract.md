# AI Generation Knowledge Scope Contract Task Plan

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
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/validators/personal-ai-generation-request.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- targeted tests listed in task queue.

## Branch Scope

只处理矩阵行 `ai-generation-knowledge-scope-contract-2026-07-08`：

- 在 route-integrated AI generation parameters 中增加结构化知识点范围字段。
- 增加共享 normalizer，并让个人端与后台端请求解析复用。
- 保持旧 `knowledgeNode` 文本字段兼容，后续 UI 分支再接入选择控件。
- 不执行 Provider，不改授权/edition 语义，不改 DB/schema/migration/seed/fixture/package/lockfile。

## Implementation Plan

1. 给 personal validator 增加测试：结构化知识点范围会被保留；非法 public id 会拒绝。
2. 给 admin local contract route 增加测试：后台请求保留结构化知识点范围并拒绝非法 public id。
3. 在 shared contract 中定义 `knowledgeNodeMode`、`knowledgeNodePublicIds`、`includeDescendants`、`knowledgeNodeSupplement`、`sourcePreference`。
4. 在 personal/admin normalizer 中复用 shared normalizer。
5. 补齐默认 generation parameters，保持现有 UI 行为不变。
6. 运行 targeted tests、lint、typecheck、Module Run v2 gates。

## Risk Controls

- 权限：不改登录、角色、授权、edition 判定。
- Provider：不执行 Provider-enabled 调用。
- 数据：不连接 DB、不读 env、不改 schema/migration/seed/fixture。
- 兼容：保留 `knowledgeNode` 字段，避免后续 UI 分支前破坏现有请求。

## Validation Commands

- `npm.cmd exec -- vitest run src/server/validators/personal-ai-generation-request.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/route-integrated-provider-execution-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-knowledge-scope-contract-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-knowledge-scope-contract-2026-07-08 -SkipRemoteAheadCheck`
