# Evidence: Fix Local Business Flow Runtime

## Metadata

- Task id: `phase-7-fix-local-business-flow-runtime`
- Branch: `codex/fix-local-business-flow-runtime`
- Base branch: `codex/local-business-flow-verification`
- Purpose: repair verification-discovered local runtime blockers for `audit_log`, mock AI-triggered `ai_call_log`, and browser-level local business-flow verification.
- Dependency changes: none intended.
- Remote actions: not authorized.

## Startup And Recovery

- Required startup documents were read before runtime edits.
- Prior verification evidence read: `docs/05-execution-logs/evidence/2026-05-21-local-business-flow-verification.md`.
- Created this task plan before business logic changes: `docs/05-execution-logs/task-plans/2026-05-22-fix-local-business-flow-runtime.md`.

## Startup Commands

- Command: `git status --short --branch`
- Result: passed.
- Summary: started from clean `codex/local-business-flow-verification`.

- Command: `git log -3 --oneline`
- Result: passed.
- Summary: latest local commit was `6912773 docs(agent): record local business flow verification`, followed by `dece8f9`.

- Command: `git switch -c codex/fix-local-business-flow-runtime`
- Result: failed in sandbox.
- Summary: Git could not create `.git/refs/heads/codex/fix-local-business-flow-runtime.lock` due permission denial.

- Command: `git switch -c codex/fix-local-business-flow-runtime`
- Result: passed after approved escalation.
- Summary: created and switched to the required short-lived repair branch.

## Implementation Log

- Created task branch `codex/fix-local-business-flow-runtime` after sandbox Git ref creation failed and escalation was approved.
- Created task plan before business logic changes.
- Added `src/db/schema/system.ts` and `src/db/schema/system.test.ts` for `audit_log`.
- Generated additive Drizzle migration and renamed it to `drizzle/20260522002400_add_audit_log.sql` to align with project migration naming guidance while keeping Drizzle journal metadata consistent.
- Added `tests/unit/phase-7-exam-report-learning-suggestion-runtime.test.ts`.
- Extended `createExamReportService` with injectable learning suggestion runtime options.
- Wired local student flow runtime to deterministic mock AI provider plus `ai_call_log` repository.
- Wired `POST /api/v1/exam-reports/{publicId}/retry-learning-suggestion` to student flow runtime.
- Fixed `ai_call_log` insert to pass ISO timestamp strings instead of raw `Date` objects after E2E exposed a 500 runtime bug.
- Wired `POST /api/v1/practices/{publicId}/restart`, `POST /api/v1/practices/{publicId}/terminate`, and `POST /api/v1/mock-exams/{publicId}/terminate` to student flow runtime for repeatable local verification.
- Added browser-level Playwright E2E in `e2e/local-business-flow.spec.ts`.
- Registered `phase-7-fix-local-business-flow-runtime` in `task-queue.yaml` and updated `project-state.yaml`.

## TDD Evidence

- Command: `npm.cmd run test:unit -- src/db/schema/system.test.ts`
- Result: failed after approved escalation.
- Summary: expected RED failure; Vitest could not resolve `./system` because the schema file did not exist.

- Command: `npm.cmd run test:unit -- src/db/schema/system.test.ts`
- Result: passed.
- Summary: `audit_log` schema table, columns, and indexes were present.

- Command: `npm.cmd run test:unit -- tests/unit/phase-7-exam-report-learning-suggestion-runtime.test.ts`
- Result: failed.
- Summary: expected RED failure; `retryLearningSuggestion` still returned `422321 Learning suggestion retry is not available in Phase 4`.

- Command: `npm.cmd run test:unit -- tests/unit/phase-7-exam-report-learning-suggestion-runtime.test.ts`
- Result: passed.
- Summary: service now triggers the injected mock AI runtime and returns `{ code: 0, message: "ok", data: null }` without raw answer data in the response.

- Command: `npm.cmd run test:unit -- src/db/schema/system.test.ts tests/unit/phase-7-audit-log-runtime-baseline.test.ts tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts tests/unit/phase-7-student-flow-runtime-smoke.test.ts tests/unit/phase-7-exam-report-learning-suggestion-runtime.test.ts`
- Result: passed.
- Summary: focused runtime regression set passed, `5` files and `11` tests.

- Command: `npm.cmd run test:unit -- tests/unit/phase-7-ai-mock-provider-and-log-runtime-smoke.test.ts tests/unit/phase-7-exam-report-learning-suggestion-runtime.test.ts`
- Result: passed.
- Summary: AI log and learning suggestion focused tests passed after timestamp serialization fix.

## Validation

- Command: `docker compose ps`
- Result: passed.
- Summary: `tiku-postgres-dev` was `Up ... (healthy)` on `127.0.0.1:5432`.

- Command: `npm.cmd exec -- drizzle-kit migrate`
- Result: passed.
- Summary: Drizzle applied migrations successfully; no `drizzle-kit push` was used.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
- Result: passed.
- Summary: seed remained repeatable, returning `auth_user_count=2`, `admin_count=1`, `student_user_count=1`, `organization_count=1`, `personal_auth_count=1`, `paper_count=1`, `paper_question_count=1`, `model_config_count=1`.

- Command: `docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT to_regclass('public.audit_log') AS audit_log_table, (SELECT count(*) FROM drizzle.__drizzle_migrations) AS migration_count;"`
- Result: passed.
- Summary: `audit_log_table=audit_log`, `migration_count=2`.

- Command: `docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT (SELECT count(*) FROM audit_log) AS audit_log_count, (SELECT count(*) FROM ai_call_log) AS ai_call_log_count;"`
- Result: passed.
- Summary: after browser verification, `audit_log_count=1`, `ai_call_log_count=4`.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- Result: passed.
- Summary: required files, scripts, Phase 7 anchors, and skill/plugin paths were present.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- Result: failed.
- Summary: `lint`, `typecheck`, and `test:unit` passed; `format:check` failed for task-scoped files.

- Command: `npm.cmd exec -- prettier --write ...`
- Result: passed.
- Summary: formatted only files reported by `format:check`.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- Result: passed.
- Summary: `lint`, `typecheck`, `test:unit`, and `format:check` passed. Unit tests: `88` files and `291` tests.

- Command: `npm.cmd run build`
- Result: passed.
- Summary: Next.js production build compiled successfully and included dynamic runtime routes for retry learning suggestion, practices restart/terminate, and mock_exam terminate.

- Command: `npm.cmd run test:e2e`
- Result: passed.
- Summary: Playwright ran `2` tests; root smoke and local business-flow E2E both passed.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- Result: passed.
- Summary: banned business terms absent, route folders use kebab-case and public-id params, DTO fields are camelCase.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Result: passed.
- Summary: inventory completed. Note: branch is based on `codex/local-business-flow-verification`, so compare against `origin/master` still includes prior verification evidence commit `6912773`.

## Browser Automation Evidence

- Tooling: Playwright browser automation through project E2E. Initial in-app/node_repl browser path was discovered but could not import `playwright` (`Module not found: playwright`), so project Playwright was used.
- URL: `http://127.0.0.1:3000`.
- Server command: `npm.cmd run dev -- --hostname 127.0.0.1`.
- Screenshot status: Playwright test attached screenshots for root, student home, and exam report pages.
- Console errors: none in passing E2E.
- Network/API failures: none in passing E2E.
- Student role:
  - Login method: browser-context `fetch('/api/v1/sessions')` with dev seed phone `13900000002`; token used only inside the browser test and asserted absent from admin payload serialization.
  - Visible pages: `/`, `/login`, `/home`, `/mock-exam?paperPublicId=paper-dev-theory`, `/exam-report`.
  - API-assisted browser actions: listed authorized papers, opened paper detail, started/restarted practice, submitted answer, started mock_exam, saved answer, submitted mock_exam, generated exam_report, retried learning suggestion.
  - Result: all response codes were `0`; practice answer was correct; mock_exam reached `completed`; retry learning suggestion returned `{ code: 0, message: "ok", data: null }`.
- Admin role:
  - Login method: browser-context `fetch('/api/v1/sessions')` with dev seed phone `13900000001`, `super_admin`.
  - Visible pages: `/ops/users`, `/content/questions`, `/content/papers`, `/ops/ai-audit-logs`.
  - API-assisted browser reads: users, questions, papers, audit_logs, ai_call_logs, model_configs.
  - Result: all read APIs returned `code=0`; `auditLogs.length > 0`; `aiCallLogs.length > 0`; model config showed `providerKey=mock` and `apiKeyDisplay=null`.
- Redaction checks:
  - Admin read serialization did not contain dev passwords, `sk-real-secret`, raw prompt markers, raw answer markers, student token, or admin token.
- Browser-flow limitation:
  - `/login`, `/home`, `/mock-exam`, and `/exam-report` still include fixture/static UI pieces. The browser E2E proves real session-backed API mutations from a browser context, not a fully interactive click-through UI for every form/control.

## Security Review

- Security review file: `docs/05-execution-logs/audits-reviews/2026-05-22-fix-local-business-flow-runtime-security-review.md`.
- Verdict: `APPROVE`.

## Git Closeout

- Local commit: created as `fix(runtime): verify local business flow`; final SHA is the current branch `HEAD` after evidence amend.
- Remote actions: none. No push, no PR, no merge, no deploy.
- Final worktree state before handoff: clean.

## Taste Compliance Self-Check

- Pending final checklist.
