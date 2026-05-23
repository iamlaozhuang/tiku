# Audit Review: phase-11-local-product-readiness-roleplay-run

## Boundary

This role-play run used local `dev` only.

No application source code, dependency, schema, migration, script, `.env.local`, `.env.example`, cloud resource, deployment target, staging/prod service, provider configuration, or secret was changed.

Evidence below intentionally records route-level and state-level observations only. It does not include secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR content, or private customer/customer-like data.

## Runtime Context

- Branch: `codex/phase-11-local-product-readiness-roleplay-run`
- Base URL: `http://127.0.0.1:3000`
- Browser: Playwright Chromium, desktop viewport `1366x768`
- Docker: local `tiku-postgres-dev` was started after initial `docker compose ps` showed no running services.
- Dev server: local Next dev server on `127.0.0.1:3000`

## Coverage

| Role            | Covered routes                                                                                                                                                                           |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| unauthenticated | `/login`, `/home`, `/ops/users`, `/content/questions`, invalid login                                                                                                                     |
| student         | `/home`, `/practice`, `/practice?paperPublicId=paper-dev-theory`, `/mock-exam`, `/mock-exam?paperPublicId=paper-dev-theory`, `/exam-report`, `/mistake-book`, `/redeem-code`, `/profile` |
| admin           | `/ops/users`, `/ops/organizations`, `/ops/redeem-codes`, `/ops/resources`, `/ops/ai-audit-logs`, `/ops/audit-logs`                                                                       |
| content         | `/content/questions`, `/content/materials`, `/content/papers`, `/content/knowledge-nodes`                                                                                                |
| error-state     | missing `examReportPublicId`, missing `practicePublicId`, missing `mockExamPublicId`                                                                                                     |

## Findings

### LPR-RP-001: Protected pages render without a local session

- route: `/home`, `/ops/users`, `/content/questions`
- role: `unauthenticated`
- severity: `P0`
- steps: Clear local session storage, open the student, admin, and content routes directly.
- expected: Protected student/admin/content surfaces should redirect to `/login` or show an explicit unauthenticated state before rendering product data or operations.
- observed: Each route returned HTTP 200 and rendered a meaningful page shell. `/ops/users` and `/content/questions` exposed admin/content navigation while unauthenticated.
- stagingDecision: `block_staging_entry_until_fixed_or_explicitly_downgraded`. Staging must not expose admin/content surfaces without an auth guard.
- evidence: Playwright desktop route summary, no response errors, no redirect from protected routes.
- recommendedOwnerTask: `phase-11-staging-entry-fix-auth-route-guards`

### LPR-RP-002: Admin shell AI audit navigation points to a missing route

- route: `/ops/audit-logs`
- role: `admin`
- severity: `P1`
- steps: Log in as local admin, inspect/click the admin shell AI/audit navigation link target.
- expected: Admin navigation should route to the AI audit log surface that exists at `/ops/ai-audit-logs`, or the visible navigation label and route should be aligned.
- observed: The shell link target is `/ops/audit-logs`, which returns HTTP 404. Direct navigation to `/ops/ai-audit-logs` returns HTTP 200.
- stagingDecision: `fix_before_staging_if_admin_ai_audit_is_in_acceptance_scope`.
- evidence: Playwright route check: `/ops/audit-logs` -> 404; `/ops/ai-audit-logs` -> 200.
- recommendedOwnerTask: `phase-11-staging-entry-fix-admin-audit-navigation`

### LPR-RP-003: Student practice and mock_exam direct entry do not start an actionable flow

- route: `/practice?paperPublicId=paper-dev-theory`, `/mock-exam?paperPublicId=paper-dev-theory`
- role: `student`
- severity: `P1`
- steps: Log in as local student and open practice/mock_exam links from the student home paper card.
- expected: The routes should create or resume a `practice` / `mock_exam`, show questions, and provide answer controls.
- observed: Both routes render a student shell with no answer controls, no create/resume CTA, no alert, and no error/status explanation.
- stagingDecision: `fix_before_staging_if_student_acceptance_includes_practice_or_mock_exam`.
- evidence: Playwright route summary recorded zero buttons on both paper-specific entry routes.
- recommendedOwnerTask: `phase-11-staging-entry-fix-student-practice-mock-entry`

### LPR-RP-004: Content management primary actions are enabled but not browser-complete

- route: `/content/questions`, `/content/materials`, `/content/papers`
- role: `content`
- severity: `P1`
- steps: Log in as local admin/content-capable user, open content routes, click primary enabled content action buttons.
- expected: Visible enabled actions such as create/edit/disable/copy/publish/archive should either complete a browser flow or open an explicit unavailable/confirmation state.
- observed: `/content/questions` exposes enabled action buttons; clicking the first enabled action left the same path with no dialog, alert, status, toast, or navigation. Source inspection confirms multiple content action buttons are rendered without action handlers.
- stagingDecision: `fix_before_staging_if_content_admin_is_in_acceptance_scope`; otherwise record as a named known limitation.
- evidence: Playwright interaction summary for `/content/questions`; source inspection limited to button/action ownership.
- recommendedOwnerTask: `phase-11-staging-entry-fix-content-action-closures`

### LPR-RP-005: Missing-object error states are not explicit on student runtime routes

- route: `/exam-report?examReportPublicId=missing-report`, `/practice?practicePublicId=missing-practice`, `/mock-exam?mockExamPublicId=missing-mock`
- role: `error-state`
- severity: `P2`
- steps: Log in as local student and open routes with intentionally missing public IDs.
- expected: Each route should show an explicit not-found, unavailable, or recovery state.
- observed: The routes returned HTTP 200 and rendered a generic student shell with no alert, no status region, and no recovery-specific message captured.
- stagingDecision: `can_enter_staging_only_as_named_known_limitation_if_core_happy_paths_are_fixed`.
- evidence: Playwright route summaries recorded no alert/status/dialog for missing-object routes.
- recommendedOwnerTask: `phase-11-staging-entry-fix-student-error-states`

### LPR-RP-006: Admin resource operations are disabled without enough acceptance guidance

- route: `/ops/resources`
- role: `admin`
- severity: `P2`
- steps: Log in as local admin and open resource operations.
- expected: Disabled or unsupported RAG/resource operations should make acceptance scope and next action explicit.
- observed: Resource operation buttons are disabled in the rendered page. This is safer than a broken enabled action, but the role-play did not capture a clear explanation of why these operations are unavailable or what acceptance scope excludes.
- stagingDecision: `can_enter_staging_as_named_known_limitation_if_rag_admin_actions_are_out_of_scope`.
- evidence: Playwright route summary recorded disabled resource buttons.
- recommendedOwnerTask: `phase-11-staging-entry-define-rag-admin-operation-scope`

### LPR-RP-007: Admin organization and redeem_code operations are mostly read-only

- route: `/ops/organizations`, `/ops/redeem-codes`
- role: `admin`
- severity: `P2`
- steps: Log in as local admin and open organization/redeem_code operations.
- expected: If these routes are part of staging acceptance, organization status handling and redeem_code creation/conflict flows should be browser-complete.
- observed: Both routes render page shells/lists, but the role-play did not capture create/search/filter/disable or conflict-resolution controls.
- stagingDecision: `can_enter_staging_as_named_known_limitation_only_if_admin_ops_acceptance_scope_is_read_only`.
- evidence: Playwright route summaries recorded no buttons on these routes.
- recommendedOwnerTask: `phase-11-staging-entry-define-admin-ops-write-scope`

## Positive Observations

- `/login` rendered with disabled submit before valid local credentials.
- Invalid login stayed on `/login`, showed an alert, and did not store a local session token.
- Valid local student login redirected to `/home`.
- Valid local admin login redirected to `/ops/users`.
- `/ops/ai-audit-logs` rendered successfully when opened directly.
- `/content/materials` and `/content/knowledge-nodes` disabled some non-ready actions, which is preferable to enabled no-op controls.

## Overall Staging Decision

`do_not_enter_staging_yet`.

The local role-play found at least one `P0` auth boundary issue and several `P1` core-flow or acceptance-scope blockers. Before staging implementation continues, create a bounded staging-entry fix scope and decide which P1/P2 surfaces are in acceptance scope.

Recommended next task: `phase-11-staging-entry-fix-scope`.
