# Org Advanced Analytics Browser Rerun After Summary Repair Plan

## Task

- Task id: `org-advanced-analytics-browser-rerun-after-summary-repair-2026-06-28`
- Branch: `codex/org-advanced-analytics-browser-rerun-20260628`
- Task kind: `acceptance_runtime_walkthrough`
- Execution profile: `local_browser_read_only_acceptance_rerun`
- Pre-task master checkpoint: `f24e9a7e9bf79878aa9ca5c81df759677f4b8ef4`

## SSOT Read List

- `AGENTS.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-summary-load-failure-stage-c-repair.md`

## Requirement Mapping Result

- Standard owner-facing coverage source: `docs/01-requirements/00-index.md`.
- Advanced authorization source: `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- Mandatory role checklist source:
  `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`.
- Scoped checklist row: `org_advanced_admin.organization_analytics`.
- Prior blocker evidence: `ORG-ADV-ANALYTICS-001`.
- This task maps only the post-repair read-only browser rerun for the scoped row; it does not claim full matrix
  completion or final Pass.

## Scope

Rerun the owner-facing localhost browser check for `org_advanced_admin.organization_analytics` after the source/test
repair that auto-loads the scoped analytics summary.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-org-advanced-analytics-browser-rerun-after-summary-repair.md`
- `docs/05-execution-logs/task-plans/2026-06-28-org-advanced-analytics-browser-rerun-after-summary-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-browser-rerun-after-summary-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-org-advanced-analytics-browser-rerun-after-summary-repair.md`
- `docs/05-execution-logs/acceptance/2026-06-28-org-advanced-analytics-browser-rerun-after-summary-repair.md`

## Read-Only Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-owner-facing-local-experience-batch.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-summary-load-failure-stage-c-repair.md`
- `D:/tiku-local-private/acceptance/role-separated-local-accounts-2026-06-23.md`
- `src/app/api/v1/local-acceptance-sessions/route.ts`
- `src/server/services/local-acceptance-session-service.ts`
- `tests/unit/local-acceptance-session-bootstrap.test.ts`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`

## Blocked Files And Actions

- `.env*`
- `package.json`, lockfiles, dependency changes
- `src/**`, `tests/**`, `e2e/**`, `scripts/**`
- `src/db/schema/**`, `drizzle/**`, `migrations/**`, `seed/**`
- raw DOM, screenshots, traces, raw DB rows, internal ids, PII, credentials, cookies, tokens, sessions, localStorage,
  Authorization headers
- Provider execution/configuration, prompts, raw AI input/output, Cost Calibration
- UI/API mutation, direct DB change, schema/migration/seed
- staging/prod/deploy, PR, force push, release readiness, final Pass

## Plan

1. Reconfirm required standards and scoped evidence.
2. Use local-only test-owned account/session switching or safe local acceptance session bootstrap.
3. Visit `/organization/organization-analytics` on localhost or 127.0.0.1.
4. Record redacted visible status/count evidence for scope context, summary card, employee statistics, disabled export,
   and absence of the previous load-failed status.
5. Run focused unit and governance gates, write evidence, commit, fast-forward merge to master, push, and clean up.

## Risk Controls

- No source/test changes in this task.
- No Provider, DB write/read, schema, seed, dependency, staging/prod, release, PR, force-push, or Cost Calibration work.
- Evidence records only redacted labels, statuses, counts, command names, and commit SHAs.
