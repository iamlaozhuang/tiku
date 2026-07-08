# 2026-07-08 AI 知识点选择源修复计划

## Goal

补齐个人高级版、企业高级版员工、企业高级版管理员、内容后台四类角色在 AI出题 / AI组卷 参数面板中的知识点树选择源。该分支只处理只读知识点选项入口、前端选择面板和 targeted tests，不触碰 Provider、DB 写入、授权语义、schema、fixture 或 package/lockfile。

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
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-repair-verification-and-implementation-plan.md`

## File Structure

- Create: `src/server/services/ai-generation-knowledge-node-options-route.ts`
- Create: `src/app/api/v1/ai-generation/knowledge-nodes/route.ts`
- Modify: `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- Modify: `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- Create: `tests/unit/ai-generation-knowledge-node-options-route.test.ts`
- Modify: `tests/unit/student-personal-ai-generation-ui.test.ts`
- Modify: `tests/unit/admin-ai-generation-entry-surface.test.ts`
- Create: `docs/05-execution-logs/evidence/2026-07-08-ai-knowledge-node-picker-evidence.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-08-ai-knowledge-node-picker-audit.md`

## Task Steps

- [x] Confirm short branch from latest `origin/master`.
- [x] Read branch SSOT and related source/test files.
- [x] Add failing tests for AI knowledge-node read route and cross-role UI selection.
- [x] Implement minimal read-only options route and UI wiring.
- [x] Run targeted unit tests, lint, typecheck, and diff check.
- [x] Write redacted evidence and adversarial audit.
- [x] Run Module Run v2 gates.
- [ ] Commit, fast-forward merge to `master`, run master gate, push, delete short branch, confirm clean and aligned.

## Boundaries

- 不改 DB、schema、migration、seed、fixture、Provider、env、package/lockfile。
- 不改变登录、角色、授权、`effectiveEdition` 语义。
- 只新增已登录上下文可读的脱敏知识点选项，不新增写入口。
- 只返回 public id、路径名、专业、等级、状态、推荐标记等 UI 必要字段，不暴露内部数字 id、凭证、原始资源内容、完整题目/试卷/材料或 Provider payload。
- 标准版继续按既有页面门禁禁用；高级版入口和禁用提示保持清晰。

## Requirement Mapping Result

| 来源               | 映射                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------ |
| 高级版个人 AI 需求 | 个人高级版 AI出题 / AI组卷可带结构化知识点范围；本分支补可选知识点树来源与提交参数。                                     |
| 企业 AI 训练需求   | 企业高级版员工与企业高级版管理员需要在组织授权边界内使用 AI 知识点参数；本分支只做参数面板和只读选项，不改组织授权判定。 |
| RAG / 知识库需求   | 知识点树由内容后台治理，AI 参数应引用知识点树 public id；本分支通过只读选项入口复用知识点树。                            |
| 本轮修复矩阵 G2    | 现有 UI 固定空数组导致“指定知识点”不可用；本分支核销四类角色 AI 参数面板选择源缺失。                                     |

## 品味合规自检 Checklist

- 使用现有 token 类名和页面结构，不新增硬编码颜色。
- API JSON 字段保持 camelCase。
- route 只读、脱敏、无 Provider 调用、无 DB 写入。
- targeted tests 先红后绿。
