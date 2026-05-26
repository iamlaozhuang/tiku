# Phase 12 Content Knowledge Tree SSOT AC Evidence

## 任务边界

- TaskId: `phase-12-repair-content-knowledge-tree-ssot-ac`
- Branch: `codex/phase-12-content-knowledge-tree-ssot-ac`
- Scope: existing knowledge_node UI, tests, evidence, and queue state.

## 外部与安全边界

- No cloud resources created or modified.
- No staging/prod connection.
- No deployment.
- No package, lockfile, dependency, schema, migration, script, `.env.local`, or `.env.example` change.
- No provider call.
- No secret, token, Authorization header, provider payload, raw prompt, raw answer, raw model response, full paper, full textbook, OCR full text, customer or customer-like private data recorded.

## SSOT AC 对照

| AC                                                 | Runtime result                                                                                                                                                                                                                         |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| US-06-10 AC-1 按专业展示树形结构                   | PASS. `/content/knowledge-nodes` now renders grouped `role="tree"` sections by `profession`, with publicId-only rows and `data-depth` derived from the path.                                                                           |
| US-06-10 AC-2 新增、编辑、排序、停用、移动、重命名 | PASS within existing schema/API boundary. Create/edit now use editable name/profession/level/parent/sort form values; move uses editable parent publicId and sort; disable keeps destructive confirmation; delete remains unavailable. |
| US-06-10 AC-3 查看节点绑定题目数量                 | PASS. Existing `questionCount` stays visible per row and in the summary.                                                                                                                                                               |
| US-06-10 AC-4 AI 推荐结果查看和修正                | Boundary preserved. Recommendation review/correction remains owned by the question authoring page; this task does not add provider calls or expand schema.                                                                             |
| RAG module 7.2/7.3 knowledge_node management       | PASS for local content-admin runtime: tree is organized by profession, node fields include name/parent/sort/level/status, move/rename are publicId-safe, and delete is not exposed.                                                    |

## 验证记录

- TDD RED:
  - Command: `npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-11-knowledge-node-tree-management-loop.test.ts`
  - Result: expected failure before production change.
  - Failure summary: missing `营销知识点树` tree role, missing `节点名称` / `新父级 publicId` form controls, and fixed create/edit/move payloads.
- Format:
  - Command: `node .\node_modules\prettier\bin\prettier.cjs --write src/features/admin/knowledge-node-management/AdminKnowledgeNodeManagement.tsx tests/unit/admin-content-knowledge-ops-baseline.test.ts docs/05-execution-logs/task-plans/2026-05-25-phase-12-content-knowledge-tree-ssot-ac.md docs/05-execution-logs/evidence/2026-05-25-phase-12-content-knowledge-tree-ssot-ac.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml`
  - Result: PASS after sandbox-escalated retry. No dependency/package/lockfile changes.
- Unit:
  - Command: `npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-11-knowledge-node-tree-management-loop.test.ts`
  - Result: PASS. 2 files, 15 tests.
- E2E:
  - Command: `npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts`
  - First run: FAIL at `/ops/users`; root cause from local dev log was PostgreSQL `too many clients already`, causing multiple admin ops APIs to return HTTP 500. No secret, token, or raw payload recorded here.
  - Corrective local action: stopped the stale local Node dev server process and let Playwright start a fresh dev server. No database/container reset, no schema/script change, no cloud/staging/prod connection.
  - Rerun result: PASS. 1 Chromium test passed.
- Build:
  - Command: `npm.cmd run build`
  - Result: PASS. Next.js production build, TypeScript, and static generation completed.
- Agent readiness:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: PASS.
- Naming:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - Result: PASS.
- Git inventory:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: PASS inventory. Changed files are scoped to the task branch.
- Diff whitespace:
  - Command: `git diff --check`
  - Result: PASS.
- Claim readiness resume note:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-content-knowledge-tree-ssot-ac`
  - Result: expected non-claimable after resume because the task is already `in_progress`.

## 实现摘要

- Added editable knowledge_node forms for create/edit with `name`, `profession`, `levelList`, `parentKnowledgeNodePublicId`, and `sortOrder`.
- Added editable move form with `parentKnowledgeNodePublicId` and `sortOrder`.
- Replaced fixed demo payloads with user-entered publicId-safe JSON payloads.
- Rendered knowledge nodes as grouped trees by profession and retained publicId-only row metadata.
- Preserved no-delete, no-provider-call, no-schema-change boundaries.

## Repository Hygiene Closeout Checklist

- Package/lockfile changes: none.
- Schema/migration/script changes: none.
- `.env.local` / `.env.example` changes: none.
- Secret/provider/raw prompt/raw answer/raw model response in evidence: none.
- Cloud/staging/prod/deploy actions: none.
- Internal auto-increment id exposed in UI/tests: no.
- Next task: `phase-12-repair-admin-common-interaction-ssot-ac`.

## Post-Merge Master Verification

- Merge commit: `merge: content knowledge tree ssot ac` on local `master`.
- Unit:
  - Command: `npm.cmd run test:unit -- tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-11-knowledge-node-tree-management-loop.test.ts`
  - Result: PASS. 2 files, 15 tests.
- Agent readiness:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: PASS.
- Git inventory:
  - Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`
  - Result: PASS inventory. `master` is ahead of `origin/master` by the merge commit and the feature commit.
- Diff whitespace:
  - Command: `git diff --check`
  - Result: PASS.
