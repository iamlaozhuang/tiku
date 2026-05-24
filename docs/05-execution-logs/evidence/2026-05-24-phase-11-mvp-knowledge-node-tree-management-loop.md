# Evidence: phase-11-mvp-knowledge-node-tree-management-loop

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-knowledge-node-tree-management-loop`
- Goal: close local knowledge_node tree management evidence for create, edit, sort, move, disable, question count visibility, audit logging, and recommendation-correction readiness.

## Boundary

- Local dev runtime only.
- Fixture/mock-backed knowledge_node behavior only.
- Boundary correction: added `src/server/repositories/**` because the current knowledge_node move/sort state transition and DTO mapping live in `rag-resource-knowledge-runtime-repository.ts`.
- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No secret/env change.
- No real provider, real vector service, real OCR, or object-storage connection.
- No destructive data operation.
- No token, Authorization header, raw payload, raw prompt, raw answer, raw model response, full paper/material/OCR/resource text, raw chunk text, embedding value, object storage secret, or private data recorded.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, staging/prod, deployment, real provider, object storage, major permission model, and destructive data operations.

## AC-to-Runtime Matrix

| Acceptance criterion                                                 | Runtime surface                                      | Current state   | Implementation evidence                                                                                                                                                    | Downstream effect                                                                           | Remaining gap | Decision               |
| -------------------------------------------------------------------- | ---------------------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------- | ---------------------- |
| Content ops can create and edit knowledge_node records               | `/api/v1/knowledge-nodes`, admin knowledge_node UI   | runtime_closed  | `admin-content-knowledge-ops-baseline.test.ts` create/edit assertions                                                                                                      | Content ops can maintain public tree nodes                                                  | none          | implemented            |
| Content ops can sort and move knowledge_node nodes safely            | `PATCH /api/v1/knowledge-nodes/{publicId}`, admin UI | runtime_closed  | RED/GREEN UI move/sort test and `phase-11-knowledge-node-tree-management-loop.test.ts` PATCH route test                                                                    | Tree order/path stays reviewable                                                            | none          | implemented            |
| Content ops can disable but not delete nodes                         | `/disable` action, admin UI, route exports           | runtime_closed  | Disable test plus route-export no-`DELETE` assertion                                                                                                                       | Historical bindings remain stable                                                           | none          | implemented            |
| Question count and recommendable state are visible without internals | list/detail DTO and admin UI                         | partial_runtime | Unit tests preserve returned `questionCount` and `isRecommendable`; repository still lacks an approved question-to-knowledge_node persistence source for exact aggregation | Content ops can see safe count fields; exact persisted binding count remains approval-gated | P1            | deferred_with_approval |
| Audit logs are redacted and complete for tree mutations              | audit_log append calls from knowledge_node mutations | runtime_closed  | Route mutation test asserts redacted `knowledge_node.update` audit metadata and excludes session token/body text                                                           | Ops can review tree changes without raw data                                                | none          | implemented            |

## Problem Grading

| Severity | Affected role | Reproduction path or command                          | Expected result                                                               | Actual result before task                                                                                                                                             | Fixed status           | Residual risk                                                         | Follow-up                                   |
| -------- | ------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | --------------------------------------------------------------------- | ------------------------------------------- |
| P1       | content ops   | `/content/knowledge-nodes`, `/api/v1/knowledge-nodes` | create/edit/sort/move/disable/audit loop with public ids and no delete action | Move button was entry-only and no route-level move/sort audit test existed                                                                                            | fixed                  | none for local move/sort/disable/audit                                | none                                        |
| P1       | content ops   | `/content/knowledge-nodes`, repository DTO mapping    | exact `questionCount` from persisted question-to-knowledge_node bindings      | Existing schema/runtime has no question-to-knowledge_node join table or field; repository can only surface a safe count field and currently maps database rows to `0` | deferred_with_approval | exact count remains unavailable until schema/binding work is approved | future schema-approved content binding task |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master at 9395499.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-knowledge-node-tree-management-loop
Result on branch codex/phase-11-mvp-knowledge-node-tree-management-loop: pass while task status was pending.

npm.cmd run test:unit -- tests/unit/phase-11-knowledge-node-tree-management-loop.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts
RED result before implementation: 1 failed test, `移动节点` did not open an `alertdialog`.

npm.cmd run test:unit -- tests/unit/phase-11-knowledge-node-tree-management-loop.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts
GREEN result after implementation: 2 files / 14 tests passed.

npm.cmd run typecheck
First attempt: EPERM while reading local `node_modules` TypeScript entry under sandbox.
Retry with approved escalation: pass.

npm.cmd run test:unit
Result: 113 files / 429 tests passed.

npm.cmd run build
Result: pass. Build summary listed `.env.local` as an environment source; no `.env.local` contents were read or recorded.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result before commit: inventory completed; changed files are current task files only.

git diff --check
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result: pass. Gate ran lint, typecheck, test:unit (113 files / 429 tests), and format:check.

git commit -m "feat(rag): harden knowledge node tree management"
Result: task commit `ac61cb6`.

git merge --no-ff codex/phase-11-mvp-knowledge-node-tree-management-loop -m "merge: phase 11 knowledge node tree management loop"
Result: merge commit `f8e83bb` on `master`.

npm.cmd run build
Post-merge result on `master`: pass. Build summary listed `.env.local` as an environment source; no `.env.local` contents were read or recorded.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Post-merge result on `master`: pass. Gate ran lint, typecheck, test:unit (113 files / 429 tests), and format:check.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Post-merge result on `master`: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Post-merge result on `master`: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Post-merge result on `master`: inventory completed; `master` ahead of `origin/master` by task + merge commits pending push.

git diff --check
Post-merge result on `master`: pass.

git push origin master
Result: pushed `master` to `origin`, `9395499..81e124c`.

git branch -d codex/phase-11-mvp-knowledge-node-tree-management-loop
First attempt: sandbox ref lock permission denied.
Retry with approved escalation: deleted local branch `codex/phase-11-mvp-knowledge-node-tree-management-loop` at `ac61cb6`.

git status --short --branch
Result after push and cleanup: `## master...origin/master`.

git branch --list codex/phase-11-mvp-knowledge-node-tree-management-loop
Result: no matching local branch remains.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                                                                                      | Result |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Branch isolation     | Current branch is `codex/phase-11-mvp-knowledge-node-tree-management-loop`, not master/main                                                                            | Pass   |
| Allowed files        | Changed files are knowledge_node UI, RAG knowledge repository, unit tests, task plan/evidence, and queue state; boundary correction added `src/server/repositories/**` | Pass   |
| Blocked files        | No package, lockfile, env, schema, migration, script, cloud, deployment, staging/prod file change                                                                      | Pass   |
| AC-to-runtime matrix | Matrix records runtime-closed move/sort/disable/audit and approval-gated exact count residual                                                                          | Pass   |
| Problem grading      | P1 move/sort/disable/audit fixed; P1 exact persisted question count deferred with approval gate                                                                        | Pass   |
| Validation record    | RED/GREEN targeted tests, typecheck, full unit, build, readiness, naming, Git inventory, diff check, and quality gate recorded                                         | Pass   |
| Evidence hygiene     | No secrets, raw resource text, raw chunks, embeddings, provider payloads, or prohibited data recorded                                                                  | Pass   |
| Commit               | Focused task commit `ac61cb6`                                                                                                                                          | Pass   |
| Merge                | Merged to `master` with merge commit `f8e83bb`                                                                                                                         | Pass   |
| Push                 | Pushed `master` to `origin`, `9395499..81e124c`                                                                                                                        | Pass   |
| Cleanup              | Deleted local short-lifecycle branch `codex/phase-11-mvp-knowledge-node-tree-management-loop` after merge and push                                                     | Pass   |
| Worktree residue     | `git status --short --branch` reported `## master...origin/master`; no untracked files and no matching local task branch remains                                       | Pass   |
| stagingDecision      | `local_task_closed_remaining_p1` because exact persisted question count needs schema/binding approval                                                                  | Pass   |
| Next step            | Continue to `phase-11-mvp-ai-knowledge-recommendation-review-loop`; carry count binding as approval-gated follow-up                                                    | Pass   |

## stagingDecision

local_task_closed_remaining_p1

## Next Step

After commit/merge/push/cleanup, continue to `phase-11-mvp-ai-knowledge-recommendation-review-loop`. Keep exact persisted question-to-knowledge_node count as an approval-gated follow-up because schema or binding persistence work is not approved in this task.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, raw chunk text, embedding values, object storage secrets, and private data.
