# Evidence: Local Business Flow Verification

## Metadata

- Task type: evidence-only local verification.
- Branch: `codex/local-business-flow-verification`
- Base branch: `master`
- Request: automated local full business-flow verification, not captcha, with browser automation as the primary surface.
- Scope: local runtime, browser, API, database, and quality-gate evidence.
- Dependency changes: none.
- Business code changes: none intended.
- Remote actions: not authorized; push/PR/merge are out of scope.

## Startup Documents Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest evidence/handoff:
  - `docs/05-execution-logs/evidence/2026-05-21-fix-phase-6-ai-audit-log-status.md`
  - `docs/05-execution-logs/evidence/2026-05-21-phase-7-local-e2e-readiness.md`

## Initial Repository Checks

- Command: `git status --short --branch`
- Result: pass.
- Summary: initial status was clean on `master...origin/master`; branch then changed to `codex/local-business-flow-verification`.

- Command: `git log -1 --oneline`
- Result: pass.
- Summary: latest commit was `dece8f9 docs(agent): close phase 6 ai audit log status`.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- Result: pass.
- Summary: required standards, ADRs, SOPs, state files, npm scripts, and skill paths were present.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Result: pass.
- Summary: `master` matched `origin/master` with no tracked, staged, or untracked changes.

## Task Carrier Decision

- Queue scan result: no suitable `pending` queue task was found for a post-Phase-7 full local business-flow verification.
- Decision: create an evidence-only execution plan at `docs/05-execution-logs/task-plans/2026-05-21-local-business-flow-verification.md`.
- No old closed Phase 7 task is being re-claimed.

## Runtime And Browser Evidence

### Local Runtime

- Command: `docker compose ps`
- Result: pass after approved Docker access.
- Summary: `tiku-postgres-dev` is `Up ... (healthy)` on `127.0.0.1:5432->5432/tcp`.

- Command: `docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';"`
- Result: pass.
- Summary: pgvector extension exists with version `0.8.2`.

- Command: `docker compose exec tiku-postgres psql -U tiku -d tiku -c "SELECT count(*) AS migration_count FROM drizzle.__drizzle_migrations;"`
- Result: pass.
- Summary: migration table exists and has `1` applied migration row.

- Command: `npx.cmd drizzle-kit migrate`
- Result: pass.
- Summary: Drizzle reported schema/table notices for existing migration infrastructure and ended with `migrations applied successfully`.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
- Result: pass.
- Summary: seed is repeatable for the MVP dataset. Summary counts: `auth_user_count=2`, `admin_count=1`, `student_user_count=1`, `organization_count=1`, `personal_auth_count=1`, `paper_count=1`, `paper_question_count=1`, `model_config_count=1`.

- Command: `npm.cmd run dev -- --hostname 127.0.0.1`
- Result: pass after approved local process start.
- Summary: Next.js dev server started at `http://127.0.0.1:3000`; `Invoke-WebRequest http://127.0.0.1:3000` returned `200 OK`.

### Browser Discovery

- Browser skill and `iab` backend were used per `Browser Verification Tool Discovery`.
- First `iab` connection attempt failed with `EPERM` reading `C:\Users\jzzhu\AppData`; after `js_reset`, the second attempt connected successfully.
- `iab` screenshot/result file persistence failed with `EPERM` for both `C:\tmp\...` and the browser temp directory. Browser evidence therefore records DOM visible state and URLs; screenshot status is `blocked: iab file write EPERM`.
- Browser backend used: `iab`.

### Browser-Covered Visible Pages

- URL: `http://127.0.0.1:3000/`
  - Visible state: root page shows `题库系统`, `进入学员端`, `内容后台`, and `运营后台`.
- Interaction: clicked `进入学员端`.
  - Result: click target was located, but the browser remained on `/`; this is recorded as a UI/navigation gap.
- URL: `http://127.0.0.1:3000/login`
  - Visible state: login page shows `登录` and `占位页面 — Phase 2`; no usable login form was present.
- URL: `http://127.0.0.1:3000/practice?paperPublicId=paper-dev-theory`
  - Visible state: page loads but shows `暂无可继续的练习`; the browser UI did not use the runtime-created practice API state.
- URL: `http://127.0.0.1:3000/mock-exam?paperPublicId=paper-dev-theory`
  - Visible state: mock exam fixture UI loads with question, answer options, `保存本题作答`, `下一题`, and `交卷`.
- URL: `http://127.0.0.1:3000/exam-report`
  - Visible state: report fixture UI loads with `营销理论模考卷 A`, score summary, question results, and learning suggestion placeholder.
- URL: `http://127.0.0.1:3000/ops/users`
  - Visible state: admin user/org/auth operations UI loads with user management controls and filters.
- URL: `http://127.0.0.1:3000/content/questions`
  - Visible state: question/material management UI loads with question controls.
- URL: `http://127.0.0.1:3000/content/papers`
  - Visible state: paper management UI loads with paper controls.
- URL: `http://127.0.0.1:3000/ops/ai-audit-logs`
  - Visible state: AI config/log operations UI loads with model config controls, audit log and AI call log panels.

Browser conclusion: browser automation covered rendered page availability and some visible interactions, but not true login form submission or runtime-backed student answer submission through UI because the current login page is a placeholder and student pages still use fixture/placeholder state for parts of the flow.

## API And Database Evidence

### Session And Student Flow

- API auxiliary method: Node `fetch` against `http://127.0.0.1:3000`.
- Dev credentials source: `src/db/dev-seed.ts`; local fixture credentials only.

Results:

- `POST /api/v1/sessions` as student `13900000002`: `code=0`, `userType=personal`.
- `POST /api/v1/sessions` as admin `13900000001`: `code=0`, `adminRoles=["super_admin"]`.
- `GET /api/v1/student-papers/scopes`: `code=0`, returned `monopoly` level `3`, active `personal_auth`, expiry `2027-05-21T00:00:00.000Z`.
- `GET /api/v1/student-papers?page=1&pageSize=20&profession=monopoly&level=3&subject=theory`: `code=0`, returned `paper-dev-theory`.
- `GET /api/v1/student-papers/paper-dev-theory`: `code=0`.
- `POST /api/v1/practices`: `code=0`, returned `practice_8b6534fd-7bc7-4adc-9eb4-394823feb4f8`.
- `POST /api/v1/practices/{publicId}/answers`: `code=0`, `isCorrect=true`.
- `POST /api/v1/mock-exams`: `code=0`, returned `mock_exam_ee407f3f-252a-48fc-b095-4a1aa89c007e`.
- `POST /api/v1/mock-exams/{publicId}/answers`: `code=0`.
- `POST /api/v1/mock-exams/{publicId}/submit`: `code=0`, `unansweredCount=0`.
- `POST /api/v1/exam-reports`: `code=0`, returned `exam_report_84764fb6-a60b-4531-b7e6-52d39e4d97eb`.
- `GET /api/v1/exam-reports/{publicId}`: `code=0`, `totalScore=5.0`.

### Admin Read Flow

- `GET /api/v1/users?page=1&pageSize=20`: `code=0`, returned seeded `user-dev-student`.
- `GET /api/v1/questions?page=1&pageSize=20`: `code=0`, returned seeded `question-dev-single-choice`.
- `GET /api/v1/papers?page=1&pageSize=20`: `code=0`, returned seeded `paper-dev-theory`.
- `GET /api/v1/model-configs?page=1&pageSize=20`: `code=0`, returned `model-config-dev-learning-suggestion`.

### Audit And AI Log Flow

- `GET /api/v1/audit-logs?page=1&pageSize=20`: `code=0`, but returned `auditLogs=[]`.
- Database check: `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;`
  - Result: `audit_log` table is absent from the local dev schema.
  - Conclusion: safe admin action writing `audit_log` cannot be fully verified in this local database. The API returns an empty list rather than persisted audit rows.
- `GET /api/v1/ai-call-logs?page=1&pageSize=20`: `code=0`, but returned `aiCallLogs=[]`.
- Database schema contains `ai_call_log`, but this run found no UI/API route that triggers the mock AI provider and appends `ai_call_log`.
- `GET /api/v1/model-configs?page=1&pageSize=20`: response exposes `apiKeyDisplay: null`; no concrete API key value was returned.
- Redaction probe on `ai-call-logs` and `model-configs` response:
  - local dev passwords: not found.
  - session token: not found.
  - raw prompt/raw answer keys: not found.
  - `apiKey` text: found only as the redacted field name `apiKeyDisplay`, whose value is `null`; no secret value was exposed.

## Required Gate Evidence

- Command: `docker compose ps`
- Result: pass.
- Summary: PostgreSQL/pgvector dev container is healthy.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- Result: pass.
- Summary: required standards, ADRs, SOPs, state files, scripts, npm scripts, and skill paths were present.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- Result: failed in sandbox, then passed after approved escalation.
- Sandbox failure summary: `EPERM` reading `node_modules\.pnpm\eslint...\eslint.js`.
- Escalated pass summary: `lint`, `typecheck`, `test:unit`, and `format:check` passed; unit summary `86` files and `288` tests passed.

- Command: `npm.cmd run build`
- Result: failed in sandbox, then passed after approved escalation.
- Sandbox failure summary: `EPERM` reading `node_modules\.pnpm\caniuse-lite...\agents.js`.
- Escalated pass summary: Next.js production build compiled successfully and generated `40` static pages.

- Command: `npm.cmd run test:e2e`
- Result: pass.
- Summary: current Playwright suite ran `1` chromium test, `e2e\home.spec.ts`, and passed. This is still only root navigation smoke coverage.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- Result: pass.
- Summary: naming convention scan completed with banned terms absent, route folders kebab-case/public-id compliant, and DTO fields camelCase.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- Result: pass.
- Summary: branch inventory showed only this task plan and evidence file as untracked before evidence finalization.

## Coverage Conclusion

- Overall conclusion: **partially passed**.
- Browser automation covered local rendered pages and visible UI states for root, login placeholder, student practice/mock/report, admin users/questions/papers, and admin AI/audit log operations.
- API/database auxiliary verification covered real local session login, authorized paper access, practice answer submission, mock exam answer/submit, exam report generation/detail, admin users/questions/papers/model-config reads, migration, seed, and pgvector readiness.
- Full browser-driven business flow did **not** pass because:
  - login UI is still a placeholder and cannot submit credentials;
  - student practice page does not reflect the runtime-created practice state for `paper-dev-theory`;
  - UI remains fixture/placeholder-backed for some student/report/admin surfaces.
- Audit/AI logging did **not** pass:
  - `audit_log` table is absent from the local dev schema, so audit persistence cannot be verified;
  - no current UI/API route triggered mock AI provider runtime to append `ai_call_log`; `ai_call_logs=[]`.

## Residual Risk

- Current `npm.cmd run test:e2e` passing does not mean full MVP flow coverage; it only proves the existing root navigation smoke test.
- Browser screenshots were not persisted because the `iab` file-writing path was blocked by local `EPERM`; DOM snapshots and dev-server request logs were used instead.
- The browser-layer student flow and API-layer student flow diverge: API runtime can complete the MVP answer/report path, while UI pages still show fixture or placeholder states.
- `audit_log` persistence is a schema/runtime blocker and should become a follow-up fix task, not be patched inside this evidence-only verification.
- `ai_call_log` write coverage needs either a UI/API trigger for mock AI provider or a dedicated verification endpoint/task; no real provider credentials were used.

## Closeout

- Local evidence commit: `38cac75 docs(agent): record local business flow verification`.
- Push / PR / merge: not performed; no remote action was authorized.
- Dev server cleanup:
  - Command: `netstat -ano | Select-String ':3000'`
  - Result: identified listening process `42488`.
  - Command: `Stop-Process -Id 42488 -Force`
  - Result: stopped the local Next.js dev server.
  - Verification: `Invoke-WebRequest http://127.0.0.1:3000` returned `stopped`.
- Docker cleanup: not performed; PostgreSQL/pgvector dev database was intentionally left running.
