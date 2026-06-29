# Org Advanced Analytics Summary Load Failure Stage C Repair Plan

## Task

- Task id: `org-advanced-analytics-summary-load-failure-stage-c-repair-2026-06-28`
- Branch: `codex/org-advanced-analytics-summary-repair-20260628`
- Task kind: `implementation_tdd`
- Execution profile: `local_source_test_repair_org_advanced_analytics_summary`
- Pre-task master checkpoint: `585b94390da722b325ea7099244840f19b1bcc4e`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`

## Scope

Repair only the recorded `ORG-ADV-ANALYTICS-001` gap: advanced organization admin analytics shows scope context but
loads into a failed summary/no-card state in local acceptance.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-org-advanced-analytics-summary-load-failure-stage-c-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-28-org-advanced-analytics-summary-load-failure-stage-c-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-summary-load-failure-stage-c-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-org-advanced-analytics-summary-load-failure-stage-c-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-28-org-advanced-analytics-summary-load-failure-stage-c-repair.md`
- `src/features/admin/organization-analytics/**`
- `src/app/(admin)/organization/organization-analytics/page.tsx`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`

## Blocked Files And Actions

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, `migrations/**`, `seed/**`
- unrelated `src/**` and `tests/**`
- direct DB write/read beyond app runtime behavior
- Provider calls/configuration, prompts, raw AI IO
- screenshots, traces, raw DOM, raw DB rows, internal IDs, PII, credentials, cookies, tokens, sessions, localStorage,
  Authorization headers
- staging/prod/deploy, PR, force push, release readiness, final Pass, Cost Calibration

## Plan

1. Re-read required standards and ADRs for this source-repair task.
2. Inspect the organization analytics feature and focused unit test.
3. Reproduce the failing expectation in a focused test or add a focused regression test if no existing test captures it.
4. Make the smallest source repair so local advanced organization analytics exposes a safe summary/status surface instead
   of only a failed summary/no-card state.
5. Run focused tests, lint/typecheck as needed, prettier, diff check, Module Run v2 gates.
6. Write redacted evidence, commit, fast-forward merge to master, push, and clean up.

## Risk Controls

- No Provider, DB schema, seed, migration, dependency, staging/prod, PR, final Pass, or Cost Calibration work.
- Evidence records only route/status/control/test counts and failure classes.
- Any broader analytics architecture issue becomes a follow-up task rather than expanding this task.
