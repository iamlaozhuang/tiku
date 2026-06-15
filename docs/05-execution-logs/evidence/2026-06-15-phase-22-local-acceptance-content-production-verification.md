# Evidence: Phase 22 Content Production Local Acceptance Verification

## Summary

- Task id: `phase-22-local-acceptance-content-production-verification`
- Branch: `codex/phase-22-local-acceptance-content-production-verification`
- Baseline: `b58cc4d3404bf5efc82b0484050076defe553040`
- Result: `blocked_validation_failure`
- Stop reason: normal admin login produces a valid cookie-backed session, but content admin pages still require
  `tiku.localSessionToken`/bearer authorization for content APIs. Fixing the gap requires `src/**` changes, which are
  blocked for this verification-only task.

## Redaction Boundary

No generated phone number, password, token, cookie, Authorization header, database URL, card-code plaintext, public
identifier value, row data, raw private data, provider payload, prompt, or answer content is recorded here.

The fixture script used only the local dev DB connection needed for this task and did not output the connection string.
Temporary scripts were created outside the repository and removed after execution.

## Startup State

- Startup command sequence: `git switch master`, `git fetch --prune origin`
- Startup `HEAD` / `master` / `origin/master`: `b58cc4d3404bf5efc82b0484050076defe553040`
- Worktree before task claim: clean
- Local `codex/*` residue before claim: none observed
- Remote `origin/codex/*` residue before claim: none observed

## Local Runtime

- Dev server: `http://127.0.0.1:3201`
- Scope: localhost-only local acceptance observation
- Fixture path: existing ORM plus application API/UI only
- Fixture role: local `content_admin`
- No raw SQL, seed/bootstrap script, schema/drizzle change, migration, destructive DB operation, dependency change, or
  `.env*` modification was used.

## API Evidence

All values below are redacted status summaries only.

| Observation                                        | HTTP | API code | Result           | Notes                                                                                |
| -------------------------------------------------- | ---: | -------: | ---------------- | ------------------------------------------------------------------------------------ |
| `session.login.content_admin`                      |  200 |        0 | `local_verified` | Token presence observed as boolean only; admin role count was 1.                     |
| `session.current.authorization_header`             |  200 |        0 | `local_verified` | Authorization-header session read returned admin role count 1.                       |
| `knowledge_node.create`                            |  200 |        0 | `local_verified` | Entity presence observed as boolean only.                                            |
| `material.create`                                  |  200 |        0 | `local_verified` | Entity presence observed as boolean only.                                            |
| `question.create.with_material_knowledge_node_tag` |  200 |        0 | `local_verified` | Material, knowledge node, and tag binding path was requested and returned an entity. |
| `question.list.filter.knowledge_node_tag`          |  200 |        0 | `local_verified` | Filtered count was 1.                                                                |
| `material.copy`                                    |  200 |        0 | `local_verified` | Copy returned an entity.                                                             |
| `paper.create`                                     |  200 |        0 | `local_verified` | Entity presence observed as boolean only.                                            |
| `paper_asset.create.metadata_only`                 |  200 |        0 | `metadata_only`  | JSON metadata path only; no binary/object-storage/OCR/public URL validation.         |
| `paper_question.add_with_section_group`            |  200 |        0 | `local_verified` | `paper_section` and `question_group` composition path returned an entity.            |
| `paper.publish`                                    |  200 |        0 | `local_verified` | Publish validation issue count was 0.                                                |
| `paper.archive`                                    |  200 |        0 | `local_verified` | Archive returned an entity.                                                          |
| `paper.copy.archived_source`                       |  200 |        0 | `local_verified` | Archived source copy returned an entity.                                             |
| `paper_asset.list.by_paper`                        |  200 |        0 | `metadata_only`  | Filtered metadata count was 1.                                                       |

## Browser-First Observation

- Target: `http://127.0.0.1:3201/content/papers`
- Result: Browser observation reached the content URL and showed a login-oriented state without a local session token.
- Browser sandbox could not safely perform credentialed login without exposing generated login material, so credentialed
  UI verification used Playwright fallback.

## Playwright Fallback UI Evidence

Credentialed UI observation kept generated login material in-process and redacted from output.

| Observation                                                 | Result                    |
| ----------------------------------------------------------- | ------------------------- |
| Normal admin login redirected to an admin destination       | true                      |
| `/api/v1/sessions` after login returned HTTP 200 / `code=0` | true                      |
| Admin role count after login                                | 1                         |
| Admin public id presence after login                        | true                      |
| `tiku.localSessionToken` after login                        | false                     |
| `/content/papers` URL after navigation                      | content page URL observed |
| `/content/papers` `data-admin-ux-state`                     | `permission-denied`       |
| `/api/v1/papers` without bearer header                      | HTTP 200 / `code=401001`  |

## Status Vocabulary Mapping

- `material`: `local_verified`
- `question`: `local_verified`
- `knowledge_node`: `local_verified`
- `tag`: `local_verified` through minimal ORM fixture plus API question binding/filter observation
- `paper`: `local_verified`
- `paper_section`: `local_verified` through paper-question composition
- `paper_asset`: `metadata_only`; binary upload/object storage/OCR/public URL remain `staging_blocked`
- Content admin UI after normal login: `needs_recheck` / `blocked_validation_failure`

## Blocked Gate

The content-production API chain works with a bearer token. The normal login flow intentionally keeps session
persistence server-side and does not expose a bearer token to client storage. The content admin runtime still depends on
`tiku.localSessionToken` for content APIs, so the normal logged-in admin path cannot complete `/content/papers`.

Repair requires changing source behavior under `src/**` either to make content admin APIs accept cookie-backed sessions
or to change the approved client session boundary. Both are outside this task's allowed files. The task stops here and
does not claim the next seeded candidate.

## Validation Commands

| Command                                                                                                         | Result                | Notes                                                                                                                                                   |
| --------------------------------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sensitive evidence pattern scan on current task docs                                                            | pass                  | No generated credential, bearer value, DB URL, dynamic public identifier value, or phone-pattern fixture was found in task docs.                        |
| `git diff --check`                                                                                              | pass                  | No whitespace errors.                                                                                                                                   |
| `npm.cmd run lint`                                                                                              | pass                  | ESLint completed successfully.                                                                                                                          |
| `npm.cmd run typecheck`                                                                                         | pass                  | `tsc --noEmit` completed successfully.                                                                                                                  |
| `Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                            | pass                  | Inventory completed; branch has task docs/state changes only.                                                                                           |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-content-production-verification`      | pass                  | Scope scan covered 5 files and passed.                                                                                                                  |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-content-production-verification` | fail_expected_blocked | Failed because this evidence is intentionally not `pass`, closeout/batch/pass metadata is absent, and the task is stopped at a blocked validation gate. |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-content-production-verification`        | pass                  | Pre-push readiness script passed, but push is not performed because the task did not pass local acceptance.                                             |

## Explicit Blocked Remainders

- Cost Calibration Gate remains blocked.
- Source repair under `src/**` remains blocked.
- Tests/e2e/schema/drizzle/scripts/dependency/env changes remain blocked.
- Merge, push, PR, force-push, staging/prod/cloud/deploy, payment, external-service, provider/model call, and
  quota/cost work remain blocked for this task outcome.
- Thread rollover decision: no rollover requested; preserve this branch and evidence for fresh user decision.
- Next module run candidate: do not claim task 3 until fresh instruction resolves this task 2 validation gap.

## V5 Repair Attempt Addendum

Fresh approval v5 allowed continuing current task 2 only, with exact source repair limited to content admin runtime,
content/question/material runtime, paper lifecycle runtime, RAG resource/knowledge runtime, and minimal corresponding
unit tests. Task 3 was not claimed.

### Unit Evidence

| Command                                                                                                                                                                                                                            | Result         | Notes                                                                                                                                                   |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- tests/unit/phase-22-content-admin-cookie-session-repair.test.ts`                                                                                                                                         | red_then_green | Initially failed on missing cookie-backed helper/runtime behavior; passed after scoped repair.                                                          |
| `npm.cmd run test:unit -- tests/unit/phase-22-content-admin-cookie-session-repair.test.ts tests/unit/admin-paper-ui.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts` | pass           | 4 files / 51 tests passed. Existing UI tests were aligned to allow only the cookie-backed `/api/v1/sessions` probe when local bearer storage is absent. |
| `git diff --check`                                                                                                                                                                                                                 | pass           | No whitespace errors after v5 repair attempt.                                                                                                           |
| `npm.cmd run lint`                                                                                                                                                                                                                 | pass           | ESLint completed successfully after v5 repair attempt.                                                                                                  |
| `npm.cmd run typecheck`                                                                                                                                                                                                            | pass           | `tsc --noEmit` completed successfully after v5 repair attempt.                                                                                          |

### Local Cookie-Backed Verification

Redacted local Playwright verification used a minimal ORM-created `content_admin` fixture. The script only materialized
the local `DATABASE_URL` in process and did not output account, password, cookie, token, Authorization header, DB URL,
publicId, row data, or private data.

| Observation                                                 | Result                   |
| ----------------------------------------------------------- | ------------------------ |
| Normal login redirected to admin destination                | true                     |
| `/api/v1/sessions` after login returned HTTP 200 / `code=0` | true                     |
| Admin role count after login                                | 1                        |
| `tiku.localSessionToken` after login                        | false                    |
| `/content/papers` page state                                | `ready`                  |
| Cookie-backed `/api/v1/questions` without bearer            | HTTP 200 / `code=0`      |
| Cookie-backed `/api/v1/materials` without bearer            | HTTP 200 / `code=0`      |
| Cookie-backed `/api/v1/knowledge-nodes` without bearer      | HTTP 200 / `code=0`      |
| Cookie-backed `/api/v1/resources` without bearer            | HTTP 200 / `code=0`      |
| Cookie-backed GET `/api/v1/papers` without bearer           | HTTP 200 / `code=401001` |

### New Blocked Gate

GET `/api/v1/papers` is wired to `createAdminFlowRuntimeRouteHandlers().papers.collection.GET`, not the v5-approved
`paper-composition-lifecycle-runtime` file. Completing the remaining cookie-backed paper list repair therefore requires
editing `src/server/services/admin-flow-runtime.ts` and minimal corresponding tests. That file is outside v5
allowedFiles, so task 2 stops again as `blocked_validation_failure`. No merge, push, PR, force push, or task 3 claim was
performed.

## V6 Repair and Verification Addendum

Fresh approval v6 allowed continuing current task 2 only, adding `src/server/services/admin-flow-runtime.ts` and minimal
corresponding unit coverage to current task allowedFiles. Task 3 was not claimed.

### V6 RED/GREEN Unit Evidence

| Command                                                                                                                                                                                                                                                                                | Result       | Notes                                                                          |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- tests/unit/phase-22-content-admin-cookie-session-repair.test.ts` before implementation                                                                                                                                                                       | red_expected | 1 failure: admin-flow paper list cookie-backed session returned `code=401001`. |
| `npm.cmd run test:unit -- tests/unit/phase-22-content-admin-cookie-session-repair.test.ts` after implementation                                                                                                                                                                        | pass         | 1 file / 6 tests passed.                                                       |
| `npm.cmd run test:unit -- tests/unit/phase-22-content-admin-cookie-session-repair.test.ts tests/unit/admin-paper-ui.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-7-admin-flow-runtime-smoke.test.ts` | pass         | 5 files / 54 tests passed.                                                     |

### V6 Local Cookie-Backed Verification

Redacted Playwright/API verification used a minimal ORM-created local `content_admin` fixture. The script reused the
project runtime DB loader in process and did not output account, password, token, cookie, Authorization header, DB URL,
publicId, row data, or private data.

| Observation                                            | HTTP | API code | Result           |
| ------------------------------------------------------ | ---: | -------: | ---------------- |
| `session.login.content_admin`                          |  200 |        0 | `local_verified` |
| `session.current.cookie_backed`                        |  200 |        0 | `local_verified` |
| Cookie-backed `/api/v1/materials` without bearer       |  200 |        0 | `local_verified` |
| Cookie-backed `/api/v1/questions` without bearer       |  200 |        0 | `local_verified` |
| Cookie-backed `/api/v1/papers` without bearer          |  200 |        0 | `local_verified` |
| Cookie-backed `/api/v1/paper-assets` without bearer    |  200 |        0 | `metadata_only`  |
| Cookie-backed `/api/v1/knowledge-nodes` without bearer |  200 |        0 | `local_verified` |
| Cookie-backed `/api/v1/resources` without bearer       |  200 |        0 | `local_verified` |
| `/content/papers` UI state after normal login          |  n/a |      n/a | `ready`          |
| `tiku.localSessionToken` after normal login            |  n/a |      n/a | `false`          |

### V6 Status Vocabulary Mapping

- `material`: `local_verified`
- `question`: `local_verified`
- `knowledge_node`: `local_verified`
- `tag`: `local_verified` through prior task 2 API question binding/filter evidence
- `paper`: `local_verified`
- `paper_section`: `local_verified` through prior task 2 paper-question composition evidence
- `paper_asset`: `metadata_only`; binary upload/object storage/OCR/public URL remain `staging_blocked`
- Content admin UI normal-login paper list: `local_verified`

### V6 Remaining Blocked Remainders

- `paper_asset` binary upload, object storage, OCR, and public URL validation remain `staging_blocked`.
- Cost Calibration Gate, provider/model calls, quota/cost work, staging/prod/cloud/deploy/payment/external-service,
  PR, force push, dependency changes, schema/drizzle/migration/e2e/script edits, raw SQL, seed/bootstrap scripts,
  destructive DB operations, and `.env*` modification/disclosure remain blocked.

## Batch 1: Phase 22 Task 2 V6 Closeout

result: pass

- Batch range: single current task batch for `phase-22-local-acceptance-content-production-verification`.
- RED: focused admin-flow paper list cookie-backed unit test failed before implementation with `code=401001`.
- GREEN: focused test passed after admin-flow used the existing session-cookie authorization boundary; related UI/runtime
  tests passed.
- Commit: `b58cc4d3404bf5efc82b0484050076defe553040` pre-closeout baseline before the local task commit. The final local
  task commit SHA is reported after commit creation and merge.
- localFullLoopGate: pass. Local unit, lint, typecheck, and redacted localhost API/UI verification passed for the current
  task scope.
- nextModuleRunCandidate: do not claim task 3 until task 2 is committed, fast-forward merged to `master`, pushed to
  `origin/master`, cleaned, and `master == origin/master` is confirmed.

### V6 Validation Commands

| Command                                                                                                                                                                                                                                                                                | Result | Notes                                                         |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                                                                                                                                     | pass   | No whitespace errors.                                         |
| `npm.cmd run test:unit -- tests/unit/phase-22-content-admin-cookie-session-repair.test.ts tests/unit/admin-paper-ui.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-content-knowledge-ops-baseline.test.ts tests/unit/phase-7-admin-flow-runtime-smoke.test.ts` | pass   | 5 files / 54 tests passed.                                    |
| `npm.cmd run lint`                                                                                                                                                                                                                                                                     | pass   | ESLint completed successfully.                                |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                                                | pass   | `tsc --noEmit` completed successfully.                        |
| `Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                                                                                                                                                                   | pass   | Inventory completed; branch contains current task files only. |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-content-production-verification`                                                                                                                                                                             | pass   | Scope scan covered 14 files and passed.                       |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-content-production-verification`                                                                                                                                                                        | pass   | Strict evidence anchors and blocked remainders recorded.      |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-content-production-verification`                                                                                                                                                                               | pass   | Pre-push readiness passed before local commit/merge.          |
