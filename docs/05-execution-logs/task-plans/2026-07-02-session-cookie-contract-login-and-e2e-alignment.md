# Session Cookie Contract Login And E2E Alignment Task Plan

Task id: `session-cookie-contract-login-and-e2e-alignment-2026-07-02`

Branch: `codex/session-cookie-contract-login-and-e2e-alignment`

## Objective

Restore a trustworthy local session and acceptance baseline before any further AI Provider or AI功能验收 work.

The task is limited to aligning login UI, student/admin local session helpers, and the selected local e2e fixtures with
the current cookie-backed session contract:

- `POST /api/v1/sessions` issues the session through an HttpOnly cookie.
- The login JSON response must not expose a reusable session token.
- Browser and local e2e flows must rely on cookie-backed session state or redacted test-only cookie headers, not
  client-visible token fields.

## Scope Guard

- Allowed source/test writes are limited to login UI, session helper usage, and the selected stage 3 local e2e specs.
- Allowed documentation writes are limited to this task plan, evidence, audit review, project state, and task queue.
- Allowed runtime is the same bounded stage 3 Playwright set against local localhost/127.0.0.1 only.
- Blocked: AI Provider calls, AI Provider configuration reads, AI功能验收 reruns, env/secret reads, direct DB access,
  schema/migration/seed changes, dependency/package/lockfile changes, staging/prod/cloud/deploy, PR, force push,
  Cost Calibration, release readiness, final Pass, and production usability claims.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md`
- `docs/05-execution-logs/evidence/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-role-workflow-experience-walkthrough-from-code-baseline.md`

## Implementation Plan

1. Reconfirm the current session contract in `src/server/auth/session-route.ts`.
2. Remove stale login UI assumptions that `data.token` is present after successful login.
3. Ensure student runtime helpers distinguish "session exists" from "request token exists", so cookie-backed sessions
   are treated as authenticated without adding `Authorization` headers.
4. Update selected local e2e helpers to assert HttpOnly cookie issuance and avoid expecting client-visible
   `data.token`.
5. Update admin denial fixtures to use current-session/cookie-backed behavior and the current workspace guard instead
   of synthetic localStorage bearer token assumptions.
6. Rerun the exact same stage 3 Playwright set and record only redacted status/count summaries.

## Acceptance Criteria

- Login UI no longer requires a returned `data.token` for personal users.
- Local e2e login helpers no longer read or assert `data.token` from session responses.
- Browser student flows can proceed with cookie-backed session markers.
- Admin role denial fixture validates current-session workspace denial without synthetic bearer tokens.
- The same stage 3 spec set is rerun once after repair.
- Evidence records command status, test counts, failure classes if any, touched file categories, and redacted
  summaries only.
- No credentials, cookie/session/token/localStorage values, Authorization headers, env values, raw DB rows, internal
  ids, PII, Provider payloads, prompts, raw AI I/O, raw DOM, screenshots, traces, or full content are recorded.
- No release readiness, final Pass, production usability, Cost Calibration, Provider, DB, dependency, schema, or deploy
  claim is made.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/student-login-ui.test.ts src/server/auth/session-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts e2e/local-full-loop-baseline-accounts-auth-db.spec.ts e2e/personal-ai-generation-local-request.spec.ts e2e/student-practice-mock-entry.spec.ts e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --reporter=line`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd exec -- prettier --write --ignore-unknown <touched files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <touched files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId session-cookie-contract-login-and-e2e-alignment-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId session-cookie-contract-login-and-e2e-alignment-2026-07-02`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId session-cookie-contract-login-and-e2e-alignment-2026-07-02 -SkipRemoteAheadCheck`

## Risk Defense

- Do not weaken the server-side HttpOnly cookie contract to satisfy tests.
- Do not reintroduce client-visible reusable session tokens.
- Keep fixture-only cookie handling inside e2e helpers and never write raw cookie values to evidence.
- Stop and classify any remaining stage 3 failure instead of expanding scope into AI Provider, DB, dependency, or
  product behavior changes.
