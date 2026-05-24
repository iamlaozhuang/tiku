# Evidence: phase-11-mvp-content-ops-question-material-write-loop

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-content-ops-question-material-write-loop`
- Goal: close the local content ops question/material write loop gap by wiring the approved local runtime into the admin UI and validating service/API behavior.

## Boundary

- Local dev runtime only.
- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No provider call.
- No secret/env change.
- No token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, generated plaintext `redeem_code` value, or private data recorded.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, real provider, Tencent Cloud, staging/prod, deployment, major permission model, and destructive data operations.

## AC-to-Runtime Matrix

| Acceptance criterion                       | Runtime surface                   | Current state   | Implementation evidence                                                                                                                                         | Downstream effect                                 | Remaining gap                                                                                                               | Decision                                                               |
| ------------------------------------------ | --------------------------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Question create/edit structured local form | Admin UI + `/api/v1/questions`    | partial_runtime | `admin-question-material-ui.test.ts` creates and edits through protected REST runtime; `question-service.test.ts` covers invalid/missing/locked update handling | Content ops can create and update local questions | P1: rich text image/table editor and first-class knowledge_node/tag authoring remain outside this no-schema/no-storage task | implemented local structured subset; residual P1 deferred to follow-up |
| Question disable/copy lifecycle            | Admin UI + question action routes | runtime_closed  | `admin-question-material-ui.test.ts` calls disable/copy routes; route/service tests cover permission and audit boundaries                                       | Content ops can manage local question lifecycle   | none                                                                                                                        | implemented                                                            |
| Material create/edit structured local form | Admin UI + `/api/v1/materials`    | partial_runtime | `admin-question-material-ui.test.ts` creates and edits through protected REST runtime; `material-service.test.ts` covers invalid/missing/locked update handling | Content ops can maintain reusable local materials | P1: image/table/file storage authoring and richer reference drill-down remain outside this no-storage task                  | implemented local structured subset; residual P1 deferred to follow-up |
| Material disable/copy lifecycle            | Admin UI + material action routes | runtime_closed  | `admin-question-material-ui.test.ts` calls disable/copy routes; route/service tests cover permission and audit boundaries                                       | Content ops can manage local material lifecycle   | none                                                                                                                        | implemented                                                            |
| Redacted audit evidence                    | Runtime route tests               | runtime_closed  | `phase-9-content-question-material-runtime.test.ts` verifies write operations through protected routes and redacted audit summaries                             | audit_log coverage for local writes               | none                                                                                                                        | implemented                                                            |

## Problem Grading

| Severity | Affected role | Reproduction path or command                                                                              | Expected result                                                                                                        | Actual result before task                                                                                                    | Fixed status                                               | Residual risk                                                                                                                                                | Follow-up                                                                      |
| -------- | ------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| P1       | content ops   | Open `/content/questions` or `/content/materials` as `content_admin` and attempt create/edit/disable/copy | Write loop reaches protected local runtime and updates list state without exposing internal ids or session token in UI | Entry was read-only; action buttons were disabled and showed a local runtime unavailable message                             | fixed for local structured question/material write loop    | full rich text image/table/file storage, knowledge_node/tag authoring, and richer reference drill-down remain outside approved no-schema/no-storage boundary | future content enrichment tasks; requires approval if schema/storage is needed |
| P2       | content ops   | Edit a locked question/material through the service update path                                           | Locked records cannot be edited                                                                                        | Service already rejected locked updates; UI now reaches the same protected runtime but still surfaces a generic save failure | existing service control verified; UI copy remains generic | better locked-record action messaging is a usability improvement, not a runtime bypass                                                                       | add to later content ops polish backlog if required                            |

## Validation Results

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-content-ops-question-material-write-loop
Result: pass while task status was pending.

npm.cmd run test:unit -- --run tests/unit/admin-question-material-ui.test.ts
RED result before implementation completion: failed 2 tests because the admin UI still required disabled write buttons and did not open write forms.

npm.cmd run test:unit -- --run tests/unit/admin-question-material-ui.test.ts
GREEN result: pass, 1 file, 6 tests.

npm.cmd run test:unit -- --run tests/unit/admin-question-material-ui.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts src/server/services/question-service.test.ts src/server/services/material-service.test.ts
Result: pass, 4 files, 17 tests.

npm.cmd run test:unit
Result: pass, 107 files, 401 tests.

npm.cmd run build
First result: failed TypeScript check because nullable response data was not narrowed inside state callbacks.
Retry result after local fix: pass. Next.js build completed route generation. The build command printed that `.env.local` was an environment source; no `.env.local` contents or secrets were read or recorded.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

git diff --check
Result: pass.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                                                                                                                                                                                                                                                         | Result  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-content-ops-question-material-write-loop`, not `master` or `main`                                                                                                                                                                                                                                   | Pass    |
| Allowed files        | Changed files: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, this evidence, task plan, `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`, `tests/unit/admin-question-material-ui.test.ts`; all match queue allowedFiles and avoid blockedFiles | Pass    |
| AC-to-runtime matrix | Matrix labels partial runtime, runtime closed, residual P1, and implemented decisions                                                                                                                                                                                                                                                     | Pass    |
| Problem grading      | P1/P2 issues recorded with fixed status and residual risk                                                                                                                                                                                                                                                                                 | Pass    |
| Validation record    | Claim readiness, RED/GREEN tests, targeted tests, full unit, build, readiness, naming, and diff check recorded                                                                                                                                                                                                                            | Pass    |
| Evidence hygiene     | No secrets or prohibited raw data recorded                                                                                                                                                                                                                                                                                                | Pass    |
| Commit               | Pending                                                                                                                                                                                                                                                                                                                                   | Pending |
| Merge                | Pending                                                                                                                                                                                                                                                                                                                                   | Pending |
| Push                 | Pending                                                                                                                                                                                                                                                                                                                                   | Pending |
| Cleanup              | Pending                                                                                                                                                                                                                                                                                                                                   | Pending |
| Worktree residue     | Pending                                                                                                                                                                                                                                                                                                                                   | Pending |
| stagingDecision      | Pending                                                                                                                                                                                                                                                                                                                                   | Pending |
| Next step            | Pending                                                                                                                                                                                                                                                                                                                                   | Pending |

## stagingDecision

local_task_closed_remaining_p1

## Next Step

Commit this task, merge to `master`, run post-merge closeout gates, push `master`, clean the short-lifecycle branch, then claim `phase-11-mvp-paper-draft-composition-publish-loop`.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, and private data.
