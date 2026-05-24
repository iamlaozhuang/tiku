# Evidence: phase-11-mvp-student-ai-practice-mock-report-loop

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-student-ai-practice-mock-report-loop`
- Goal: close the local student AI practice/mock/report loop with mock-provider-first runtime evidence for `ai_scoring`, `ai_explanation`, `ai_hint`, `learning_suggestion`, `citation`, `evidence_status`, retry behavior, and redacted `ai_call_log` coverage.

## Boundary

- Local dev runtime only.
- Mock-provider-first only.
- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No real provider call.
- No secret/env change.
- No token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, generated plaintext `redeem_code` value, object storage secret, or private data recorded.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, real provider, Tencent Cloud, staging/prod, deployment, major permission model, and destructive data operations.

## Implementation Summary

- Enabled the student `mistake_book` AI explanation action in `StudentMistakeBookPage`, calling `/api/v1/mistake-books/{publicId}/ai-explanation` and rendering only redacted explanation metadata, learning suggestion, resource title, and heading path.
- Extended `practice` answer feedback DTOs with AI hint/explanation fields, `evidence_status`, citation arrays, and `retryRemainingCount` while preserving standard `{ code, message, data }` API responses.
- Added deterministic local `ai_hint` feedback for subjective `practice` answers with `evidenceStatus: none`, empty citations, and one retry budget; server rejects a third subjective submission with a standard 409 response.
- Updated the student practice UI to render AI hint feedback and allow one hint-guided retry instead of showing `AI 提示：暂不可用`.
- Updated e2e local business flow to assert the `mistake_book` AI explanation button is available.

## AC-to-Runtime Matrix

| Acceptance criterion                                                                                  | Runtime surface                                                    | Starting state  | Implementation evidence                                                                                                | Downstream effect                                                   | Remaining gap                                                                                        | Decision              |
| ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | --------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------- |
| MVP-GAP-004: student AI loop works as a user-visible runtime, not only service tests                  | practice/mock_exam/report/mistake_book UI and REST routes          | partial_runtime | `student-mistake-book-ui`, `student-practice-ui`, `practice-service`, full unit/e2e gates passed                       | Student can trigger AI explanation/hint from visible learning flows | Full per-feature `ai_call_log` write coverage remains in dedicated follow-up                         | closed with residuals |
| US-03-02 AC-2/3 and US-04 objective explanation: objective practice wrong/correct answer explanations | `/api/v1/practices`, practice UI, mistake_book AI explanation      | partial_runtime | `mistake_book` AI explanation action posts to REST route and renders explanation, learning suggestion, source metadata | Objective wrong-answer path exposes AI explanation from错题本       | Direct practice-card citation rendering remains absent when no RAG evidence is available locally     | closed for MVP path   |
| US-03-03 AC-2/3 and US-04 subjective hint/scoring: one retry then final scoring                       | `/api/v1/practices`, `/api/v1/mock-exams`, student answer services | partial_runtime | Subjective practice service returns `aiHintStatus: hinted`, `retryRemainingCount`, and enforces retry limit            | Student gets one guided retry before retry budget is exhausted      | Full subjective scoring display remains covered by existing mock_exam/report path, not practice card | closed for MVP path   |
| US-03-07 AC-3: report learning_suggestion and retry                                                   | `/api/v1/exam-reports`, report UI, learning_suggestion service     | partial_runtime | Existing report tests and e2e remain green; no regression in report UI                                                 | Report learning suggestion path remains available                   | Dedicated report UX hardening can refine loading/retry detail later                                  | no code change        |
| ai_call_log and evidence hygiene                                                                      | `/api/v1/ai-call-logs`, services, evidence                         | partial_runtime | Existing redaction tests remain green; new tests assert session token/raw answer/citation chunk text are not rendered  | Evidence and UI avoid sensitive raw data                            | Per-feature log coverage is deferred to `phase-11-mvp-ai-call-log-coverage-hardening`                | defer P1 follow-up    |

## Problem Grading

| Severity | Affected role                  | Reproduction path or command                                                                | Expected result                                                                                        | Actual result before task                                                      | Fixed status          | Residual risk                                                                              | Follow-up                                     |
| -------- | ------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | --------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------- |
| P0       | student                        | `tests/unit/student-mistake-book-ui.test.ts` RED test for AI explanation button             | `mistake_book` item can request and render AI explanation without raw answer/token/citation chunk text | Button was disabled and labelled unavailable                                   | Fixed                 | None known for local mock route                                                            | None                                          |
| P0       | student                        | `tests/unit/student-practice-ui.test.ts` RED test for subjective AI hint                    | Subjective practice answer renders AI hint, `evidenceStatus`, and one retry action                     | UI rendered `AI 提示：暂不可用` and disabled retry                             | Fixed                 | Server retry count is repository-count based; no schema change was needed                  | Recheck in broader practice/report follow-up  |
| P0       | student, system ops            | `src/server/services/practice-service.test.ts` RED test for subjective hint and retry limit | Service returns deterministic local `ai_hint`, `retryRemainingCount`, and rejects exhausted retry      | Service returned `aiHintStatus: null`                                          | Fixed                 | Deterministic hint has no local RAG citations, so `evidenceStatus` is `none`               | Model/RAG task can add richer citations later |
| P1       | system ops                     | Audit review row MVP-GAP-004 / MVP-GAP-013                                                  | Per-feature `ai_call_log` records redacted request/response/citation/failure metadata                  | Existing log coverage is partial                                               | Deferred by queue     | Needs dedicated coverage task to avoid mixing audit scope into this student runtime branch | `phase-11-mvp-ai-call-log-coverage-hardening` |
| P2       | student/admin protected routes | `npm.cmd run test:e2e -- --workers=1` browser console                                       | No hydration mismatch logs                                                                             | Existing `ProtectedRouteGuard` hydration mismatch logs remain while tests pass | Not part of this task | Log noise can obscure future e2e diagnostics                                               | Existing UI/runtime hardening backlog         |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master after previous task push closeout. Final previous-task push evidence commit: 8183896.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-student-ai-practice-mock-report-loop
First result on master: blocked by protected-branch guard, as expected.
Retry result on branch codex/phase-11-mvp-student-ai-practice-mock-report-loop: pass while task status was pending.

npm.cmd run test:unit -- --run tests/unit/student-mistake-book-ui.test.ts
RED before implementation: failed because AI explanation button was disabled.
GREEN after implementation: 1 file passed, 5 tests passed.

npm.cmd run test:unit -- --run src/server/services/practice-service.test.ts tests/unit/student-practice-ui.test.ts
RED before implementation: service returned aiHintStatus null; UI rendered AI hint unavailable.
GREEN after implementation: 2 files passed, 20 tests passed.

npm.cmd run test:unit -- --run src/server/services/practice-route.test.ts src/server/services/practice-service.test.ts src/server/services/mistake-book-route.test.ts src/server/services/mistake-book-service.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mistake-book-ui.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts
Result: 7 files passed, 46 tests passed.

npm.cmd run test:unit
Result: 107 files passed, 406 tests passed.

npm.cmd run typecheck
Initial post-e2e typecheck in Invoke-QualityGate failed on generated .next/dev/types artifacts.
Action: deleted only D:\tiku\.next\dev after path verification; no source file or tracked file deleted.
Fresh retry result: pass.

npm.cmd run build
Result: pass. Build output listed .env.local as an environment source; no .env.local content was read or recorded.

npm.cmd run test:e2e -- --workers=1
Result: 9 passed.
Residual log: existing ProtectedRouteGuard hydration mismatch remained; tests passed.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result after cleaning .next/dev: lint pass, typecheck pass, test:unit pass, format:check pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result before commit: inventory completed; expected unstaged/untracked current-task files listed.

rg -n "AI 讲解：暂不可用|AI 提示：暂不可用|AI讲解暂不可用" src tests e2e
Result: no runtime/e2e occurrence; only one negative assertion remains in tests.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                    | Result  |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-student-ai-practice-mock-report-loop`, not `master` or `main`  | Pass    |
| Allowed files        | Changed files are student UI, practice contract/service/mappers/tests, e2e assertion, docs/state     | Pass    |
| Blocked files        | No package, lockfile, env, schema, migration, script, cloud, deployment, or staging/prod file change | Pass    |
| AC-to-runtime matrix | Matrix above records runtime evidence and residual decisions                                         | Pass    |
| Problem grading      | P0/P1/P2 issues graded above                                                                         | Pass    |
| Validation record    | Commands and results recorded above                                                                  | Pass    |
| Evidence hygiene     | No secrets or prohibited raw data recorded                                                           | Pass    |
| Commit               | Pending after evidence update                                                                        | Pending |
| Merge                | Pending after branch commit                                                                          | Pending |
| Push                 | Pending after master closeout                                                                        | Pending |
| Cleanup              | Pending after master push                                                                            | Pending |
| Worktree residue     | `.next/dev` generated artifact removed after path verification                                       | Pass    |
| stagingDecision      | Local-only closeout; no staging/prod action                                                          | Pass    |
| Next step            | Claim `phase-11-mvp-model-config-fallback-runtime` from clean master                                 | Pass    |

## stagingDecision

local_closed_no_staging_or_prod

## Next Step

After commit, merge, master gate, push, and branch cleanup, claim `phase-11-mvp-model-config-fallback-runtime` from a clean `master`.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, object storage secrets, and private data.
