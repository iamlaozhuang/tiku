# 0704 Admin Role Overviews And Users IA Polish Implementation Plan

> **For agentic workers:** execute inline with `superpowers:executing-plans`; Subagent use remains blocked without separate approval.

**Goal:** Add role-specific overview workbenches for `super_admin`, `ops_admin`, and `content_admin`, backed by a minimal redacted read-only summary contract, and finish the `/ops/users` information hierarchy polish.

**Architecture:** Add one authenticated `GET /api/v1/admin-overviews?scope=platform|operations|content` route. The route resolves the current admin session, validates role-to-scope access before reading data, and returns aggregate counts only through service and repository layers. Three route pages share one client overview surface while retaining scope-specific copy and links. User management remains a separate operations page and does not load authorization, redeem-code, audit-log, or AI-call-log detail ledgers.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Drizzle ORM, Tailwind design tokens, Vitest and Testing Library.

## Global Constraints

- Branch: `codex/0704-admin-role-overviews-users-ia-polish` based on latest `origin/master`.
- No Subagent, dependency, package/lockfile, schema, migration, seed, Provider, env/secret, staging/prod/deploy, Cost Calibration, or direct DB execution.
- No screenshot, raw DOM, browser trace, credential, session, cookie, token, DB URL, raw DB row, internal ID, card plaintext, raw prompt, raw AI output, Provider payload, full question, paper, material, or resource evidence.
- UI uses existing design tokens and Lucide icons; no hard-coded colors or new dependencies.
- `effectiveEdition`, role scope, and organization context remain service-enforced; UI visibility is not authorization.
- Overview responses contain aggregate counts, status categories, scope, role label, boundary flags, and update time only.
- Evidence records only role label, route label, status category, problem category, fix summary, and test counts.

## Required Baseline Applied

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md` through `adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- Batch 0 P1 items 1 and 4; Batch 0 P2 items 1, 3, and 5.
- Batch 1 P1 items 1, 2, and 4; operations pages use summary-first workbenches without ledger duplication.
- Batch 5 P1 items 1, 2, 3, and 6; content overview preserves formal-content and AI-draft lifecycle separation.

## Task 1: Role Landing And Workspace Guard Contract

**Files:**

- Modify: `src/server/contracts/user-auth/session-boundary.ts`
- Modify: `src/server/contracts/admin-workspace-role-guard-contract.ts`
- Modify: `src/server/services/admin-workspace-role-guard-service.ts`
- Modify: `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- Modify: `src/app/page.tsx`
- Test: `tests/unit/auth/session-personal-auth-boundary.test.ts`
- Test: `tests/unit/admin-workspace-role-guard-contract.test.ts`
- Test: `tests/unit/admin-dashboard-layout-navigation.test.ts`
- Test: `src/components/AdminDashboardLayout/AdminDashboardLayout.test.tsx`

**Interfaces:**

- Produce landing routes `/admin/overview`, `/ops/overview`, and `/content/overview`.
- Extend `AdminWorkspace` with `platform`; only `super_admin` may enter it.
- Preserve organization context gating and current content/operations role separation.

- [x] Write failing tests for the three landing routes, platform workspace guard, overview menu entries, and workspace switch destinations.
- [x] Run the focused tests and confirm expected failures are caused by the missing routes and `platform` workspace.
- [x] Implement the minimal contract, guard, layout, and root-link changes.
- [x] Re-run the focused tests until green.

## Task 2: Minimal Read-Only Overview Summary Contract

**Files:**

- Create: `src/server/contracts/admin-role-overview-contract.ts`
- Create: `src/server/repositories/admin-role-overview-repository.ts`
- Create: `src/server/services/admin-role-overview-service.ts`
- Create: `src/server/services/admin-role-overview-route.ts`
- Create: `src/app/api/v1/admin-overviews/route.ts`
- Test: `src/server/services/admin-role-overview-route.test.ts`

**Interfaces:**

- `AdminOverviewScope = "platform" | "operations" | "content"`.
- `AdminRoleOverviewDto` is a discriminated union with aggregate-only operations and content summaries.
- Repository methods are `readOperationsSummary(now)` and `readContentSummary()`; platform calls both in parallel only after super-admin authorization.
- Response uses `{ code, message, data }`; invalid scope, missing session, and role mismatch return redacted errors before repository access.

- [x] Write failing service/route tests for allowed roles, cross-role denial, invalid scope, redaction, and repository call isolation.
- [x] Run the test and confirm the missing contract/route failures.
- [x] Implement the contract and service authorization boundary.
- [x] Implement aggregate-only Drizzle queries without returning rows or identifiers.
- [x] Add the thin API route adapter.
- [x] Re-run the service/route tests until green.

## Task 3: Three Role Workbench Pages

**Files:**

- Create: `src/features/admin/admin-role-overview/AdminRoleOverviewPage.tsx`
- Create: `src/app/(admin)/admin/overview/page.tsx`
- Create: `src/app/(admin)/ops/overview/page.tsx`
- Create: `src/app/(admin)/content/overview/page.tsx`
- Test: `tests/unit/admin-role-overview-ui.test.ts`

**Interfaces:**

- `AdminRoleOverviewPage({ scope })` fetches only `/api/v1/admin-overviews?scope=...`.
- Platform view shows cross-workspace risk categories and safe workspace entries.
- Operations view shows account, organization/authorization, redeem-code, and log/AI governance categories.
- Content view shows formal question/paper lifecycle and isolated AI draft-review categories.
- Loading, empty, error, unauthorized, and disabled states reuse existing admin state patterns.

- [x] Write failing component tests for all three scopes and state variants.
- [x] Confirm RED failures before adding page code.
- [x] Implement the shared workbench shell with scope-specific sections and token-driven styling.
- [x] Add route pages and verify links do not expose or navigate to unrelated domains.
- [x] Re-run component and navigation tests until green.

## Task 4: Final `/ops/users` Information Hierarchy

**Files:**

- Modify: `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- Modify: `tests/unit/admin-ops-summary-first-ui.test.ts`

**Interfaces:**

- Remove the duplicate explanatory summary and KPI-card bands from the user page.
- Keep one `学员与员工账号` work area containing count, filters, column headers, rows, and shared pagination.
- Hide `publicId` from list rows; retain it only in the detail surface.
- Keep backend account security and account creation after the user list; creation form is collapsed until explicitly opened.
- Preserve existing confirmation, permission, API, and pagination behavior.

- [x] Write failing UI assertions for list-first hierarchy, hidden row identifier, table-like columns, collapsed creation form, and retained cross-domain exclusions.
- [x] Confirm RED failures against the current page.
- [x] Implement minimal JSX/layout changes without altering business services or APIs.
- [x] Re-run targeted user-management tests until green.

## Task 5: Adversarial Review, Evidence, And Closeout

**Files:**

- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/05-execution-logs/evidence/2026-07-11-0704-admin-role-overviews-users-ia-polish-evidence.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-11-0704-admin-role-overviews-users-ia-polish-audit.md`

- [x] Review role, workspace, organization, edition, content lifecycle, employee/admin isolation, aggregate redaction, and complete UI states.
- [x] Run targeted tests for route, service, layout, overview UI, and user management.
- [x] Run `corepack pnpm@10.26.1 run lint`.
- [x] Run `corepack pnpm@10.26.1 run typecheck`.
- [x] Run `git diff --check`.
- [x] Run Module Run v2 pre-commit and pre-push readiness commands.
- [ ] Write redacted evidence and audit, commit one reviewable task change, fast-forward merge to `master`, rerun gates, push `origin/master`, delete the short branch, and confirm clean alignment.

## Self-Review

- Scope covers all three approved role workbenches, the minimal read-only contract, and user management final IA.
- No placeholders, dependency work, Provider execution, environment work, deployment, screenshot, or production-readiness claim is present.
- Route, service, repository, UI, and tests follow ADR-002 boundaries and project terminology.
- The plan does not treat overview UI visibility as authorization or edition enforcement.
