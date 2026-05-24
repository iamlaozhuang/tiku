# Evidence: phase-11-mvp-content-ops-paper-composition-publish-loop

## Scope

- Date: 2026-05-24
- Branch: `codex/phase-11-mvp-content-ops-paper-composition-publish-loop`
- Goal: close the local content ops paper draft/composition/publish loop gap by wiring the approved local runtime into the admin paper UI and validating service/API behavior.

## Boundary

- Local dev runtime only.
- No dependency, package, or lockfile change.
- No schema, migration, or script change.
- No `.env.local` content read or recorded.
- No staging/prod connection.
- No deployment.
- No cloud resource change.
- No real file upload or object storage operation.
- No provider call.
- No secret/env change.
- No token, Authorization header, raw provider payload, raw prompt, raw answer, raw model response, full paper/material/OCR text, generated plaintext `redeem_code` value, object storage secret, or private data recorded.

## Human Approval

- User approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup.
- Risk gates remain active for dependency, schema, migration, script, secret/env, real provider, Tencent Cloud, staging/prod, deployment, major permission model, and destructive data operations.

## AC-to-Runtime Matrix

| Acceptance criterion                               | Runtime surface                                  | Current state   | Implementation evidence                                                                                                                 | Downstream effect                          | Remaining gap                                                                          | Decision                          |
| -------------------------------------------------- | ------------------------------------------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------------------------------------------------- | --------------------------------- |
| Draft paper create/edit metadata                   | Admin UI + `/api/v1/papers`                      | partial_runtime | `admin-paper-ui.test.ts` creates a draft through protected REST runtime                                                                 | Content ops local paper write loop         | P2: this task implements create, not full metadata edit form                           | implemented local create subset   |
| Draft composition add/update/remove paper_question | Admin UI + `/api/v1/papers/{publicId}/questions` | partial_runtime | `admin-paper-ui.test.ts` adds a question; existing service tests cover update/remove constraints                                        | Content ops local composition loop         | P1: UI exposes add only; advanced section/group/scoring-point editing remains deferred | implemented local add subset      |
| Publish validation and lock/snapshot behavior      | Admin UI + `/api/v1/papers/{publicId}/publish`   | runtime_closed  | `admin-paper-ui.test.ts` publishes; `paper-draft-service.test.ts` and lifecycle route tests cover validation and lock/snapshot payloads | Content ops local publish loop             | none for local publish route                                                           | implemented                       |
| Archive/copy lifecycle                             | Admin UI + archive/copy routes                   | runtime_closed  | `admin-paper-ui.test.ts` calls archive/copy; existing service tests cover copy constraints                                              | Content ops local lifecycle                | none for archive/copy                                                                  | implemented                       |
| paper_asset metadata binding                       | Admin UI + `/api/v1/paper-assets`                | partial_runtime | `admin-paper-ui.test.ts` binds metadata and asserts object key is not rendered; route/service tests cover redaction                     | Content ops local source-file traceability | P1: real file upload/storage/download is blocked by no-cloud/no-storage boundary       | implemented metadata-only binding |
| Redacted audit evidence                            | Runtime route tests                              | runtime_closed  | `phase-9-paper-composition-lifecycle-runtime.test.ts` verifies paper and paper_asset mutations append redacted audit entries            | audit_log coverage                         | none for covered writes                                                                | implemented                       |

## Problem Grading

| Severity | Affected role | Reproduction path or command                                                                                          | Expected result                                                                                                       | Actual result before task                                                      | Fixed status                                                              | Residual risk                                                             | Follow-up                                                                  |
| -------- | ------------- | --------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| P0       | content ops   | Open `/content/papers` as `content_admin` and try new draft, compose, publish, archive, copy, and paper_asset binding | Actions reach local protected REST runtime and update UI feedback without exposing internal ids, token, or object key | Page was read-only; lifecycle buttons were disabled and explicitly unavailable | fixed for local create/add/publish/archive/copy/paper_asset metadata loop | student propagation of newly published content is not proven in this task | `phase-11-mvp-content-to-student-runtime-propagation`                      |
| P1       | content ops   | Bind original paper file from UI                                                                                      | Metadata can be bound safely; real storage remains separately approved                                                | UI had no binding action                                                       | fixed for metadata-only binding                                           | real upload/download/object storage requires separate approval            | future storage/resource task with explicit approval                        |
| P1       | content ops   | Compose sections/groups/scoring-point adjustments through UI                                                          | Full draft composition editor supports order, section/group, and scoring-point editing                                | UI had no composition action                                                   | partially fixed: add-question path wired                                  | advanced composition editor remains deferred                              | later content ops composition hardening if product requires before staging |

## Validation Results

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-content-ops-paper-composition-publish-loop
Result: pass while task status was pending.

npm.cmd run test:unit -- --run tests/unit/admin-paper-ui.test.ts
RED result before implementation: failed 1 test because the admin paper UI still kept write actions disabled and no `试卷名称` form existed.

npm.cmd run test:unit -- --run tests/unit/admin-paper-ui.test.ts
GREEN result: pass, 1 file, 5 tests.

npm.cmd run test:unit -- --run tests/unit/admin-paper-ui.test.ts tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts src/server/services/paper-draft-service.test.ts src/server/services/paper-asset-service.test.ts
Result: pass, 4 files, 23 tests.

npm.cmd run build
First result: failed TypeScript check because nullable response data was not narrowed inside state callbacks.
Second result: failed TypeScript check for the same narrowing pattern in publish/archive callbacks.
Final retry result: pass. The build command printed that `.env.local` was an environment source; no `.env.local` contents or secrets were read or recorded.

npm.cmd run test:unit
Result: pass, 107 files, 402 tests.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result: pass inventory. Current branch has only this task's tracked/untracked files and no commits ahead of origin/master before task commit.

git diff --check
Result: pass.

Resume revalidation after context recovery:

node .\node_modules\prettier\bin\prettier.cjs --write docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-24-phase-11-mvp-content-ops-paper-composition-publish-loop.md docs\05-execution-logs\evidence\2026-05-24-phase-11-mvp-content-ops-paper-composition-publish-loop.md src\features\admin\paper-management\AdminPaperManagementClient.tsx tests\unit\admin-paper-ui.test.ts
Result: pass; only evidence formatting changed.

git diff --check
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
Result: pass.

powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
Result: pass inventory. Current branch has only this task's files and no commits ahead of origin/master before task commit.

npm.cmd run test:unit -- --run tests/unit/admin-paper-ui.test.ts tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts src/server/services/paper-draft-service.test.ts src/server/services/paper-asset-service.test.ts
Result: pass, 4 files, 23 tests.

npm.cmd run build
Result: pass. The build command printed that `.env.local` was an environment source; no `.env.local` contents or secrets were read or recorded.

npm.cmd run test:unit
Result: pass, 107 files, 402 tests.
```

## Repository Hygiene Closeout Checklist

| Check                | Required evidence                                                                                                                                                                                                                                                                                      | Result  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------- |
| Branch isolation     | Current branch is `codex/phase-11-mvp-content-ops-paper-composition-publish-loop`, not `master` or `main`                                                                                                                                                                                              | Pass    |
| Allowed files        | Changed files: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, this evidence, task plan, `src/features/admin/paper-management/AdminPaperManagementClient.tsx`, `tests/unit/admin-paper-ui.test.ts`; all match queue allowedFiles and avoid blockedFiles | Pass    |
| AC-to-runtime matrix | Matrix labels partial runtime, runtime closed, residual P1/P2, and implemented decisions                                                                                                                                                                                                               | Pass    |
| Problem grading      | P0/P1 issues recorded with fixed status and residual risk                                                                                                                                                                                                                                              | Pass    |
| Validation record    | Claim readiness, RED/GREEN tests, targeted tests, build retries, full unit, readiness, naming, Git inventory, and diff check recorded                                                                                                                                                                  | Pass    |
| Evidence hygiene     | No secrets or prohibited raw data recorded                                                                                                                                                                                                                                                             | Pass    |
| Commit               | Pending                                                                                                                                                                                                                                                                                                | Pending |
| Merge                | Pending                                                                                                                                                                                                                                                                                                | Pending |
| Push                 | Pending                                                                                                                                                                                                                                                                                                | Pending |
| Cleanup              | Pending                                                                                                                                                                                                                                                                                                | Pending |
| Worktree residue     | Pending                                                                                                                                                                                                                                                                                                | Pending |
| stagingDecision      | `local_task_closed_remaining_p1` recorded                                                                                                                                                                                                                                                              | Pass    |
| Next step            | Commit, merge, push, cleanup, then claim `phase-11-mvp-content-to-student-runtime-propagation`                                                                                                                                                                                                         | Pass    |

## stagingDecision

local_task_closed_remaining_p1

## Next Step

Commit this task, merge to `master`, run post-merge closeout gates, push `master`, clean the short-lifecycle branch, then claim `phase-11-mvp-content-to-student-runtime-propagation`.

## Evidence Hygiene

This evidence intentionally excludes secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, object storage secrets, and private data.
