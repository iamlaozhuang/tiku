# Role Workflow Experience Walkthrough From Code Baseline Evidence

Task id: `role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`

Branch: `codex/role-workflow-experience-walkthrough-from-code-baseline`

Evidence status: blocked

result: blocked

This evidence records a bounded local role/workflow walkthrough attempt. It does not claim runtime pass, release
readiness, final Pass, production usability, Cost Calibration, deployment, Provider success, or DB-backed acceptance.

Cost Calibration Gate remains blocked.

## Scope Boundary

| Boundary                                                               | Status                                 |
| ---------------------------------------------------------------------- | -------------------------------------- |
| Source/test/package/schema edits                                       | `not_executed_blocked`                 |
| Direct DB connection or raw row inspection by Agent                    | `not_executed_blocked`                 |
| Provider call or Provider configuration read                           | `not_executed_blocked`                 |
| Env/credential/session/cookie/localStorage/Authorization header output | `not_recorded`                         |
| Browser/dev-server/runtime walkthrough                                 | `executed_localhost_existing_server`   |
| Staging/prod deploy, PR, force push, Cost Calibration                  | `not_executed_blocked`                 |
| Evidence redaction                                                     | `passed_summary_only_no_raw_artifacts` |
| Release readiness / final Pass / production usability claim            | `not_claimed`                          |

## Read Baseline

| Source                                                                                                       | Status |
| ------------------------------------------------------------------------------------------------------------ | ------ |
| `AGENTS.md`                                                                                                  | `read` |
| `docs/03-standards/code-taste-ten-commandments.md`                                                           | `read` |
| `docs/02-architecture/adr/`                                                                                  | `read` |
| `docs/04-agent-system/state/project-state.yaml`                                                              | `read` |
| `docs/04-agent-system/state/task-queue.yaml`                                                                 | `read` |
| `docs/01-requirements/00-index.md`                                                                           | `read` |
| `docs/01-requirements/advanced-edition/00-index.md`                                                          | `read` |
| `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`                          | `read` |
| `docs/01-requirements/traceability/2026-07-02-requirements-code-implementation-alignment-audit.md`           | `read` |
| `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`                  | `read` |
| `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`                   | `read` |
| `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`                                    | `read` |
| `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`                        | `read` |
| `docs/05-execution-logs/evidence/2026-07-02-requirements-code-implementation-alignment-audit.md`             | `read` |
| `docs/05-execution-logs/audits-reviews/2026-07-02-requirements-code-implementation-alignment-audit.md`       | `read` |
| Selected `e2e/**`, `src/server/auth/**`, `src/app/(auth)/login/page.tsx`, admin/student runtime auth helpers | `read` |

## Runtime Commands

| Command summary                                                                                       | Result   | Redacted observation                                                                             |
| ----------------------------------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------------------------ |
| `npm.cmd exec -- playwright test ... --reporter=line`                                                 | `failed` | Playwright did not enter tests because `127.0.0.1:3000` was already in use.                      |
| `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd exec -- playwright test ... --reporter=line` | `failed` | Existing localhost server was reused; selected role/workflow suite returned `0/6` passing tests. |

The first command is classified as setup failure only. The second command is the functional walkthrough observation.

## Runtime Failure Summary

| Area                                      | Observed status | Failure class                                 | Notes                                                                                   |
| ----------------------------------------- | --------------- | --------------------------------------------- | --------------------------------------------------------------------------------------- |
| Content/admin role denial fixture         | `failed`        | `fixture_or_route_contract_mismatch`          | Two browser denial checks timed out waiting for protected API responses.                |
| Baseline role login/session API flow      | `failed`        | `stale_e2e_session_token_contract`            | Existing local e2e expected a client-visible session token in login response data.      |
| Organization training/analytics/AI        | `not_reached`   | `blocked_by_stale_e2e_session_token_contract` | The organization flow did not reach training, analytics, or organization AI assertions. |
| Personal learner AI local request         | `not_reached`   | `blocked_by_stale_e2e_session_token_contract` | The local AI request flow did not reach request/summary assertions.                     |
| Student practice/mock/report/mistake_book | `not_reached`   | `login_ui_or_session_contract_mismatch`       | Browser login did not reach a usable post-login state in this run.                      |

No raw DOM, screenshot, trace, credential, token, session, cookie, localStorage value, Authorization header, Provider
payload, prompt, raw AI output, raw DB row, internal id, PII, plaintext `redeem_code`, or full content is recorded.

## Acceptance Mapping Result

| Role/workflow target                       | Stage 3 result | Current mapping decision                                      |
| ------------------------------------------ | -------------- | ------------------------------------------------------------- |
| `content_admin` denied from system ops     | `blocked`      | Recheck after admin fixture cookie/current-session alignment. |
| `ops_admin` denied from content authoring  | `blocked`      | Recheck after admin fixture cookie/current-session alignment. |
| Baseline local roles                       | `blocked`      | Recheck after e2e login/session helper alignment.             |
| `org_standard_admin` advanced denial       | `not_reached`  | Blocked by session contract mismatch.                         |
| `org_advanced_admin` organization workflow | `not_reached`  | Blocked by session contract mismatch.                         |
| Employee organization training             | `not_reached`  | Blocked by session contract mismatch.                         |
| Personal learner AI local-contract flow    | `not_reached`  | Blocked by session contract mismatch.                         |
| Student practice/mock/report/mistake_book  | `not_reached`  | Blocked by browser login/session contract mismatch.           |

## Static Conflict Check

| Finding                                                                                                             | Category                         |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `POST /api/v1/sessions` now sets an HttpOnly session cookie and strips the session token from the JSON response.    | `current_security_contract`      |
| Multiple existing e2e specs still read `data.token` from the login response and build Bearer-session flows from it. | `stale_acceptance_test_contract` |
| The browser login page still types the login response as if `data.token` is present for personal users.             | `source_runtime_contract_gap`    |
| Admin browser denial fixtures still rely on synthetic localStorage/Bearer setup and did not trigger expected APIs.  | `fixture_alignment_gap`          |

## Interpretation

The stage 3 walkthrough did not reach a trustworthy AI出题 / AI组卷 runtime verdict. The blocking issue is below the AI
generation layer: local login/session, cookie-backed auth, and acceptance fixture contracts are not aligned. Continuing
to run AI or role e2e on this baseline would keep producing false negatives.

## Validation Results

| Command                                                                                                                                 | Status                           |
| --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `npm.cmd exec -- playwright test ... --reporter=line`                                                                                   | failed_setup                     |
| `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER='1'; npm.cmd exec -- playwright test ... --reporter=line`                                   | failed_0_of_6                    |
| `npm.cmd run lint`                                                                                                                      | not_executed_after_runtime_block |
| `npm.cmd run typecheck`                                                                                                                 | not_executed_after_runtime_block |
| `npm.cmd exec -- prettier --write --ignore-unknown ...`                                                                                 | pass                             |
| `npm.cmd exec -- prettier --check --ignore-unknown ...`                                                                                 | pass                             |
| `git diff --check`                                                                                                                      | pass                             |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`                     | pass_after_mapping_anchor_added  |
| `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`                | not_executed_after_runtime_block |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId role-workflow-experience-walkthrough-from-code-baseline-2026-07-02 -SkipRemoteAheadCheck` | not_executed_after_runtime_block |

## RED Evidence

RED: before this walkthrough, the next acceptance step assumed selected local role/workflow e2e could validate current
AI and role flows.

## GREEN Evidence

GREEN: the walkthrough exposed that the current blocking layer is the login/session and e2e fixture contract, not the
AI出题 / AI组卷 Provider/RAG path. The failure is now classified before any further AI acceptance run.

## Blocking Findings

| Finding id | Summary                                                                                 | Severity | Follow-up needed |
| ---------- | --------------------------------------------------------------------------------------- | -------- | ---------------- |
| STAGE3-01  | Login response security contract and e2e token expectations are misaligned.             | P1       | yes              |
| STAGE3-02  | Login page still reads a stripped token field for personal users.                       | P1       | yes              |
| STAGE3-03  | Admin route-denial browser fixtures need cookie/current-session alignment.              | P1       | yes              |
| STAGE3-04  | AI generation role/workflow runtime verdict remains unproven because auth setup failed. | P1       | yes              |

## Batch Evidence

Batch range: single acceptance runtime task `role-workflow-experience-walkthrough-from-code-baseline-2026-07-02`.

Commit: `4de8569e0940c6ceaa6279dedc81acaa5e833ae0`

The SHA above is the pre-closeout repository baseline for this blocked evidence package. The blocked-evidence closeout
commit is created after Module Run v2 readiness passes.

localFullLoopGate: blocked by session/fixture contract mismatch before AI role workflows were reached.

## Thread Rollover

threadRolloverGate: no rollover required; future work should start from this blocked evidence, the current task plan,
and the current session-cookie contract in `src/server/auth/session-route.ts`.

## Not Executed

- No Provider call.
- No Provider configuration or credential read.
- No source/test/package/schema/migration/seed/dependency change.
- No direct DB connection by Agent and no raw DB row evidence.
- No env/secret/credential/session/cookie/localStorage/Authorization header value recorded.
- No raw DOM, screenshot, trace, HTML dump, Provider payload, prompt, raw AI input/output, or full content recorded.
- No release readiness, final Pass, production usability, or Cost Calibration claim.

## Next Module Run

nextModuleRunCandidate: `session-cookie-contract-login-and-e2e-alignment-2026-07-02`.

Recommended smallest follow-up task: align login UI and local acceptance/e2e helpers with the current cookie-backed
session contract, then rerun the same bounded role/workflow suite before any AI-specific runtime verdict.
