# Evidence: Phase 22 Student Answering Local Acceptance Verification

## Task

- Task id: `phase-22-local-acceptance-student-answering-verification`
- Branch: `codex/phase-22-local-acceptance-student-answering-verification`
- Baseline: `afbb463815090b23d69da6890ba58965419bab8e`
- Journey: `student_answering`
- Target entities: `practice`, `mock_exam`, `answer_record`, `exam_report`
- Result: `needs_recheck`

## Local State

- Startup repository gates passed before claiming:
  - `master` and `origin/master`: `afbb463815090b23d69da6890ba58965419bab8e`
  - worktree clean before task claim
  - no local or remote `codex/*` residue before task claim
- Current branch created for this task:
  - `codex/phase-22-local-acceptance-student-answering-verification`
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

## Fixture Setup

The local verification used the approved existing project runtime database getter and ORM inserts only. The fixture was
local-only and minimal:

- `content_admin`: created only to satisfy existing `paper` and `question` creator foreign-key constraints.
- `personal_user` plus `student`: created as a student account according to the current schema model.
- `personal_auth`: active for `profession=monopoly`, `level=1`.
- `paper`: published local-only paper with one objective `paper_question`.
- `question` and `question_option`: one single-choice question with two options.

No raw SQL, seed/bootstrap script, destructive DB operation, schema/migration, package/lockfile, source, test, e2e, or
script edit was used.

## Redaction

The evidence intentionally does not record:

- generated phone or password
- token, cookie, or `Authorization` header
- database URL
- card-code plaintext
- generated `publicId` values
- raw row data
- private user data
- raw answer payloads

One early fixture attempt failed before runtime verification because the local DB requires admin creator foreign keys for
paper/content rows. That transaction was rolled back. The verification script was then hardened to report only fixed
step names and redacted result metadata.

## Local API Observation

The following local API observations were executed through `127.0.0.1:3201` with a cookie-backed session. Dynamic
resource identifiers are redacted.

| Step                     | HTTP | API Code | Result  |
| ------------------------ | ---: | -------: | ------- |
| `login_cookie_session`   |  200 |        0 | pass    |
| `current_session_cookie` |  200 |        0 | pass    |
| `student_paper_scopes`   |  200 |        0 | pass    |
| `student_paper_list`     |  200 |        0 | pass    |
| `practice_start`         |  200 |        0 | pass    |
| `practice_detail`        |  200 |        0 | pass    |
| `practice_answer_submit` |  200 |        0 | pass    |
| `mock_exam_start`        |  200 |        0 | pass    |
| `mock_exam_detail`       |  200 |        0 | pass    |
| `mock_exam_answer_save`  |  200 |        0 | pass    |
| `mock_exam_submit`       |  200 |        0 | pass    |
| `exam_report_generate`   |  423 |   423101 | blocked |

Verified coverage before the blocked gate:

- `practice`: start, detail, answer submission.
- `mock_exam`: start, detail, answer save, submit.
- `answer_record`: created through practice and mock exam answer APIs.
- Objective scoring path: local objective-only scoring completed without a provider/model call.

## Blocked Gate

`POST /api/v1/exam-reports` is intentionally blocked by
`src/server/services/student-experience/route-handlers.ts`:

- blocked gate: `provider_model_request_quota`
- operation: `exam_report.generation`
- status: `blocked`
- HTTP/API: `423` / `423101`

Because provider/model calls, provider configuration, quota/cost measurement, and Cost Calibration Gate are explicitly
not authorized for this task, the task stops here. The task does not claim full local acceptance for `exam_report`
generation, list, detail, or the UI report surfaces.

## UI Observation

Playwright was selected as the Browser fallback because the credentialed fixture flow must keep generated credentials,
cookies, tokens, and dynamic identifiers inside the verification process. UI navigation was not continued after the
`exam_report.generation` blocked gate, so no complete UI pass is claimed.

## Validation

Full closeout validation was not run because the task hit a blocked gate before completion. No source, test, schema,
script, package, lockfile, or env files were modified.

## Conclusion

Status is `needs_recheck`. The student answering journey is partially locally verified for `practice`, `mock_exam`, and
`answer_record`, but `exam_report` generation is blocked by an application-level provider gate. Per task instructions,
no task 4 work is claimed or started.
