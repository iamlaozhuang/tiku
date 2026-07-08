# AI Paper Knowledge Source Selection Task Plan

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
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- `src/server/contracts/ai-paper-plan-and-select-contract.ts`
- `src/server/services/ai-paper-route-source-resolution-service.ts`
- `src/server/services/ai-paper-plan-and-select-service.ts`
- `src/server/services/ai-paper-route-assembly-service.ts`
- `src/server/services/ai-paper-source-adapter-service.ts`
- AI paper service tests listed in task queue.

## Branch Scope

只处理矩阵行 `ai-paper-knowledge-source-selection-2026-07-08`：

- AI 组卷本地选题必须消费结构化知识点范围，不能只相信 Provider 方案是否回传 public id。
- section 知识点为空时不能算 exact 命中；只能进入 same scope 补足或不足态。
- 保持个人/内容后台只用平台正式题；组织员工/管理员只可额外使用同组织已发布训练快照。
- 不执行 Provider，不改 auth/edition 语义，不连接或修改 DB，不改 package/lockfile/schema/migration/seed/fixture/rawfiles。

## Implementation Plan

1. 给 plan-and-select 增加测试：空 `knowledgeNodePublicIds` 不产生 exact 命中。
2. 给 route assembly 增加测试：Provider 方案 section 未带 public id 时，使用 generation parameters 的结构化知识点范围。
3. 最小实现：exact/nearby 必须要求非空 section scope；route assembly 对 section 和 coverage 提供 generation parameters fallback。
4. 复跑 AI paper service targeted tests、lint、typecheck、diff check、Module Run v2 gates。
5. 写脱敏 evidence/audit，提交、合入 master、master 门禁、推送并清理短分支。

## Risk Controls

- 权限：不改变登录、角色、授权或 edition 判定；标准版拒绝仍由上游边界处理。
- 题源：个人和内容后台不混入企业快照；组织角色只读同组织发布且未下架快照。
- Provider：本分支不执行 Provider，不生成最终题目正文、选项、答案或解析。
- 数据：不连接 DB、不读 rawfiles、不写 schema/migration/seed/fixture。
- 证据：只记录路径、命令和脱敏结论。

## Validation Commands

- `npm.cmd exec -- vitest run src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts src/server/services/ai-paper-source-adapter-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-knowledge-source-selection-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-paper-knowledge-source-selection-2026-07-08 -SkipRemoteAheadCheck`
