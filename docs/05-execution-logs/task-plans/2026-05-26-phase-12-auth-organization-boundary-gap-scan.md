# Phase 12 Auth Organization Boundary Gap Scan

**Task id:** `phase-12-auth-organization-boundary-gap-scan`

**Branch:** `codex/phase-12-auth-organization-boundary-gap-scan`

**Goal:** Execute the unauthenticated, insufficient-permission, organization, employee, and authorization boundary slice from the Phase 12 role-scenario scripts with code inspection plus localhost browser/e2e validation. Record gaps only; do not change auth, permission, runtime, UI, tests, dependencies, schema, migrations, package manifests, lockfiles, scripts, or environment files.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/student-experience-contract.md`
- `docs/02-architecture/interfaces/phase-11-role-based-full-flow-acceptance-contract.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-role-scenario-script-plan.md`
- `docs/05-execution-logs/evidence/2026-05-26-phase-12-admin-experience-gap-scan.md`

## allowedFiles

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`

## blockedFiles

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Role And Scenario Scope

Primary roles:

- unauthenticated user.
- student without effective `authorization`.
- student with expired or no-longer-effective authorization state, code-level only.
- `ops_admin` / `super_admin` organization, employee, `org_auth`, and `redeem_code` management view.
- insufficient-permission admin role, especially `content_admin` attempting system-ops mutations.

Covered scripts from the prior plan:

- S1 login/session/route-guard boundary.
- S3 student no-auth and authorization-loss boundary.
- S5 organization, employee, org_auth, redeem_code, and role boundary.

Deferred:

- AI/model_config/prompt_template redaction deep scan remains `phase-12-ai-redaction-runtime-gap-scan`.
- Business fixes remain follow-up tasks seeded by the final closeout.

## Experience Script Design

### Unauthenticated Route Guard

Preconditions:

- Local browser starts without `tiku.localSessionToken`.
- Local dev server or Playwright web server uses `http://127.0.0.1:3000`.

Steps:

1. Visit representative student route `/home`.
2. Visit representative admin routes `/ops/users` and `/content/questions`.
3. Cross-check whether all student and admin route groups share `ProtectedRouteGuard`.
4. Compare browser e2e coverage with current route inventory.

Expected results:

- Protected routes redirect to `/login`.
- Protected layouts do not flash admin or student navigation after unauthorized redirect.
- Browser e2e covers every route family with role-sensitive behavior, not only a small sample.

### Student No-Authorization Boundary

Preconditions:

- A local student session exists with no effective `authorization`.
- No credential or token value is recorded.

Steps:

1. Login as no-auth student through local acceptance flow.
2. Confirm `/home` shows no effective authorization guidance and no paper cards.
3. Confirm purchase/redeem guidance is visible.
4. Cross-check whether direct hits to practice/mock/report/mistake_book routes and APIs are covered for no-auth students.

Expected results:

- No paper metadata leaks outside scope.
- Student actions requiring `authorization` fail with standard API envelopes.
- Browser e2e covers direct-route and API denial paths, not only the home empty state.

### Organization, Employee, And Insufficient Permission

Preconditions:

- Admin role sessions are local-only and created by test/runtime fixtures.
- No generated redeem_code plaintext, generated password, token, or Authorization header is recorded.

Steps:

1. Inspect organization, employee, org_auth, redeem_code services and tests for disabled, expired, cancelled, overlap, depth, and cascade handling.
2. Inspect admin role checks for `ops_admin`, `content_admin`, and `super_admin`.
3. Use browser e2e coverage to confirm `/ops/organizations` and `/ops/redeem-codes` render role-required operations.
4. Compare role-based unit coverage with browser-level insufficient-permission scenarios.

Expected results:

- Service-level checks deny incorrect role actions with standard envelopes.
- Browser e2e proves insufficient-permission admin users see denial or guarded UI on representative admin surfaces.
- Organization and employee UX copy matches the operations context.

## Browser Verification Plan

- Use repository Playwright e2e as the real-browser verification path because the Browser plugin could not reliably enter login text or mutate local session state in the prior admin task.
- Run `npm.cmd run test:e2e` for localhost Chromium coverage.
- Record route names, status labels, and UI labels only.
- Do not record credentials, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, generated passwords, plaintext redeem codes, full papers, full教材, OCR text, or customer-like private data.

## Code Cross-Check Paths

- `src/components/ProtectedRouteGuard/ProtectedRouteGuard.tsx`
- `src/components/StudentAppLayout/StudentAppLayout.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/server/services/session-service.ts`
- `src/server/services/session-service.test.ts`
- `src/server/services/student-paper-service.ts`
- `src/server/services/student-paper-service.test.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/organization-auth-service.ts`
- `src/server/services/organization-auth-service.test.ts`
- `src/server/services/redeem-code-authorization-service.ts`
- `src/server/services/redeem-code-authorization-service.test.ts`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `src/server/services/admin-redeem-code-runtime.ts`
- `e2e/local-auth-route-guard.spec.ts`
- `e2e/staging-required-role-flows.spec.ts`
- `e2e/local-business-flow.spec.ts`
- `e2e/role-based-acceptance/role-based-full-flow.spec.ts`
- `tests/unit/protected-route-guard-ui.test.ts`
- `tests/unit/phase-11-system-ops-organization-management-loop.test.ts`
- `tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts`
- `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`

## Risk Defense

- Documentation/evidence-only change.
- No auth, permission, runtime, UI, test, dependency, package, lockfile, schema, migration, script, or environment file edit.
- No staging, production, cloud, real provider, deployment, or destructive data operation.
- Browser and command outputs are summarized with sensitive values omitted.
- Any implementation gap is recorded for follow-up rather than fixed in this task.

## Verification Commands

- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Sensitive Information Red Lines

Do not record secrets, tokens, Authorization headers, database URLs, real customer data, raw provider payloads, raw prompts, raw answers, raw model responses, full教材, full paper/OCR text, plaintext redeem codes, generated passwords, or `.env.local` / `.env.example` contents.
