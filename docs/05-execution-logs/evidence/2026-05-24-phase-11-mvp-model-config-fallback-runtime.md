# Evidence: phase-11-mvp-model-config-fallback-runtime

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-model-config-fallback-runtime`
- Goal: close local mock-provider-first model_config / prompt_template primary/fallback runtime evidence with safe admin visibility, service consumption, and redacted ai_call_log snapshots.

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

## AC-to-Runtime Matrix

| Acceptance criterion                                                             | Runtime surface                                         | Current state | Implementation evidence                                                                                                                  | Downstream effect                                            | Remaining gap                                                                       | Decision                           |
| -------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------- |
| MVP-GAP-005: configurable AI model usage with primary/fallback is proven locally | `/api/v1/model-configs`, AI service selection logic     | implemented   | `tests/unit/phase-11-model-config-fallback-runtime.test.ts` covers primary, fallback, disabled scoring fallback, and mismatched fallback | AI services consume safe local config rather than hardcoding | none                                                                                | implemented                        |
| Prompt template versioning is visible and snapshotted                            | service snapshot, `ai_call_log`, admin API/service      | implemented   | Resolver and mistake_book runtime tests assert prompt key/version/hash snapshots                                                         | Call evidence remains repeatable after config changes        | none                                                                                | implemented                        |
| Key masking and secret hygiene are preserved                                     | admin model config API/service                          | implemented   | `tests/unit/admin-ai-audit-log-ops-baseline.test.ts` asserts masked `apiKeyDisplay` only and no raw secret fields                        | Super-admin can inspect config without secret leakage        | none                                                                                | implemented                        |
| Primary/fallback consumption is reflected in business AI runtimes                | mock_exam, mistake_book, report, content recommendation | implemented   | `student-flow-runtime` consumes resolver for scoring/report; mistake_book runtime test proves fallback snapshot in `ai_call_log`         | Student AI outputs use reviewable config metadata            | content recommendation stays on existing local static config until queued kn task   | implemented with bounded follow-up |
| ai_call_log redaction and metadata evidence                                      | `/api/v1/ai-call-logs`, service append/list/summary     | implemented   | mistake_book fallback test captures redacted log metadata; admin tests keep logs summary-only and raw-payload-free                       | Ops can audit AI config behavior safely                      | deeper log coverage remains queued in `phase-11-mvp-ai-call-log-coverage-hardening` | implemented with bounded follow-up |

## Problem Grading

| Severity | Affected role                    | Reproduction path or command                                              | Expected result                                                                                       | Actual result before task                                                                      | Fixed status              | Residual risk                                             | Follow-up                                     |
| -------- | -------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------- | --------------------------------------------------------- | --------------------------------------------- |
| P0       | super_admin, system ops, student | `/ops/ai-audit-logs`, `/api/v1/model-configs`, AI runtime selection audit | model_config primary/fallback, prompt_template snapshots, key masking, and ai_call_log metadata prove | Config surface existed, but runtime selection was hardcoded/unproven                           | fixed                     | real provider credential persistence remains out of scope | queued follow-up only with approval           |
| P1       | system ops, content_admin        | `ai_call_log` review after local AI actions                               | selected model/prompt metadata appears without raw prompt/answer/provider payload                     | isolated services had redaction, but primary/fallback path did not prove selected config usage | fixed for student AI path | deeper cross-feature log coverage queued                  | `phase-11-mvp-ai-call-log-coverage-hardening` |

## Validation Results

```text
git status --short --branch
Result before claim: clean master aligned with origin/master after prior task closeout push f7ca4de.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-model-config-fallback-runtime
Result on branch codex/phase-11-mvp-model-config-fallback-runtime: pass while task status was pending.

npm.cmd run test:unit -- --run tests/unit/phase-11-model-config-fallback-runtime.test.ts
RED result before implementation: failed because @/server/services/model-config-runtime did not exist.

npm.cmd run test:unit -- --run tests/unit/phase-11-model-config-fallback-runtime.test.ts
GREEN result after resolver implementation: 1 file passed, 4 tests passed.

npm.cmd run test:unit -- --run tests/unit/phase-11-model-config-fallback-runtime.test.ts tests/unit/phase-8-student-mistake-book-runtime.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts
Result: 3 files passed, 16 tests passed.

npm.cmd run typecheck
Result: pass. First sandbox attempt hit EPERM reading local TypeScript CLI under node_modules; rerun with approved escalation passed.

npm.cmd run test:unit
Result: 108 files passed, 411 tests passed.

npm.cmd run build
Result: pass. Next.js build compiled successfully and generated 47 static pages. Build output reported the presence of .env.local as an environment source; no .env.local content was read or recorded.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result before commit: inventory completed; branch contains only current-task tracked/untracked changes.

git diff --check
Result: pass.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                    | Result  |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-model-config-fallback-runtime`, not `master` or `main`         | Pass    |
| Allowed files        | Runtime, admin API/service baseline, unit tests, task plan/evidence, and state/queue only            | Pass    |
| Blocked files        | No package, lockfile, env, schema, migration, script, cloud, deployment, or staging/prod file change | Pass    |
| AC-to-runtime matrix | Matrix records implemented decisions and bounded follow-ups                                          | Pass    |
| Problem grading      | P0/P1 issues recorded with fixed status and follow-ups                                               | Pass    |
| Validation record    | RED, targeted GREEN, full unit, typecheck, build, readiness, naming, and diff-check recorded         | Pass    |
| Evidence hygiene     | No secrets or prohibited raw data recorded                                                           | Pass    |
| Commit               | Pending                                                                                              | Pending |
| Merge                | Pending                                                                                              | Pending |
| Push                 | Pending                                                                                              | Pending |
| Cleanup              | Pending                                                                                              | Pending |
| Worktree residue     | No new worktree or dependency/cache directory introduced                                             | Pass    |
| stagingDecision      | Local-only; no staging/prod action                                                                   | Pass    |
| Next step            | Commit, merge to `master`, push approved `master`, cleanup branch, then claim next queue task        | Pass    |

## stagingDecision

local_only_complete_no_staging_or_prod

## Next Step

Commit this task, merge to `master`, push approved `master`, clean the short-lived branch, then claim the next eligible queue task from clean `master`.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, object storage secrets, and private data.
