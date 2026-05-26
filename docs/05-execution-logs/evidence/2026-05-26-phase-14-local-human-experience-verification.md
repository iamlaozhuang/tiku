# Phase 14 Local Human Experience Verification Evidence

**Task id:** `phase-14-local-human-experience-verification`

**Branch:** `codex/phase-14-local-human-experience-verification`

**Date:** 2026-05-26

## Scope

Local human experience verification preparation and accompaniment after Phase 13 fixes. This task is docs-only for repository changes and uses only localhost/127.0.0.1 browser/test verification.

## Recovery And Preflight

- Current branch before task creation: `master`.
- Initial git status: clean.
- `master` / `origin/master` / `HEAD`: `020889a36b3c238849cae27591ae123bb1d9908e`.
- Queue summary before task creation: `pending: 0`, `blocked: 4`, `closed: 143`, `done: 82`, `pushed: 2`.
- `phase-13-real-provider-staging-redaction-approval-gate`: still `blocked`; not bypassed.
- Existing blocked tasks:
  - `phase-10-local-real-ai-provider-smoke-test`
  - `phase-12-mvp-requirements-runtime-audit-round-3`
  - `phase-12-mvp-requirements-runtime-audit-summary`
  - `phase-13-real-provider-staging-redaction-approval-gate`

## Actual Checked Files

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/01-requirements/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-26-phase-13-ai-audit-model-config-runtime-ui.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-13-ai-redaction-shape-and-management-e2e.md`

## Browser Runtime

- Status: local dev server confirmed running.
- Server target: `http://127.0.0.1:3000` only.
- Startup command: `npm.cmd run dev -- --hostname 127.0.0.1`, launched in a hidden local process with logs redirected under `C:\tmp`.
- Health check: `http://127.0.0.1:3000/login` returned HTTP 200.
- Browser tool: in-app browser was connected and made visible for human verification accompaniment.
- Staging/prod/cloud/real provider target: not used.
- Startup log note: Next.js reported `.env.local` as an environment file, but no env values were output, read, copied, or recorded.

## Human Experience Verification Matrix

| Path                                          | Role                    | Operation path                                                                                  | Expected                                                                                                             | Actual                                                                                                                                                                                                                                                                           | Pass | Gap notes                                                                                                                                         |
| --------------------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| Login page                                    | unauthenticated user    | Open `/login`.                                                                                  | Login page shows phone, password, and disabled/enabled login action behavior.                                        | Page loaded with phone, password, login action, and registration link.                                                                                                                                                                                                           | pass | None.                                                                                                                                             |
| Student home                                  | local synthetic student | Log in through `/login`, land on `/home`.                                                       | Authorized student sees current authorization scope, paper list, and `practice` / `mock_exam` entries.               | `/home` loaded with authorization scope, paper list, profile, redeem-code, `mistake_book`, exam record, practice, and mock exam entries.                                                                                                                                         | pass | None.                                                                                                                                             |
| `practice`                                    | local synthetic student | Open `/practice?paperPublicId=paper-dev-theory`, select an objective answer, submit.            | Practice page loads one question, accepts an answer, then shows immediate feedback/analysis.                         | Page loaded question and enabled submit after option selection, but after submit changed to "practice load failed" state.                                                                                                                                                        | fail | UX/runtime gap: objective answer submit can drop into a generic practice loading failure instead of feedback. No code fix attempted in this task. |
| `mock_exam`                                   | local synthetic student | Open `/mock-exam?paperPublicId=paper-dev-theory`, answer, save, submit, confirm.                | Mock exam hides answer/analysis before submit, saves answer, confirms submission, and offers report entry.           | Mock exam loaded, answer/analysis remained hidden before submit, save/submit/confirm flow completed, and report link appeared.                                                                                                                                                   | pass | None.                                                                                                                                             |
| `exam_report`                                 | local synthetic student | Click the report link after submitting `mock_exam`.                                             | Report page shows completed status, score/result summary, and learning suggestion or generation status.              | `/exam-report?examReportPublicId=...` loaded with completed status and "generating" states for score, question result, and learning suggestion.                                                                                                                                  | pass | Observation: report is reachable but remains in generation placeholders during this pass.                                                         |
| `mistake_book`                                | local synthetic student | Open `/mistake-book`.                                                                           | Student sees own objective mistakes, filters, actions, standard answer, and analysis.                                | Page loaded with filters, one local seeded item, answer/standard answer summary, teacher analysis summary, favorite/mastered/AI explanation/remove actions.                                                                                                                      | pass | Evidence omits raw full question content beyond bounded summaries.                                                                                |
| Profile                                       | local synthetic student | Open `/profile`.                                                                                | Profile shows local account summary, session status, redeem entry, and authorization details.                        | Profile loaded with local account information, session expiry, redeem entry, active authorization, and authorization history.                                                                                                                                                    | pass | Evidence redacts phone/credential details.                                                                                                        |
| Admin entry                                   | local synthetic admin   | Log in through `/login`, land on `/ops/users`.                                                  | Admin shell and operations navigation are visible.                                                                   | `/ops/users` loaded with operations navigation for users, `organization`, redeem code, resources, and AI/audit logs.                                                                                                                                                             | pass | Evidence redacts local synthetic phone-like values.                                                                                               |
| Content management core pages                 | local synthetic admin   | Open `/content/questions`, `/content/materials`, `/content/papers`, `/content/knowledge-nodes`. | Content admin pages are reachable and expose core content management surfaces.                                       | All four pages loaded with content admin shell, question/material/paper/knowledge-node surfaces, and local operation entry text.                                                                                                                                                 | pass | None.                                                                                                                                             |
| User / `organization` / `authorization` pages | local synthetic admin   | Open `/ops/users`, `/ops/organizations`, `/ops/redeem-codes`.                                   | User, organization, authorization, employee/redeem-code related surfaces are reachable and use local runtime data.   | All three pages loaded; `organization` page includes `org_auth`/enterprise authorization creation language, users page includes authorization summary, redeem-code page includes authorization scope language.                                                                   | pass | Evidence redacts local synthetic phone-like values; no write actions were executed.                                                               |
| AI audit / `model_config` pages               | local synthetic admin   | Open `/ops/ai-audit-logs`.                                                                      | AI audit and `model_config` management render redaction-safe data without raw provider/prompt/model payload markers. | Page loaded model provider/config/template controls, audit log, and AI call log rows. Forbidden markers checked visible text: none found for raw prompt, raw answer, raw model response, provider payload, Authorization, Bearer, database URL, or secret value payload markers. | pass | The form label "Secret value" is visible, but no secret value was present, read, copied, or recorded.                                             |

## Gaps Recorded

1. `practice` submit failure: after selecting an objective option and clicking submit on `/practice?paperPublicId=paper-dev-theory`, the page switched to a generic "practice load failed" state instead of showing immediate feedback. This is recorded only; no code or test fix was attempted.
2. `exam_report` generation placeholder: the submitted mock exam report page was reachable and showed completed status, but score/result/learning suggestion remained in "generating" placeholders during the pass. This may be acceptable asynchronous behavior or a follow-up UX gap; no fix attempted.

## Command Results

- `npm.cmd run test:e2e`
  - Result: pass. 25 Chromium tests.
- `npm.cmd run lint`
  - Initial sandbox result: failed with EPERM reading local `node_modules` executable.
  - Escalated local result: pass.
- `npm.cmd run typecheck`
  - Initial sandbox result: failed with EPERM reading local `node_modules` executable.
  - Escalated local result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass inventory before commit.
- `git diff --check`
  - Result: pass.
- Diagnostic `npm.cmd run format:check`
  - Initial sandbox result: failed with EPERM reading local `node_modules` executable.
  - Escalated local result: failed on formatting for this task's two new Markdown files.
- `node .\node_modules\prettier\bin\prettier.cjs --write docs\05-execution-logs\task-plans\2026-05-26-phase-14-local-human-experience-verification.md docs\05-execution-logs\evidence\2026-05-26-phase-14-local-human-experience-verification.md`
  - Result: pass. Only the two current task Markdown files were formatted.
- Final diagnostic `npm.cmd run format:check`
  - Result: pass after formatting current task Markdown files.
- Final `git diff --check`
  - Result: pass.
- Final `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
  - Result: pass inventory before commit; changed files are limited to current task docs/state/queue files.

## Forbidden Scope Self-Check

- No dependency was added, removed, or upgraded.
- No package manifest or lockfile was modified.
- No `.env.local` or `.env.example` contents were read, changed, copied, or recorded.
- No staging, production, cloud, deploy, or real provider was contacted.
- No destructive migration or data rewrite was executed.
- No raw prompt, raw answer, raw model response, raw provider payload, Authorization header, database URL, token, secret, plaintext redeem code, generated password, full paper, full教材, OCR full text, or private customer-like data is recorded here.
- `phase-13-real-provider-staging-redaction-approval-gate` remains blocked.

## 品味合规自检 Checklist

- [x] This task is docs-only and does not alter UI/runtime code.
- [x] Browser verification is limited to localhost/127.0.0.1.
- [x] Evidence records summaries and gap notes only, not sensitive raw payloads or private content.
- [x] API and terminology references retain project naming rules such as `practice`, `mock_exam`, `exam_report`, `mistake_book`, `organization`, `authorization`, `ai_call_log`, and `model_config`.
- [x] No dependency, lockfile, schema, migration, env, staging, cloud, deploy, or real provider scope was touched.

## Post-Merge Closeout

- Feature commit: `bce1e55 docs(verification): record phase 14 local human experience`.
- Merge commit before evidence amend: `0d7fd0f merge: phase 14 local human experience verification`.
- Post-merge branch: `master`.
- Post-merge status before evidence amend: clean, ahead of `origin/master` by 2 commits.
- Push target: `origin master`, pending explicit user approval.
- Short branch deletion: not performed.

Post-merge command results on `master`:

- `npm.cmd run test:e2e`: pass, 25 Chromium tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run format:check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch origin/master`: pass inventory; `master` ahead by feature plus merge commit before push.
- `git diff --check`: pass.
