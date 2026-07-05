# 2026-07-04 Full-chain Scenario 5 Advanced Org Package Rerun After Login Input State Binding Repair Plan

## Task

- Task id: `full-chain-scenario-5-advanced-org-package-rerun-after-login-input-state-binding-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-5-advanced-org-package-rerun-after-login-input-state-binding-repair-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scenario selector label: `fc_scenario_5_advanced_org_package`
- Restart node: browser login and advanced organization surface checks only.

## Goal

Continue Scenario 5 from the affected browser login node after the login hydration/readiness repair. Do not repeat the
already passed advanced employee import mutation. Prove the three evidence lanes separately:

- API session lane for the approved organization admin selectors.
- Browser login form-state lane after hydrated/interactable readiness.
- Permission/surface boundary lane for advanced organization surfaces and negative workspace boundaries.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-org-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-org-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-org-package-rerun-after-employee-import-harness-repair.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-login-input-state-binding-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-login-input-state-binding-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-login-input-state-binding-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/server/auth/session-route.ts`
- `src/server/auth/session-cookie.ts`
- `src/server/auth/local-session-runtime.ts`
- `src/server/services/admin-workspace-role-guard-service.ts`
- `src/features/admin/organization-workspace/admin-organization-workspace-access.ts`
- `src/features/admin/content-admin-runtime.tsx`
- `src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/db/schema/auth.ts`
- `src/db/schema/organization-training.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Execution Plan

1. Preflight the short branch, private selector availability, target DB label, and absence of forbidden output.
2. Start the local app with the isolated target DB and redacted runtime environment.
3. Run API session lane for `fc_org_advanced_admin_created_by_ops` and the standard admin negative selector.
4. Run browser login form-state lane: wait for hydrated/interactable login surface before private credential fill, then
   verify React-observed submit enabled before submission.
5. Run permission/surface boundary lane:
   - advanced org admin allowed: organization portal, enterprise training, organization analytics;
   - advanced org admin denied: global ops/content workspaces;
   - standard org admin denied or standard-unavailable: advanced organization training and analytics.
6. Run selector-scoped aggregate DB verification without raw rows or internal ids.
7. Stop the task-owned local runtime.
8. Update evidence/audit/state/queue, then run scoped Prettier, `git diff --check`, blocked path diff, Module Run v2
   pre-commit, and Module Run v2 pre-push.

## Stop Rules

Stop and split a bounded repair/provisioning task if login fails after hydrated readiness, DB target mismatches, private
selector input is missing, employee import would need to rerun, source/test/schema/seed/dependency changes are needed,
permissions are bypassed or weakened, redaction risk appears, Provider/staging/prod/Cost is needed, destructive DB work
is needed, or any release readiness/final Pass/production usability claim would be required.

## Evidence Boundary

Allowed evidence is limited to task id, branch, route/surface labels, selector labels, role labels, aggregate counts,
command labels, pass/fail/block, and redacted summaries. Evidence must not include credentials, phone, email, connection
strings, tokens, cookies, sessions, localStorage, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM,
traces, Provider payloads, raw prompts, AI I/O, full materials/questions/papers, raw employee answers, plaintext card
values, or private fixture contents.

## Non-Claims

This task does not claim release readiness, final Pass, production usability, Provider readiness, Cost Calibration, or
staging/prod readiness.
