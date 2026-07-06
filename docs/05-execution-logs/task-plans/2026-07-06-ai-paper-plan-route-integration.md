# 2026-07-06 AI paper plan route integration

## 任务边界

- Task ID: `ai-paper-plan-route-integration-2026-07-06`
- Branch: `codex/ai-paper-plan-route-integration-2026-07-06`
- Parent stack:
  - `8b5e5af5f feat(ai-generation): add paper plan selection contract`
  - `2eb57e20f feat(ai-generation): add paper source adapters`
- 目标：把现有 route-integrated AI组卷 Provider 指令和结构预览解析从“生成完整试卷题目草稿”改为“生成组卷方案”，为后续本地正式题库选题接入提供稳定后端合同。

## 已读取规范与需求

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`

## 实现策略

1. 按 TDD 先补 route-integrated Provider 指令测试，证明 AI组卷输出合同不再要求 `questions`、`questionStem`、`questionOptions`、`standardAnswer`、`analysis`。
2. 按 TDD 补结构预览解析测试，证明 AI组卷只接受组卷方案字段与题量结构，拒绝 Provider 生成的嵌套题目内容。
3. 保持现有 `paper_draft` 结构预览 kind 的兼容外壳，避免在本包提前扩大 UI 改动；但其内容语义收敛为“试卷方案摘要”，`questionDrafts` 必须为空。
4. 不接入真实 Provider、不读 env、不跑 DB runtime、不连接 localhost、不执行浏览器矩阵。

## 风险防御

- 不改 `package.json`、lockfile、schema、migration、seed。
- 不记录 Provider payload、raw prompt、raw AI output、完整题目、答案、材料、试卷内容、内部 id、凭证、cookie、session、env 值。
- 若现有 UI 仍把 `paper_draft` 当完整题目草稿展示，本包只在 evidence 中标记为后续 UI 包风险，不在本包重构 UI。
- 若旧测试覆盖 Provider 直接生成题目，本包更新为新需求合同，不能把旧行为继续当 pass 目标。

## 验证命令

- `npm.cmd run test:unit -- src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `git diff --check`
- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-paper-plan-route-integration.md docs/05-execution-logs/evidence/2026-07-06-ai-paper-plan-route-integration.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-paper-plan-route-integration.md src/server/contracts/ai-generation-task-spec-contract.ts src/server/contracts/route-integrated-provider-execution-contract.ts src/server/services/route-integrated-provider-instruction-service.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-plan-route-integration-2026-07-06`
