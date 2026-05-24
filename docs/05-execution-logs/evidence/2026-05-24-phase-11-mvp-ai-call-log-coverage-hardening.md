# Evidence: phase-11-mvp-ai-call-log-coverage-hardening

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-ai-call-log-coverage-hardening`
- Goal: close local `ai_call_log` coverage and summary verification without raw prompt/answer/model response or real-provider exposure.
- Runtime changes: added AI call log query normalization, route query parsing, returned-row filtering, and returned-summary filtering.

## Boundary

- Local dev runtime only.
- No dependency, package, or lockfile change.
- No schema, migration, repository, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No secret/env change.
- No real provider, real vector service, real OCR, or object-storage connection.
- No destructive data operation.
- No token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR/resource text, raw chunk text, embedding value, object storage secret, or private data recorded.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, staging/prod, deployment, real provider, object storage, major permission model, and destructive data operations.

## AC-to-Runtime Matrix

| Acceptance criterion                                                        | Runtime surface                         | Current state   | Implementation evidence                                                                       | Downstream effect                                   | Remaining gap          | Decision     |
| --------------------------------------------------------------------------- | --------------------------------------- | --------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------------------- | ------------ |
| AI call logs expose publicId-safe redacted operational history              | `/api/v1/ai-call-logs`, service DTO     | runtime_closed  | RED/GREEN unit proves publicId-safe rows and no token/provider/raw response fields            | Operators can review AI activity without raw data   | none                   | implemented  |
| AI call log filters cover function/status/provider summary without raw data | contract/service/list query             | runtime_closed  | Query factory normalizes `aiFuncType`, `callStatus`, `profession`, `level`, and `keyword`     | AI/RAG failures and fallback behavior can be traced | none                   | implemented  |
| AI call summary aggregates are reviewable without leaking prompt/output     | `/api/v1/ai-call-logs/summary`, service | runtime_closed  | Summary route filters returned summaries by function/status/keyword and keeps aggregate shape | Release review can inspect cost/success patterns    | none                   | implemented  |
| Evidence excludes raw prompt/answer/model response/provider payload         | tests/evidence/admin DTO                | runtime_closed  | Unit assertions reject provider payload, raw model response, token, request body, and raw id  | Safe local validation                               | none                   | implemented  |
| Repository-level AI log filtering across all pages                          | Postgres repository                     | partial_runtime | Service-level returned-page filtering implemented; repository edits were outside allowedFiles | Local UI/API can filter returned runtime rows       | blocked_by_approval P2 | not_in_scope |

## Problem Grading

| Severity | Affected role | Reproduction path or command                                                                                             | Expected result                                                      | Actual result before task                                                   | Fixed status                    | Residual risk                                             | Follow-up                                                    |
| -------- | ------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------ |
| P1       | system ops    | `GET /api/v1/ai-call-logs?...aiFuncType=learning_suggestion&callStatus=failed&profession=marketing&level=3&keyword=mock` | Filtered, publicId-safe, redacted AI call log rows                   | Runtime did not parse or normalize AI-specific URL filters                  | fixed in service/contract tests | none for returned-row local filtering                     | none                                                         |
| P1       | system ops    | `GET /api/v1/ai-call-logs/summary?...aiFuncType=learning_suggestion&keyword=mock`                                        | Filtered aggregate summaries without prompt/output/provider raw data | Summary route returned repository summaries without service-level filtering | fixed in service tests          | none for returned-summary local filtering                 | none                                                         |
| P2       | system ops    | Postgres-backed AI call list with filters after the first page                                                           | Repository-level filtering and exact pagination totals               | Repository-level filtering beyond keyword was outside task allowedFiles     | deferred, not touched           | exact cross-page filtered pagination needs allowed change | future repository hardening only after allowedFiles approval |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master at 8708839.

git switch -c codex/phase-11-mvp-ai-call-log-coverage-hardening
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-ai-call-log-coverage-hardening
Result on branch codex/phase-11-mvp-ai-call-log-coverage-hardening: pass while task status was pending.

npm.cmd run test:unit -- tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts
RED result before implementation: 1 failed file, 3 failed tests.
Expected failures: missing normalized AI filters, missing route query fields, missing returned-row and returned-summary filtering.

npm.cmd run test:unit -- tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts
GREEN result after implementation: pass. 1 file passed, 3 tests passed.

npm.cmd run test:unit
Result: pass. 116 files passed, 437 tests passed.

npm.cmd run build
First result: failed TypeScript because URL query values were wider than the query factory override type.
Fix: widened the query factory raw override type and kept runtime normalization centralized.

npm.cmd run test:unit -- tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts
Result after type fix: pass. 1 file passed, 3 tests passed.

npm.cmd run build
Result after type fix: pass. Next.js compiled, TypeScript passed, 47 static pages generated.

npm.cmd run test:unit
Result after type fix: pass. 116 files passed, 437 tests passed.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result: pass. lint, typecheck, test:unit, and format:check passed.

npm.cmd run build
Final result: pass. Next.js compiled, TypeScript passed, 47 static pages generated.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result before commit: pass inventory; branch had task-only unstaged/untracked changes and no commits ahead yet.

git diff --check
Result: pass.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                         | Result                  |
| -------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-ai-call-log-coverage-hardening`, not master/main                    | Pass                    |
| Allowed files        | Changed files match task allowedFiles; no package, lockfile, env, schema, migration, script, cloud files  | Pass                    |
| AC-to-runtime matrix | Matrix labels `runtime_closed`, `partial_runtime`, and approval-blocked residuals                         | Pass                    |
| Problem grading      | P1 fixed items and P2 approval-blocked residuals recorded                                                 | Pass                    |
| Validation record    | Claim readiness, RED/GREEN target test, full unit, build, readiness, naming, quality gate recorded        | Pass                    |
| Evidence hygiene     | No secrets, raw prompts, raw answers, raw model responses, provider payloads, or prohibited data recorded | Pass                    |
| Commit               | Pending task commit                                                                                       | Pending post-validation |
| Merge                | Pending merge to `master`                                                                                 | Pending post-validation |
| Push                 | Pending push to `origin/master` under queue-wide approval                                                 | Pending post-validation |
| Cleanup              | Pending deletion of merged short-lifecycle branch                                                         | Pending post-validation |
| Worktree residue     | Pending final clean repository check after merge/push/cleanup                                             | Pending post-validation |
| stagingDecision      | `local_task_closed_remaining_p1`                                                                          | Pass                    |
| Next step            | After closeout, claim `phase-11-mvp-auth-session-account-hardening` from clean `master`                   | Pass                    |

## stagingDecision

local_task_closed_remaining_p1

Reason: local AI call log and summary redaction/filtering is closed for returned runtime rows. Repository-level exact cross-page filtered pagination remains approval-blocked because repository changes were outside this task boundary.

## Next Step

Commit, merge to `master`, push `master`, run post-merge gates, clean the merged short-lifecycle branch, then claim `phase-11-mvp-auth-session-account-hardening` only after `master` and `origin/master` are aligned and the repo is clean.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, raw chunk text, embedding values, object storage secrets, and private data.
