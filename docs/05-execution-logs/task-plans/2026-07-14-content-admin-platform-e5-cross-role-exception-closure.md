# Content Admin Platform E5 Cross-Role Exception Closure Plan

Date: 2026-07-14

Task: `content-admin-platform-e5-cross-role-exception-closure-2026-07-13`

Branch: `codex/content-admin-platform-e5-cross-role-exception-closure`

Profile: R3 / `independent_audit`

Baseline: `master == origin/master == 71565460493c28e1f18e457256c8713f17d77775`

## Goal

Close the four cross-role route exceptions recorded by E0 without reopening closed role, authorization or AI findings.
Production must not expose the developer design-system route; the legacy content organization-portal alias must enter the
organization workspace guard instead of rendering organization UI directly; operations compatibility aliases must retain
their documented ownership and redaction destination; public discovery and post-login routing must remain distinct from
runtime authorization. Finish with no approved exception left in the E-series ledger.

## Required Reading

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- B-F serial plan, standing authorization, PIC coverage/exception ledger, E0 plan/evidence, E1-E4 closeouts, Module Run
  v3, closeout and archive SOPs.
- Standard and advanced requirement indexes; edition-aware authorization requirements, advanced authorization-context
  module and ADR-007.
- Current role/auth/training/operations decision package, role-separated MVP alignment, permission-role inventory and
  Unit B static role-boundary review.
- Full-role UI/UX Batch 0, Batch 1 and Batch 5 traceability plus the route-family implementation and focused tests for
  root discovery, backend layout, role guard, post-login session routing, organization portal and compatibility aliases.

The source hierarchy and time order leave no unresolved business conflict. E0-G01 through E0-G04 are current closure
candidates; historical role findings remain closed unless a fresh focused test fails on the current baseline.

## Baseline Application

- E0-G01: `(dev)` is only a URL-transparent route group. Its comment does not restrict `/design-system` in production,
  and no production denial contract exists.
- E0-G02: `/content/organization-portal` directly renders organization UI while adjacent organization aliases redirect
  into guarded organization routes. This is an inconsistent authorization entry.
- E0-G03: `/ops/resources` intentionally redirects to content-owned `/content/resources`; `/ops/ai-audit-logs`
  intentionally redirects to redacted `/ops/audit-logs`. These require exact destination and role-denial proof, not new
  write authority.
- E0-G04: root links are public discovery only. Server session routing and `admin-workspace-role-guard-service` remain
  the actual role boundaries.

## Design

1. Add a server layout for `(dev)` that calls `notFound()` outside `NODE_ENV=development`. Keep the existing client
   design-system page intact for local development and export a pure environment predicate for focused proof.
2. Replace the direct `/content/organization-portal` render with an exact redirect to `/organization/portal`, matching
   the other organization aliases so the destination layout and service guard enforce organization context.
3. Add one focused cross-role closure suite. It proves the production dev-route denial predicate, exact legacy redirects,
   exact public discovery links, role-specific post-login destinations and allow/deny decisions for every alias target.
4. Do not alter shared role guards, authorization computation, API, DB, Provider, dependencies, build configuration or
   product data unless a fresh RED test proves a defect inside this task.

## Boundary Guards

- Menu visibility, redirects and public links never substitute for server-session and service-layer authorization.
- `content_admin` cannot gain organization or operations context through an alias; `ops_admin` cannot regain content
  resource write ownership; organization roles cannot reach global logs; only `super_admin` spans backend workspaces.
- `effectiveEdition` stays service-computed. No UI flag, query parameter, organization selector or fallback capability
  grants access.
- Audit/log aliases remain redacted surfaces. No credential, token, prompt, Provider payload, raw answer, plaintext
  `redeem_code`, private object or database row enters tests or evidence.
- No A01-A30, historical paper-assembly, schema, dependency, test-infrastructure, external behavior or deployment change.

## Allowed Changes

- `src/app/(dev)/layout.tsx`
- `src/app/(admin)/content/organization-portal/page.tsx`
- `tests/unit/admin-cross-role-exception-closure.test.ts`
- narrowly necessary focused tests only if a fresh failure proves a shared contract defect
- E5 plan/evidence/audit, active state/queue/history and PIC ledger declared by the queue

## Execution

- [x] RED: add the focused suite first and prove the missing production gate plus direct-render alias fail.
- [x] GREEN: add the smallest dev layout and organization alias redirect; make the focused suite pass.
- [x] Run the backend role guard, dashboard navigation/layout, root discovery, session routing, organization alias,
      resource and audit-log focused suites. Fix only fresh E5-scope regressions.
- [x] Run lint, typecheck, changed-file Prettier and diff checks. Because E5 is R3 cross-role authorization closure, run
      the full unit suite and production build serially, then recovery/serial/security Guards.
- [x] Conduct adversarial review rounds 1 and 2, repair findings and rerun affected gates. Update concise evidence,
      independent audit, state/queue/history and PIC ledger; pass pre-commit, closeout and pre-push Guards.

## Validation

- RED/GREEN: `D:\tiku\node_modules\.bin\vitest.cmd run tests/unit/admin-cross-role-exception-closure.test.ts`.
- Focused suites use explicit paths and heavy gates run serially.
- Quality gates use locked executables from `D:\tiku\node_modules\.bin`, followed by `git diff --check` and the
  repository Guard commands. The production build runs from the repository root against `.worktrees/e5` because the
  worktree `node_modules` junction is outside Turbopack's project root.
- The verified task commit is ff-only merged, so the complete regression is not mechanically repeated after merge.

## Adversarial Review

- Round 1: production route availability, exact redirect targets, route ownership, server-session landing, guard matrix,
  organization scope, edition source, log redaction and evidence completeness.
- Round 2: direct URL escalation, redirect chaining, missing organization context, contaminated roles, discovery-link
  misuse, production/test environment drift, client bypass, alias loops, secret leakage, over-broad gating and needless
  shared-guard changes.

Closeout uses one principal commit, ff-only merge to `master`, authorized push to `origin/master`, remote equality proof
and isolated-resource cleanup. E6 starts automatically. No deployment.
