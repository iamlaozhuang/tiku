# Evidence: Phase 22 Mistake Learning Local Acceptance Verification

## Task

- Task id: `phase-22-local-acceptance-mistake-learning-verification`
- Branch: `codex/phase-22-local-acceptance-mistake-learning-verification`
- Baseline: `752b2bc61a4366c4cb7ae2307d2c6d853baf7d1d`
- Journey: `mistake_and_learning_loop`
- Target entities: `mistake_book`, `ai_explanation`, `ai_hint`, `learning_suggestion`, `kn_recommendation`, `exam_report`
- Result: `needs_recheck`

## Local State

- Startup repository gates passed before claiming:
  - `master` and `origin/master`: `752b2bc61a4366c4cb7ae2307d2c6d853baf7d1d`
  - worktree clean before task claim
  - no local or remote `codex/*` residue before task claim
- Current branch created for this task:
  - `codex/phase-22-local-acceptance-mistake-learning-verification`
- Local dev server:
  - `http://127.0.0.1:3201/login`
  - HTTP probe returned `200`

## Inputs Re-Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/interfaces/phase-22-mvp-local-acceptance-reaudit-contract.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-student-answering-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-student-answering-verification.md`

## Fresh Approval

The user approved approval package v6 for task 4 only:

- Accept task 3 as partial and keep `exam_report.generation` as a provider-gated remainder.
- Verify only the non-provider `mistake_book` local loop.
- Mark `ai_explanation`, `ai_hint`, `learning_suggestion`, `kn_recommendation`, and `exam_report.generation` as
  `deferred`, `needs_recheck`, or `mock_only` if provider access would be required.
- Do not read or modify `.env*`, do not call providers/models, do not measure quota/cost, do not run Cost Calibration,
  and do not modify source/test/e2e/schema/drizzle/scripts/package/lockfile files.

## Fixture Setup

The local verification used existing project runtime/ORM behavior and local HTTP APIs only. The fixture was local-only
and minimal:

- `content_admin`: created only to satisfy existing `paper` and `question` creator foreign-key constraints.
- `personal_user` plus `student`: created as a student account according to the current schema model.
- `redeem_code` plus `personal_auth`: active for `profession=monopoly`, `level=1`.
- `paper`: published local-only paper with one objective `paper_question`.
- `question` and `question_option`: one single-choice question with two options.

No raw SQL, seed/bootstrap script, destructive DB operation, schema/migration, package/lockfile, source, test, e2e, or
script edit was used. Verification-created local fixture rows were not cleaned up because destructive DB cleanup is not
authorized.

## Redaction

The evidence intentionally does not record:

- generated phone or password
- token, cookie, or `Authorization` header
- database URL
- card-code plaintext
- generated `publicId` values
- raw row data
- private user data
- provider payloads
- raw prompts or raw answers

## Local API And UI Observation

The following local observations were executed through `127.0.0.1:3201`. Dynamic identifiers and credentials were kept
inside the verification process and are not recorded.

| Step                                       | HTTP | API Code | Result   |
| ------------------------------------------ | ---: | -------: | -------- |
| `fixture_setup`                            |    - |        - | pass     |
| `login_cookie_session`                     |  200 |        0 | pass     |
| `current_session_cookie`                   |  200 |        0 | pass     |
| `practice_start_for_wrong_answer`          |  200 |        0 | pass     |
| `practice_detail_for_wrong_answer`         |  200 |        0 | pass     |
| `practice_wrong_answer_submit`             |  200 |        0 | pass     |
| `wrong_answer_created_mistake_book`        |    - |        - | pass     |
| `mistake_book_list`                        |  200 |        0 | pass     |
| `mistake_book_list_contains_created`       |    - |        - | pass     |
| `mistake_book_detail`                      |  200 |        0 | pass     |
| `mistake_book_detail_unmastered`           |    - |        - | pass     |
| `mistake_book_ui_observation`              |    - |        - | pass     |
| `mistake_book_ai_explanation_gate`         |  423 |   423101 | blocked  |
| `mistake_book_favorite`                    |  200 |        0 | pass     |
| `mistake_book_favorite_state`              |    - |        - | pass     |
| `mistake_book_unfavorite`                  |  200 |        0 | pass     |
| `mistake_book_unfavorite_state`            |    - |        - | pass     |
| `mistake_book_mark_mastered`               |  200 |        0 | pass     |
| `mistake_book_mastered_state`              |    - |        - | pass     |
| `mistake_book_remove`                      |  200 |        0 | pass     |
| `mistake_book_removed_state`               |    - |        - | pass     |
| `mistake_book_list_after_remove`           |  200 |        0 | pass     |
| `mistake_book_removed_not_in_default_list` |    - |        - | pass     |
| `exam_report_generation_gate`              |  423 |   423101 | blocked  |
| `learning_suggestion_retry_gate`           |  423 |   423101 | blocked  |
| `kn_recommendation_provider_remainder`     |    - |        - | deferred |
| `ai_hint_provider_remainder`               |    - |        - | deferred |

UI observation used Playwright against localhost with an in-process local session token and `Authorization` header. No
screenshots, tokens, dynamic identifiers, or page text were written to evidence. The UI check observed at least one
rendered `mistake_book` item before the API remove transition.

## Provider-Gated Remainders

The task does not claim full `local_verified` because these target surfaces remain outside v6 authorization and remain
blocked:

- `mistake_book.ai_explanation`: HTTP `423`, API code `423101`, `provider_model_request_quota`.
- `exam_report.generation`: HTTP `423`, API code `423101`, `provider_model_request_quota`.
- `exam_report.retry_learning_suggestion`: HTTP `423`, API code `423101`, `provider_model_request_quota`.
- `ai_hint`: deferred; not claimed as task 4 local verification.
- `kn_recommendation`: deferred; not invoked under the no-provider/no-RAG-provider boundary.

No provider/model call, provider configuration, quota/cost measurement, or Cost Calibration Gate was executed.
Cost Calibration Gate remains blocked.

## Module Run v2 Evidence

## Batch 1

- Batch range: Phase 22 task 4 local acceptance verification only.
- Commit: `752b2bc61a4366c4cb7ae2307d2c6d853baf7d1d` pre-closeout HEAD before the task commit.
- RED: Initial local observation exposed two local verification setup gaps:
  - non-ASCII UI regex was unsafe for the one-time verification process before fixture/API execution;
  - legacy mistake_book routes require an in-memory `Authorization` header and the UI requires
    `tiku.localSessionToken` in browser `localStorage`.
- GREEN: Final local observation passed the non-provider `mistake_book` loop with sanitized API/UI evidence.
- localFullLoopGate: pass for non-provider `mistake_book`; full task target remains `needs_recheck` because provider
  gated AI/report remainders remain blocked.
- blocked remainder: `mistake_book.ai_explanation`, `learning_suggestion`, and `exam_report.generation` remain blocked
  by `provider_model_request_quota`; `ai_hint` and `kn_recommendation` remain deferred.
- threadRolloverGate: no rollover required for this task; continue only after closeout if the user gives fresh
  instruction.
- nextModuleRunCandidate: `phase-22-local-acceptance-admin-operations-verification`, but do not claim it without fresh
  user instruction after task 4 merge/push/cleanup/alignment.
- result: pass for the scoped non-provider `mistake_book` local loop and docs closeout evidence; overall task result
  remains `needs_recheck`.

## Attempt Notes

- One initial one-time verification attempt failed at script compile time due a non-ASCII UI regular expression before
  fixture/API execution.
- One subsequent attempt confirmed the wrong-answer-to-mistake creation path, then showed the legacy mistake_book route
  requires an in-memory `Authorization` header rather than cookie-only access.
- One subsequent UI attempt showed the page also requires the local `tiku.localSessionToken` value in browser
  `localStorage`.
- The final run used only in-process credential handling and completed the sanitized observation table above.

## Validation

| Command                                                                                                                                                                                      | Result |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `git diff --check`                                                                                                                                                                           | pass   |
| `npm.cmd run lint`                                                                                                                                                                           | pass   |
| `npm.cmd run typecheck`                                                                                                                                                                      | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                          | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-mistake-learning-verification`      | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-mistake-learning-verification` | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-mistake-learning-verification`        | pass   |

## Conclusion

`mistake_book` non-provider local loop is `local_verified` for wrong-answer creation, list/detail, UI visibility,
favorite, unfavorite, mark-mastered, remove, and default-list exclusion after removal.

Overall task result remains `needs_recheck` because provider-gated or deferred AI/report targets are intentionally not
authorized and are not claimed as complete local acceptance.
