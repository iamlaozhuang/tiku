# Knowledge Node AI Cross-Role Regression Task Plan

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- All prerequisite branch evidence and audit files for rows 26-32.
- Cross-role boundary code and tests:
  - `src/server/contracts/route-integrated-provider-execution-contract.ts`
  - `src/server/services/admin-workspace-role-guard-service.ts`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
  - `tests/unit/student-personal-ai-generation-ui.test.ts`
  - `tests/unit/admin-ai-generation-entry-surface.test.ts`
  - `src/server/services/admin-ai-generation-local-contract-route.test.ts`

## Branch Scope

只处理矩阵行 `knowledge-node-ai-cross-role-regression-2026-07-08`：

- 汇总复核知识点树、资源、题目、AI出题、AI组卷、内容采纳、角色拒绝、edition 边界和组织上下文闭环。
- 新增低耦合跨角色回归单测，覆盖结构化知识点参数、标准/高级版组织后台边界、`super_admin` 缺组织上下文拒绝、content/ops 工作区分离。
- 如发现跨分支遗漏，只做最小修复；未发现时只提交测试、evidence、audit 和状态登记。

## Risk Controls

- 不改登录、角色、授权、edition 语义。
- 不新增账号，不连 DB，不改 seed/fixture/schema/migration。
- 不执行 Provider，不读 Provider 配置，不记录 prompt、raw output 或 payload。
- 不改 package/lockfile/env，不跑浏览器，不启动服务，不截图，不抓 DOM。
- evidence 只记录命令、路径和脱敏结论。

## Validation Commands

- `npm.cmd exec -- vitest run tests/unit/knowledge-node-ai-cross-role-regression.test.ts`
- `npm.cmd exec -- vitest run`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId knowledge-node-ai-cross-role-regression-2026-07-08`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId knowledge-node-ai-cross-role-regression-2026-07-08 -SkipRemoteAheadCheck`
