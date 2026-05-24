# Evidence: phase-11-mvp-ai-knowledge-recommendation-review-loop

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-ai-knowledge-recommendation-review-loop`
- Goal: close local mock-provider-first `kn_recommendation` trigger/review/stale-discard/correction evidence within the approved no-provider/no-schema boundary.

## Boundary

- Local dev runtime only.
- Mock-provider-first or deterministic fixture behavior only.
- No dependency, package, or lockfile change.
- No schema, migration, repository, or script change unless a later explicit approval expands the boundary.
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

| Acceptance criterion                                                           | Runtime surface                                                     | Current state                           | Implementation evidence                                                                                                | Downstream effect                                           | Remaining gap                                             | Decision               |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | --------------------------------------------------------- | ---------------------- |
| Content ops can trigger `kn_recommendation` for a question                     | `POST /api/v1/questions/{publicId}/recommend-knowledge-nodes`       | runtime_closed                          | `tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts`; `tests/unit/admin-question-material-ui.test.ts` | Content ops can request local deterministic recommendations | none in local boundary                                    | closed                 |
| Content ops can review recommendation confidence and stale/discard state       | Admin question UI, `QuestionKnowledgeRecommendationDto.reviewState` | runtime_closed                          | UI test covers confidence, accept, discard, and stale after question edit                                              | Human review controls weak/stale suggestions                | none in local boundary                                    | closed                 |
| Correction loop updates intended question-to-knowledge_node selection boundary | Admin question UI local DTO boundary                                | local_runtime_only_deferred_persistence | UI test proves accepted recommendation appears in current question `knowledgeNodePublicIds`                            | Accepted suggestions become visible in local review context | Durable persistence needs approved repository/schema work | deferred_with_approval |
| Audit and ai_call_log evidence is redacted                                     | audit_log and ai_call_log safe snapshots                            | runtime_closed                          | API test asserts audit metadata summary and no fixture/raw request text in ai_call_log entries                         | Review evidence avoids raw prompt/model data                | none observed                                             | closed                 |
| No real provider, raw prompt, raw answer, raw model response, or secrets       | Local deterministic runner only                                     | runtime_closed                          | API/UI tests use bounded fixtures; validation did not call real provider/staging/prod                                  | Safe local validation                                       | none observed                                             | closed                 |

## Problem Grading

| Severity | Affected role | Reproduction path or command                                                   | Expected result                                                     | Actual result before task                                        | Fixed status                         | Residual risk                                                                                         | Follow-up                                              |
| -------- | ------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| P1       | content ops   | `/content/questions`, `/api/v1/questions/{publicId}/recommend-knowledge-nodes` | trigger/review/stale-discard/correction loop with redacted evidence | Prior audit says the full `kn_recommendation` loop is incomplete | fixed within approved local boundary | Durable question-to-knowledge_node persistence remains unavailable without repository/schema approval | Follow-up approval task if durable binding is required |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master at aeeebbd.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-ai-knowledge-recommendation-review-loop
Result on branch codex/phase-11-mvp-ai-knowledge-recommendation-review-loop: pass while task status was pending.

npm.cmd run test:unit -- tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts tests/unit/admin-question-material-ui.test.ts
RED result before implementation: failed as expected.
- UI test could not find recommendation trigger button.
- API test found `reviewState` missing from recommendation DTO.

npm.cmd run test:unit -- tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts tests/unit/admin-question-material-ui.test.ts
GREEN result after implementation: pass, 2 files / 8 tests.

npm.cmd run typecheck
First sandbox result: EPERM reading local TypeScript executable under node_modules.

npm.cmd run typecheck
Escalated rerun result: pass after TS narrowing fix.

npm.cmd run test:unit
Result: pass, 114 files / 431 tests.

npm.cmd run build
Result: pass. Build reported `.env.local` as an environment source; no contents were read or recorded.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

git diff --check
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result: inventory completed. Before commit, branch has only current task changes and no upstream.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
First result: lint/typecheck/test:unit passed, format:check failed on `AdminQuestionMaterialManagementClient.tsx`.

node .\node_modules\prettier\bin\prettier.cjs --write <current task files>
Result: pass after escalated rerun due sandbox EPERM reading local Prettier executable. Only current task files were formatted; no dependency files changed.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Final result: pass. lint, typecheck, test:unit, and format:check all passed.
```

## Commit and Merge

```text
git commit -m "feat(rag): add knowledge recommendation review loop"
Result: pass.
Task commit: a2a01fa2ba97a0c801d957c40664f3f85208d700

git fetch origin
Result: pass.

git switch master
Result: pass; master was up to date with origin/master before merge.

git merge origin/master
Result: already up to date.

git merge --no-ff codex/phase-11-mvp-ai-knowledge-recommendation-review-loop -m "merge: phase 11 AI knowledge recommendation review loop"
Result: pass.
Merge commit: d78e33618d90f2ec2b19ae8fc0146f6b5748e4e4
```

## Post-Merge Validation on Master

```text
git status --short --branch
Result: master ahead of origin/master by 2 commits after merge; no unstaged files.

npm.cmd run build
Result: pass. Build reported `.env.local` as an environment source; no contents were read or recorded.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result: pass. lint, typecheck, test:unit, and format:check all passed.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result: inventory completed. master ahead of origin/master by task and merge commits; no tracked, staged, or untracked residue.

git diff --check
Result: pass.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                                             | Result  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-ai-knowledge-recommendation-review-loop`, not master/main                               | Pass    |
| Allowed files        | Changed files are within queue allowed files: admin UI, contracts, services, unit tests, task docs/state                      | Pass    |
| Blocked files        | No package, lockfile, env, schema, migration, script, cloud, deployment, staging/prod file change                             | Pass    |
| AC-to-runtime matrix | Matrix records partial-runtime starting state and pending decisions                                                           | Pass    |
| Problem grading      | Initial P1 `kn_recommendation` loop issue recorded                                                                            | Pass    |
| Validation record    | RED/GREEN targeted tests, typecheck, full unit, build, readiness, naming, diff check, git inventory, and QualityGate recorded | Pass    |
| Evidence hygiene     | No secrets, raw prompts, raw answers, raw model responses, provider payloads, or prohibited data recorded                     | Pass    |
| Commit               | Task commit `a2a01fa2ba97a0c801d957c40664f3f85208d700`                                                                        | Pass    |
| Merge                | Merged to master with merge commit `d78e33618d90f2ec2b19ae8fc0146f6b5748e4e4`                                                 | Pass    |
| Push                 | Pending                                                                                                                       | Pending |
| Cleanup              | Pending                                                                                                                       | Pending |
| Worktree residue     | Pending                                                                                                                       | Pending |
| stagingDecision      | `local_task_closed_remaining_persistence_deferred`                                                                            | Pass    |
| Next step            | Commit, merge to master, push, run post-merge gates, clean branch, then claim next queue task                                 | Pass    |

## stagingDecision

local_task_closed_remaining_persistence_deferred

## Next Step

Commit, merge to master, push, run post-merge gates, clean the short lifecycle branch, then claim `phase-11-mvp-audit-log-coverage-hardening` only from a clean repository.

## Implementation Summary

- `src/server/contracts/question-contract.ts`: added `QuestionKnowledgeRecommendationReviewStateDto` and `reviewState` to recommendation DTO.
- `src/server/services/content-question-material-runtime.ts`: maps the source question `updated_at` into `reviewState.questionUpdatedAt`, with explicit stale policy and `local_review_only` binding mode.
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`: added recommendation trigger, confidence review panel, accept/discard local review state, and stale detection after question edits.
- `tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts`: covers API review metadata plus redacted audit/ai_call_log evidence.
- `tests/unit/admin-question-material-ui.test.ts`: covers admin UI trigger, confidence visibility, accept, discard, and stale state.

## Deferred Gap

Durable question-to-knowledge_node binding is not implemented in this task. The current approved boundary excludes repository/schema changes, and existing question mapping returns `knowledgeNodePublicIds: []`. Implementing durable persistence requires an explicit follow-up approval that allows repository/schema work.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, raw chunk text, embedding values, object storage secrets, and private data.
