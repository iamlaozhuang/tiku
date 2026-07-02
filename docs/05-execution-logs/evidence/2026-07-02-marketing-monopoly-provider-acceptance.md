# Marketing and monopoly resource coverage plus Provider acceptance evidence

## Task

- Task id: `marketing-monopoly-provider-acceptance-2026-07-02`
- Branch: `codex/marketing-monopoly-provider-acceptance`

## Redaction Boundary

- Evidence records role labels, profession labels, route labels, workflow labels, status categories, error categories, counts, duration buckets, and validation summaries only.
- No credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*` values, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/resource/question/paper/material/chunk content.

## Execution Log

- Task started after `ops-admin-local-login-residual-2026-07-02` closed.
- Logistics resource coverage is excluded because material is currently missing.
- Resource package discovery:
  - Package status: usable.
  - Total file count: 75.
  - Structured file count: 15.
  - Source document count: 63.
  - Resource inventory row count: 62.
  - Profession coverage count: 2.
  - Level coverage count: 3.
  - Subject coverage count: 2.
  - Knowledge node coverage count: 3.
- Catalog import dry-run:
  - Status: dry_run.
  - Database target: not_required.
  - Question row count: 3.
- Runtime RAG import dry-run:
  - Status: dry_run.
  - Inventory row count: 62.
  - Importable material count: 14.
  - Unsupported material count: 1.
  - Skipped missing file count: 0.
  - Profession coverage: marketing 22, monopoly 40, logistics 0.
  - Logistics coverage status: missing_package_resources.
- Catalog import execute:
  - Status: executed.
  - Database target: guarded local loopback database.
  - Imported knowledge base count: 2.
  - Imported knowledge node count: 3.
  - Imported material count: 3.
  - Imported question count: 3.
  - Imported resource count: 62.
  - Imported paper count: 3.
  - Imported paper question count: 3.
- Runtime RAG import execute:
  - Status: executed.
  - Importable material count: 14.
  - Unsupported material count: 1.
  - Skipped missing file count: 0.
  - Imported resource count: 14.
  - Imported chunk count: 375.
  - Written markdown file count: 14.
  - Merged catalog resource count: 25.
  - Runtime coverage: marketing rag_ready 13, monopoly rag_ready 1.
  - Logistics coverage status: missing_package_resources.
- Browser role matrix:
  - Role labels attempted: 8.
  - Browser route checks: 13.
  - Provider submit attempts: 8.
  - Provider retries: 0.
  - Screenshots, traces, raw DOM, storage/session inspection: not captured.
- Role outcomes:
  - `personal_standard_student`: login passed; `/ai-generation` visible; AI出题 and AI组卷 submit controls disabled; Provider not submitted.
  - `personal_advanced_student`: login passed; `/ai-generation` visible; AI出题 and AI组卷 submit controls enabled; two bounded submit attempts executed.
  - `org_standard_employee`: login passed; `/ai-generation` visible; AI出题 and AI组卷 submit controls disabled; Provider not submitted.
  - `org_advanced_employee`: login passed; `/ai-generation` visible; AI出题 and AI组卷 submit controls enabled; two bounded submit attempts executed.
  - `org_standard_admin`: login passed; organization portal visible; organization AI出题 and AI组卷 routes show standard-edition denial; Provider not submitted.
  - `org_advanced_admin`: login passed; organization portal visible; organization AI出题 and AI组卷 routes available; two bounded submit attempts executed.
  - `content_admin`: login passed; content AI出题 and AI组卷 routes available; two bounded submit attempts executed.
  - `ops_admin`: local acceptance session created; `/ops/users` visible; Provider not submitted.
- Profession and level surface checks:
  - Learner/employee AI pages use current authorization for profession and level; explicit profession switching is not exposed.
  - Organization/content AI pages show marketing and monopoly options and `1级` to `5级` level options.
  - Organization/content AI pages still show logistics as a selectable profession even though logistics material is excluded from this task and package coverage is missing.
- Safe aggregate API checks:
  - `personal_advanced_student` request history returned pending request rows for both AI出题 and AI组卷; result history returned zero result rows.
  - `org_advanced_employee` request and result histories returned zero rows for both AI出题 and AI组卷 after UI submits.
  - `org_advanced_admin` organization histories returned question and paper request rows, including provider-success status categories; question history also included provider-failed or provider-blocked status categories.
  - `content_admin` content histories returned question and paper request rows, including provider-success status categories; question history also included provider-failed status categories.
  - Token counts were not exposed by these aggregate checks.
- Residual findings for follow-up:
  - `MM-01`: learner/employee AI submit flow can show a visible review-like state while safe aggregate history remains pending or empty. A follow-up source repair should verify whether UI success state is derived from actual persisted result state.
  - `MM-02`: `org_advanced_employee` AI submits did not produce visible request/result history rows in the safe aggregate checks. A follow-up repair should check employee ownership/session normalization and personal-vs-organization history mapping.
  - `MM-03`: organization/content AI pages still expose logistics in profession options while logistics resource coverage is intentionally missing. A follow-up UX/data-contract task should disable or clearly mark logistics until package coverage exists.
  - `MM-04`: organization/content question histories include provider failure/block categories even after marketing resource import. A follow-up repair should inspect question-generation grounding, evidence sufficiency, and failure classification without recording raw prompts or outputs.
  - `MM-05`: several AI pages can show `资料不足` and `需审核` signals together. A follow-up UX/state task should make these terminal or review states mutually clear.

## Validation

- `npm.cmd run test:unit -- tests/unit/owner-preview-resource-import.test.ts tests/unit/owner-preview-runtime-rag-resource-import.test.ts tests/unit/local-acceptance-session-bootstrap.test.ts`: pass, 3 files, 16 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd exec -- prettier --check --ignore-unknown <changed docs/state files>`: pass.
- `git diff --check`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId marketing-monopoly-provider-acceptance-2026-07-02`: pass.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId marketing-monopoly-provider-acceptance-2026-07-02 -SkipRemoteAheadCheck`: first run blocked by project-state SHA drift after the previous task closeout; state SHA baseline was synchronized to current local `master` / `origin/master`; rerun passed.
