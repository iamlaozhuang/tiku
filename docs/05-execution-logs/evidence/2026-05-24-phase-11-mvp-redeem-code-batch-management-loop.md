# Evidence: phase-11-mvp-redeem-code-batch-management-loop

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-redeem-code-batch-management-loop`
- Goal: close local redeem_code batch management evidence for batch generation, 100-code limit, uppercase display policy, search/status filters, UTC+8 expiry behavior, plaintext viewing policy, audit logging, and generated-code-to-student redemption acceptance.

## Boundary

- Local dev runtime only.
- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No secret/env change.
- No destructive data operation.
- No token, Authorization header, raw payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, generated plaintext `redeem_code` value, object storage secret, or private data recorded.
- Boundary correction after runtime inspection: default local redeem_code behavior lives in repository adapters as well as services. This task includes `src/server/repositories/**` for redeem_code generation, list filtering, audit logging, and redemption wiring only. No schema, migration, script, dependency, env, staging/prod, deployment, or cloud boundary is opened.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, staging/prod, deployment, major permission model, and destructive data operations.

## Implementation Summary

- Added batch generation contract with `generation` metadata and `redeemCodes[]` results.
- Added admin POST validation for count 1-100, profession/level/duration defaults, and date-only UTC+8 deadline normalization.
- Reworked local admin redeem_code repository to create bounded batches with one generation group id, preserve uppercase one-time creation response display, and keep list responses masked.
- Added dynamic list expiry behavior: `unused` excludes expired-by-deadline rows, `expired` includes rows whose status is expired or whose unused deadline has passed, and list rows expose `redeemDeadlineAt`.
- Added redacted audit hook for batch generation: metadata records count/scope/deadline only, not generated plaintext codes.
- Kept admin ops UI compatible with the new batch response while retaining old single-code fixture tolerance.
- Hardened `local-business-flow` e2e recovery for parallel tests sharing the dev student login under the existing single-active-session runtime.

## AC-to-Runtime Matrix

| Acceptance criterion                                            | Runtime surface                              | Current state | Implementation evidence                                                                                            | Downstream effect                                      | Remaining gap | Decision |
| --------------------------------------------------------------- | -------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------ | ------------- | -------- |
| System ops can generate redeem_code batches with a 100 limit    | `/api/v1/redeem-codes`, admin service        | implemented   | `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts` covers count 3 success and count 101 rejection     | Ops can issue bounded local card batches               | none          | pass     |
| Generated code display uses uppercase non-secret policy         | redeem_code generation/display service       | implemented   | Creation response returns uppercase code display/plaintext only once; list response remains masked and non-viewing | Ops can copy creation result while list stays redacted | none          | pass     |
| List/search/status filters include UTC+8 expiry behavior        | `/api/v1/redeem-codes`, admin list service   | implemented   | Unit test covers keyword/status/sortBy `expiresAt`; repository maps deadline-passed unused rows to expired         | Ops can find unused/used/expired codes correctly       | none          | pass     |
| Generated code can be redeemed by student into personal_auth    | `/api/v1/redeem-codes/redeem`, personal_auth | implemented   | Unit test redeems a generated uppercase code placeholder through student runtime and receives `personalAuth`       | Student receives personal authorization                | none          | pass     |
| Audit behavior covers batch generation without raw code leakage | audit_log append/list evidence               | implemented   | Unit test asserts redacted audit metadata excludes the generated-code placeholder                                  | Ops changes remain reviewable without raw code leakage | none          | pass     |

## Problem Grading

| Severity | Affected role    | Reproduction path or command                                | Expected result                                                                             | Actual result before task                                                                            | Fixed status | Residual risk                                                                 | Follow-up |
| -------- | ---------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------- | --------- |
| P1       | super_admin, ops | `/ops/users`, `/api/v1/redeem-codes`, student redeem        | batch generation, 100 limit, uppercase display, status/search filters, generated redemption | Prior audit says full redeem_code batch lifecycle and generated-code-to-student proof are incomplete | fixed        | Default local runtime only; no staging/prod or cloud verification in scope    | none      |
| P1       | audit reviewer   | redeem_code batch generation                                | redacted audit records for generation without raw code display values in evidence           | audit coverage for batch generation was incomplete/unproven                                          | fixed        | Full audit-log cross-surface consolidation remains covered by MVP-GAP-013     | none      |
| P2       | e2e runner       | `npm.cmd run test:e2e` with fully parallel Playwright tests | local business flow remains stable while another test logs in as the same dev student       | single-active-session runtime could invalidate the dev student session during parallel e2e execution | fixed        | Existing ProtectedRouteGuard hydration mismatch warning remains outside scope | follow-up |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master at 894d5c0 after prior task closeout.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-redeem-code-batch-management-loop
Result on branch codex/phase-11-mvp-redeem-code-batch-management-loop: pass while task status was pending.

npm.cmd run test:unit -- --run tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts
Result: pass, 2 files, 8 tests.

npm.cmd run test:unit -- --run tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts
Result: pass, 4 files, 17 tests.

npm.cmd run test:unit
Result: pass, 111 files, 422 tests.

npm.cmd run build
Result: pass. Next build completed TypeScript and static page generation. Output noted `.env.local` as an environment source; no `.env.local` content was read or recorded.

npm.cmd run test:e2e
First full run result before e2e hardening: 8 passed, 1 failed. Failure cause was local-business-flow being returned to login while another parallel e2e logged in with the same dev student account under the existing single-active-session runtime.

npm.cmd run test:e2e -- e2e/local-business-flow.spec.ts
Result before hardening commit: pass, 1 test.

npm.cmd run test:e2e
Result after e2e hardening: pass, 9 tests. Existing ProtectedRouteGuard hydration mismatch warnings still printed; no task-specific e2e failure remained.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result: inventory completed on task branch with expected task-scoped tracked/untracked files.

git diff --check
Result: pass.

git commit -m "feat(admin): add redeem code batch runtime"
Result: task commit `92d641e` created on `codex/phase-11-mvp-redeem-code-batch-management-loop`.

git merge --no-ff codex/phase-11-mvp-redeem-code-batch-management-loop -m "merge: phase 11 redeem code batch management loop"
Result: merge commit `360473a` created on `master`.

npm.cmd run test:unit
Post-merge result on master: pass, 111 files, 422 tests.

npm.cmd run build
Post-merge result on master: pass. Output noted `.env.local` as an environment source; no `.env.local` content was read or recorded.

npm.cmd run test:e2e
Post-merge result on master: pass, 9 tests. Existing ProtectedRouteGuard hydration mismatch warnings still printed.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Post-merge result on master: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Post-merge result on master: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Post-merge result on master: pass inventory; branch ahead of origin/master by task and merge commits only.

git diff --check
Post-merge result on master: pass.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                                                          | Result  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-redeem-code-batch-management-loop`, not `master` or `main`                                           | Pass    |
| Allowed files        | Runtime edits stayed in admin/student redeem_code surfaces, contracts, repositories, services, tests, e2e, task plan/evidence, queue state | Pass    |
| Blocked files        | No package, lockfile, env, schema, migration, script, cloud, deployment, or staging/prod file change                                       | Pass    |
| AC-to-runtime matrix | Matrix records each AC as implemented with test/runtime evidence                                                                           | Pass    |
| Problem grading      | P1 redeem_code lifecycle and audit issues graded; e2e parallel-session P2 recorded                                                         | Pass    |
| Validation record    | Unit/build/e2e validation and agent/naming/git/diff gates recorded                                                                         | Pass    |
| Evidence hygiene     | No secrets, generated plaintext redeem_code values, or prohibited raw data recorded                                                        | Pass    |
| Commit               | Task commit `92d641e` created                                                                                                              | Pass    |
| Merge                | Merge commit `360473a` created on `master`                                                                                                 | Pass    |
| Push                 | Pending                                                                                                                                    | Pending |
| Cleanup              | Pending                                                                                                                                    | Pending |
| Worktree residue     | Pending                                                                                                                                    | Pending |
| stagingDecision      | Local runtime closed; no staging/prod action approved or performed                                                                         | Pass    |
| Next step            | Push `master`, clean the short-lived branch, and then claim the next eligible MVP gap task from clean `master`                             | Pending |

## stagingDecision

local_only_passed_no_staging_or_prod_connection

## Next Step

Push `master`, clean the short-lived branch, then claim the next eligible MVP gap task from a clean `master`.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, object storage secrets, and private data.
