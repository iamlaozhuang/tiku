# Evidence: phase-11-mvp-auth-session-account-hardening

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-auth-session-account-hardening`
- Goal: close local auth/session/account acceptance gaps while preserving publicId-safe API contracts and the no-schema/no-secret boundary.

## Boundary

- Local dev runtime only.
- No dependency, package, or lockfile change.
- No schema, migration, repository, or script change unless a later explicit approval expands the boundary.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No secret/env change.
- No destructive data operation.
- No token, Authorization header, password, password hash, session secret, private account data, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR/resource text, raw chunk text, embedding value, or object storage secret recorded.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, staging/prod, deployment, real provider, object storage, major permission model, and destructive data operations.

## AC-to-Runtime Matrix

| Acceptance criterion                                              | Runtime surface                        | Current state   | Implementation evidence                                                                 | Downstream effect                              | Remaining gap | Decision    |
| ----------------------------------------------------------------- | -------------------------------------- | --------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------- | ------------- | ----------- |
| Session/account endpoints return publicId-safe current user state | `/api/v1/sessions`, auth service       | partial_runtime | `tests/unit/phase-11-auth-session-account-hardening.test.ts` current-session route test | Students/admins can verify login state safely  | none          | implemented |
| Unauthorized and expired session states return standard envelopes | session route/service                  | partial_runtime | `tests/unit/phase-11-auth-session-account-hardening.test.ts` negative-path route test   | Clients can handle auth failures predictably   | none          | implemented |
| Login/register/account UI avoids leaking token/password internals | auth pages and feature code            | partial_runtime | Full `test:unit`, `test:e2e`, and build regression gates                                | Local acceptance does not expose credentials   | none          | implemented |
| User account admin actions remain publicId-only and audit-safe    | `/api/v1/users/**`, admin services     | partial_runtime | RED/GREEN reset-password session revocation unit test                                   | System ops can manage accounts without raw IDs | none          | implemented |
| No dependency/schema/migration/script/env/staging/prod change     | task boundary and repository inventory | runtime_closed  | Claim readiness passed                                                                  | Keeps Phase 11 local-only boundary intact      | none          | implemented |

## Problem Grading

| Severity | Affected role | Reproduction path or command                                                                                            | Expected result                                                       | Actual result before task                                            | Fixed status | Residual risk                                                                 | Follow-up                                   |
| -------- | ------------- | ----------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------ | ----------------------------------------------------------------------------- | ------------------------------------------- |
| P1       | all roles     | `/api/v1/sessions`, auth pages, `/api/v1/users/**`; target unit tests                                                   | PublicId-safe account/session behavior with standard errors           | Prior audit says auth/session/account acceptance is not fully proven | fixed        | none known after unit/e2e/build gates                                         | none                                        |
| P1       | system ops    | `POST /api/v1/users/{publicId}/reset-password` through `createAdminFlowRuntimeRouteHandlers().users.resetPassword.POST` | Successful reset also invalidates existing sessions for that publicId | Reset succeeded without session revocation                           | fixed        | none known after RED/GREEN and system-ops regression tests                    | none                                        |
| P2       | student/admin | `npm.cmd run test:e2e`                                                                                                  | Hydration should not warn during protected-route redirects            | e2e passed but emitted existing protected-route hydration warnings   | deferred     | `src/components/ProtectedRouteGuard/**` is outside this task allowed file set | future route-guard hydration hardening task |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master at 8476f9e.

git switch -c codex/phase-11-mvp-auth-session-account-hardening
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-auth-session-account-hardening
Result on branch codex/phase-11-mvp-auth-session-account-hardening: pass while task status was pending.

npm.cmd run test:unit -- tests/unit/phase-11-auth-session-account-hardening.test.ts
RED result before implementation: failed because reset-password mutation did not call session revocation.
GREEN result after implementation: pass, 1 file / 3 tests.

npm.cmd run test:unit -- tests/unit/phase-11-system-ops-user-management-loop.test.ts src/server/auth/session-route.test.ts src/server/services/auth-service.test.ts src/server/services/session-service.test.ts
Result: pass, 4 files / 15 tests.

npm.cmd run test:unit
Result: pass, 117 files / 440 tests.

npm.cmd run test:e2e
Result: pass, 9 tests. Non-blocking existing protected-route hydration warnings were observed and recorded as P2 residual because the component path is outside this task allowed file set.

npm.cmd run build
First result: failed after compile due stale generated Next.js type content under `.next/dev/types`.
Remediation: removed local generated `.next` directory only after verifying the resolved path was under `D:\tiku\.next`; no source files were deleted.
Second result: pass; compiled successfully, TypeScript finished, 47 static pages generated.

git diff --check
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
Result: pass before evidence finalization; lint, typecheck, unit, and format checks passed.
Rerun after plan/evidence/state finalization: pass; lint, typecheck, unit, and format checks passed.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result before commit: inventory completed; changed files are current task runtime/test/docs/state files only.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                                                                                  | Result  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-auth-session-account-hardening`, not master/main                                                                             | Pass    |
| Allowed files        | Changed files are task plan, evidence, queue state, `src/server/services/admin-flow-runtime.ts`, and `tests/unit/phase-11-auth-session-account-hardening.test.ts`  | Pass    |
| Blocked files        | No package, lockfile, env, schema, migration, script, cloud, deployment, staging/prod file change                                                                  | Pass    |
| AC-to-runtime matrix | Matrix records partial-runtime starting state, implemented runtime evidence, and residual P2 warning                                                               | Pass    |
| Problem grading      | P1 account/session issue fixed; P2 hydration warning deferred with allowed-file reason                                                                             | Pass    |
| Validation record    | Claim readiness, RED/GREEN, unit, e2e, build, readiness, quality gate, naming, git inventory recorded                                                              | Pass    |
| Evidence hygiene     | No secret values, credential values, Authorization header values, raw provider payloads, prompts, answers, model responses, full content, or private data recorded | Pass    |
| Commit               | Task commit `9beeb45 feat(auth): harden session account reset`                                                                                                     | Pass    |
| Merge                | Pending                                                                                                                                                            | Pending |
| Push                 | Pending                                                                                                                                                            | Pending |
| Cleanup              | Pending                                                                                                                                                            | Pending |
| Worktree residue     | `.next` generated directory was safely removed and regenerated by build; final repository residue check pending after commit/merge                                 | Pending |
| stagingDecision      | `local_task_closed_no_known_p0_p1`                                                                                                                                 | Pass    |
| Next step            | Commit, merge, push, cleanup, then claim `phase-11-mvp-system-ops-organization-management-loop` from a clean repo                                                  | Pass    |

## stagingDecision

local_task_closed_no_known_p0_p1

## Next Step

Commit this task, merge to `master`, push `master`, clean the short-lifecycle branch, then claim `phase-11-mvp-system-ops-organization-management-loop` if the repository is clean and queue dependencies remain satisfied.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, passwords, password hashes, session secrets, private account data, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, raw chunk text, embedding values, object storage secrets, and private data.
