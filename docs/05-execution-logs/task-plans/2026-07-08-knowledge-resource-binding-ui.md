# 2026-07-08 资源知识点绑定 UI 修复计划

## Goal

在内容后台资源管理中补齐“教材/知识点文档/资源绑定知识点树节点”的显式入口，并把已绑定的知识点 public id 数量展示到资源列表。该分支只处理资源上传、资源 DTO/映射和 targeted tests。

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-repair-verification-and-implementation-plan.md`

## File Structure

- Modify: `src/server/contracts/admin-content-knowledge-ops-contract.ts`
- Modify: `src/server/services/admin-content-knowledge-ops-service.ts`
- Modify: `src/server/services/rag-resource-knowledge-runtime.ts`
- Modify: `src/server/repositories/rag-resource-knowledge-runtime-repository.ts`
- Modify: `src/features/admin/resource-knowledge-management/AdminResourceKnowledgeManagement.tsx`
- Modify: `tests/unit/admin-content-knowledge-ops-baseline.test.ts`
- Modify: `tests/unit/phase-9-rag-resource-knowledge-runtime.test.ts`
- Modify: `tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`
- Create: `docs/05-execution-logs/evidence/2026-07-08-knowledge-resource-binding-ui-evidence.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-08-knowledge-resource-binding-ui-audit.md`

## Task Steps

- [x] Confirm clean branch from latest `origin/master`.
- [x] Read branch SSOT and related source/test files.
- [ ] Add failing tests for resource upload FormData knowledge node public ids and list binding count.
- [ ] Implement minimal DTO, mapper, upload state, FormData, and list display changes.
- [ ] Run targeted unit tests, lint, typecheck, diff check, and Module Run v2 gates.
- [ ] Write redacted evidence and adversarial audit.
- [ ] Commit, fast-forward merge to `master`, run master gate, push, delete short branch, confirm clean and aligned.

## Boundaries

- 不改 DB、schema、migration、seed、fixture、Provider、env、package/lockfile。
- 不改变登录、角色、授权、`effectiveEdition` 语义。
- 不新增资源内容、题目内容或知识点数据。
- evidence 只记录路径、命令、状态和脱敏结论。

## Requirement Mapping Result

| 来源                   | 映射                                                                                                                    |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| RAG 资源需求           | 资源进入知识库前必须绑定专业/等级/资料类型，且知识点体系由内容后台治理；本分支补资源到知识点树的显式绑定入口。          |
| 后台运营与内容后台需求 | 内容后台是资源与 Markdown/RAG 知识库主入口；`content_admin` 与 `super_admin` 可维护资源，`ops_admin` 不获得资源写入口。 |
| 本轮修复矩阵 G1        | 服务已有 `knowledgeNodePublicIds` 解析能力，但 UI/DTO 缺失；本分支只核销 G1。                                           |

## 品味合规自检 Checklist

- 使用现有 token 类名和页面结构，不新增硬编码颜色。
- DTO 字段保持 camelCase。
- 只展示 public id 数量和可复制的 public id 文本，不暴露内部数字 id 或原始资源内容。
- targeted tests 先红后绿。
