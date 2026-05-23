# Evidence: phase-9-mvp-acceptance-browser-api-verification

## Metadata

- Task id: `phase-9-mvp-acceptance-browser-api-verification`
- Branch: `codex/phase-9-mvp-acceptance-browser-api-verification`
- Base: `master`
- Evidence created at: `2026-05-23T00:00:00+08:00`
- Task plan policy: `evidence_only`; no task plan was created.
- Security review: evaluated; no separate security review file required because this task only executes final local browser/API verification and updates evidence/state. It does not modify auth, session, authorization, AI/RAG, database, runtime, dependency, schema, environment, or production behavior.

## Scope

Allowed files followed:

- `docs/05-execution-logs/evidence/2026-05-23-phase-9-mvp-acceptance-browser-api-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

No `e2e/**` changes were needed because `e2e/local-business-flow.spec.ts` already covers the final browser/API acceptance matrix from the Phase 9 contract:

- student core browser flow: root navigation, login, home, profile, redeem code failure path, mistake book, mock exam entry, exam report.
- admin core browser flow: login, users, resources, organizations, redeem codes, content management routes, AI/audit log page entry.
- REST API acceptance from browser context: student paper/practice/mock/exam-report calls and admin users, organizations, org_auth, employee, redeem_code, question, paper, resource, audit_log, ai_call_log, and model_config reads.
- standard envelope and DTO checks: `{ code, message, data, pagination? }`, camelCase JSON keys, publicId-only responses, and no internal `id` keys.
- sensitive data checks: no session token, password, secret, API key, raw prompt, raw answer, provider payload, `code_hash`, or plaintext redeem code in visible UI or response payload assertions.
- read-only log guards: `audit_log` and `ai_call_log` reads are exercised; write probes to `/api/v1/audit-logs`, `/api/v1/ai-call-logs`, and `/api/v1/ai-call-logs/summary` are rejected with 405-class behavior and treated as expected artifacts only for those probes.
- browser console/network review: console errors are collected; only the three expected 405 read-only write probe messages are allowed, and unexpected request failures must be empty after filtering known navigation aborts.
- screenshot evidence: Playwright report contains screenshot attachments captured from the browser test flow.

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `src/**`
- `drizzle/**`

## Verification Summary

- `docker compose ps` confirmed local PostgreSQL/pgvector is running and healthy:
  - `tiku-postgres-dev`, image `pgvector/pgvector:pg16`, service `tiku-postgres`, status `Up 27 hours (healthy)`, port `127.0.0.1:5432->5432/tcp`.
- `Invoke-QualityGate.ps1` passed:
  - lint: pass.
  - typecheck: pass.
  - unit tests: pass, `103` files and `379` tests passed.
  - format check: pass.
- `npm.cmd run build` passed with Next.js 16.2.6 and listed the `/api/v1/` REST surface for student, admin, audit_log, ai_call_log, RAG/resource, paper, question, material, auth/session, and operations endpoints.
- `npm.cmd run test:e2e` passed:
  - `2` Chromium tests passed.
  - `e2e/home.spec.ts`: root navigation page.
  - `e2e/local-business-flow.spec.ts`: local student, admin, audit, and mock AI business flow.
- Screenshot artifact status:
  - `playwright-report/index.html` was generated.
  - `playwright-report/data/*.png` contains browser screenshot attachments from the E2E flow.
- Trace artifact status:
  - Playwright is configured with `trace: "on-first-retry"`.
  - No trace zip was generated because the run passed without retry.
- Tab cleanup:
  - No extra browser tabs were opened by the test flow.
  - Playwright closed the single worker browser context at test completion.

## Validation Commands

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-mvp-acceptance-browser-api-verification
docker compose ps
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-mvp-acceptance-browser-api-verification`: pass; task is pending, dependencies complete, `taskPlanPolicy: evidence_only`, and allowed/blocked files confirmed.
- `docker compose ps`: pass; local `tiku-postgres-dev` is healthy.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Invoke-QualityGate.ps1`: pass; lint, typecheck, unit tests, and format check passed.
- `npm.cmd run build`: pass; optimized production build compiled successfully.
- `npm.cmd run test:e2e`: pass; `2` Chromium tests passed.
- `Test-NamingConventions.ps1`: pass; banned terms absent, route folders kebab-case/public-id params, DTO fields camelCase.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory before evidence/state edits; branch had no tracked, staged, or untracked changes at that point.

## Residual Risk

- This task is verification-only and did not modify `src/**`; any future runtime defect discovered after this point must be handled by a separate queue item with an allowed file scope that permits the affected runtime code.
- E2E intentionally allows three browser console 405 messages produced by read-only log write probes; those are narrowly scoped to the audit_log and ai_call_log read-only guarantee and are not treated as unexpected application errors.
- Browser verification is local Chromium-based, matching the current Playwright project; broader managed-browser/customer-network acceptance remains outside this task.
- No real AI provider, production credential, production database, production resource, dependency, lockfile, `.env.example`, schema, migration, deployment, or PR change was made.

## Git Closeout

- implementationCommit: pending.
- merge: pending.
- postMergeValidation on `master`: pending.
- masterCloseoutEvidenceCommit: pending.
- push: pending.
- cleanup: pending.

## Taste Compliance Self-Check

- Frontend visual taste: no UI or styling changes; no pure black, no unreviewed gradient, and no token changes.
- Loading/empty/error: existing E2E validates available user-facing flows without changing runtime state handling.
- Interaction feedback: no interaction behavior changed.
- Tailwind formatting: no Tailwind classes changed; format gate passed.
- Backend/API contract: browser API assertions verify standard envelopes, camelCase keys, pagination shape, publicId-only DTOs, and no internal `id`.
- Naming discipline: naming convention gate passed.
- Data privacy: evidence does not record session tokens, passwords, secrets, API keys, raw prompts, raw answers, internal auto-increment IDs, or plaintext redeem codes.
- Auth/session/authorization: protected student/admin flows are exercised using local dev data only; tokens are asserted private and not recorded.
- audit_log/ai_call_log: read paths verified, write probes rejected, and read-only guarantee remains intact.
- Dependency/schema isolation: no dependency, lockfile, environment, schema, migration, runtime, production-resource, deployment, or PR changes.
