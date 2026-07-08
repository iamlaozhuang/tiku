# Knowledge Node AI Closure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 先把知识点树、资源、题目、四角色 AI 出题和 AI 组卷知识点参数闭环物化并三轮复核，再按矩阵逐短分支实现、验证、合入、推送和清理。

**Architecture:** 以 `knowledge_node` 为唯一知识点树，以 `resource` 表达教材、鉴定点和知识点文档，以 `knowledge_node_resource` 与 `question_knowledge_node` 承载资源和题目绑定。AI 出题使用知识点范围过滤 RAG 资源，AI 组卷使用知识点范围过滤正式题源并由本地服务选择题目。

**Tech Stack:** React + TypeScript 前端、Node/TypeScript 服务层、Drizzle schema 现状读取、Vitest targeted tests、Module Run v2 门禁。

## Global Constraints

- 沟通和记录保持简洁中文，evidence 只记录脱敏路径、数量、状态和代码符号结论。
- 不在 `master` 直接开发；每项实现从最新 `origin/master` 创建 `codex/` 短分支。
- 不改登录、角色、授权、edition 判定语义。
- 不新增账号，不写数据库，不改 seed，不改 fixture。
- 不执行 Provider-enabled 调用。
- 不改 package、lockfile、schema、migration、seed。
- 不读取或记录 env 值、DB 原始行、内部数字 id、Provider payload、原始提示词、原始模型输出、完整题目、完整试卷、完整材料或完整资源内容。
- 每个实现分支必须有 targeted test、对抗式复核、evidence、audit、提交、快进合入 master、master 门禁、推送、短分支清理。

---

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
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated\resource-pack-manifest.json`（脱敏读取）
- `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated\source-coverage.csv`（脱敏读取）
- `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated\knowledge-node-candidates.csv`（脱敏读取）

## File Structure

- Modify: `docs/04-agent-system/state/project-state.yaml`，登记当前计划任务、当前 phase、仓库 checkpoint。
- Modify: `docs/04-agent-system/state/task-queue.yaml`，登记当前 docs-only 任务和后续 closeout 策略。
- Create: `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`，物化关系模型和四角色 AI 参数合同。
- Create: `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`，拆出可核销任务矩阵。
- Create: `docs/05-execution-logs/evidence/2026-07-08-knowledge-node-ai-closure-plan-evidence.md`，记录脱敏读取、代码符号结论和验证结果。
- Create: `docs/05-execution-logs/audits-reviews/2026-07-08-knowledge-node-ai-closure-plan-adversarial-audit.md`，记录三轮对抗式复核。

## Task 0: Plan Materialization

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- Create: `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-plan.md`
- Create: `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md`
- Create: `docs/05-execution-logs/evidence/2026-07-08-knowledge-node-ai-closure-plan-evidence.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-08-knowledge-node-ai-closure-plan-adversarial-audit.md`

**Interfaces:**

- Consumes: current `origin/master` and SSOT docs.
- Produces: Phase 1 closeout commit and matrix rows for implementation branches.

- [x] **Step 1: Confirm branch and clean baseline**

Run: `git status --short --branch`

Expected: branch `codex/knowledge-node-ai-closure-plan-2026-07-08`, no untracked source changes before edits.

- [x] **Step 2: Read SSOT and current code symbols**

Read the SSOT files listed above and static code paths covering `knowledge_node`, `resource`, `question_knowledge_node`, AI route parameters, AI question generation, AI paper plan/select, source resolution, student UI, admin UI, and content draft adoption.

- [x] **Step 3: Materialize requirement plan**

Create `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md` with the target relationship model, relationship timing, four-role AI parameter contract, AI 出题 flow, AI 组卷 flow, order, and boundaries.

- [x] **Step 4: Materialize control matrix**

Create `docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md` with stage rows, role/page/source/code/boundary/permission/edition/state/evidence/audit/status columns.

- [x] **Step 5: Run three-round adversarial review**

Create `docs/05-execution-logs/audits-reviews/2026-07-08-knowledge-node-ai-closure-plan-adversarial-audit.md` covering relation correctness, role and edition boundaries, AI/provider/data redaction boundaries.

- [x] **Step 6: Run docs validation**

Run:

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-plan.md docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md docs/05-execution-logs/evidence/2026-07-08-knowledge-node-ai-closure-plan-evidence.md docs/05-execution-logs/audits-reviews/2026-07-08-knowledge-node-ai-closure-plan-adversarial-audit.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId knowledge-node-ai-closure-plan-2026-07-08
```

Expected: PASS. If Prettier reports formatting differences, run the same path list with `--write`, then rerun `--check`.

- [ ] **Step 7: Commit, merge, push, cleanup**

Run:

```powershell
git add docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-plan.md docs/05-execution-logs/task-plans/2026-07-08-knowledge-node-ai-closure-control-matrix.md docs/05-execution-logs/evidence/2026-07-08-knowledge-node-ai-closure-plan-evidence.md docs/05-execution-logs/audits-reviews/2026-07-08-knowledge-node-ai-closure-plan-adversarial-audit.md
git commit -m "docs(knowledge): plan ai closure matrix"
git switch master
git merge --ff-only codex/knowledge-node-ai-closure-plan-2026-07-08
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId knowledge-node-ai-closure-plan-2026-07-08 -SkipRemoteAheadCheck
git push origin master
git branch -d codex/knowledge-node-ai-closure-plan-2026-07-08
git status --short --branch
```

Expected: master equals `origin/master`, working tree clean, short branch removed.

## Implementation Branch Sequence

后续实现分支以矩阵为准。每个分支都必须重新执行：

1. `git fetch origin master`
2. `git switch master`
3. `git merge --ff-only origin/master`
4. `git switch -c codex/<matrix-task-id>`
5. 阅读矩阵行指定 SSOT、设计来源、代码和测试。
6. 先补 targeted test，再做最小源码实现。
7. 运行 targeted test、必要 lint/typecheck、必要全量 vitest。
8. 写脱敏 evidence 和对抗 audit。
9. 提交、快进合入 master、在 master 跑门禁、推送、删除短分支、确认 clean 和远端对齐。

## Self-Review

- Spec coverage: 已覆盖知识点树、知识点文档、教材资源、题目、四角色 AI 出题、四角色 AI 组卷、权限、edition、空态、错误态、禁用态、Provider 和数据红线。
- Placeholder scan: 本计划不使用空白占位或延后占位；未完成项均是本任务后续命令步骤，并有明确命令。
- Type consistency: 后续统一使用 `knowledgeNodeMode`、`knowledgeNodePublicIds`、`includeDescendants`、`knowledgeNodeSupplement`、`sourcePreference`。
