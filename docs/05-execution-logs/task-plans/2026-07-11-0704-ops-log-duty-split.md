# 0704 Ops Log Duty Split Task Plan

## Metadata

- taskId: `0704-ops-log-duty-split-2026-07-11`
- branch: `codex/0704-ops-log-duty-split`
- approvedBy: current user approval for serial ops-admin UI execution, commit, merge, push, and cleanup on 2026-07-11
- scopeCategory: `localhost_ui_source_test_only`

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-1-operations-and-super-admin.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/05-execution-logs/evidence/2026-07-11-0704-ops-ui-foundation-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-11-0704-ops-ui-foundation-audit.md`
- repository-external reference screenshot:
  `D:/tiku-local-private/acceptance/screenshots/2026-07-07-three-role-page-review/ops_admin__04__ops-ai-audit-logs.png`

## Observed Problem

The current operations log page mixes model configuration, prompt metadata, formal adoption review, audit log rows, AI call log rows, and cost summaries in one surface. This makes the log page harder to scan and weakens the operator mental model: audit governance and AI call observability are different duties.

## Implementation Scope

Include:

- Add independent operations routes:
  - `/ops/audit-logs`
  - `/ops/ai-call-logs`
- Update operations navigation and operations overview entries to route to independent log pages.
- Keep `/ops/ai-audit-logs` as a compatibility redirect to the audit log page.
- Add read-only audit log and AI call log views that use the existing redacted DTOs and existing runtime routes.
- Reuse existing admin list primitives for toolbar, table, pagination, loading, empty, and error states.
- Add targeted tests for menu split, route split, runtime fetch separation, redaction text, and compatibility behavior.

Exclude:

- No model provider/configuration mutation UI changes.
- No Prompt template behavior changes.
- No formal content adoption behavior changes.
- No service authorization, role guard, database, schema, migration, seed, package, lockfile, env, secret, staging, prod, deploy, Provider, or Cost Calibration changes.
- No screenshots, raw DOM, raw log payload, internal numeric ids, raw prompts, raw outputs, Provider payload, session, cookie, token, credential, DB URL, or env values in evidence.

## Source Mapping

- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- `src/app/(admin)/ops/ai-audit-logs/page.tsx`
- `src/app/(admin)/ops/audit-logs/page.tsx`
- `src/app/(admin)/ops/ai-call-logs/page.tsx`
- `src/components/AdminDashboardLayout/AdminDashboardLayout.tsx`
- `src/features/admin/admin-role-overview/AdminRoleOverviewPage.tsx`
- `src/components/admin/admin-layout-primitives.ts`
- `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
- `tests/unit/admin-dashboard-layout-navigation.test.ts`
- `tests/unit/admin-role-overview-ui.test.ts`
- `tests/unit/admin-ops-summary-first-ui.test.ts`

## Test Plan

1. Red targeted test before implementation for new split views and navigation labels.
2. Green targeted tests:
   - `tests/unit/admin-ai-audit-log-ops-baseline.test.ts`
   - `tests/unit/admin-dashboard-layout-navigation.test.ts`
   - `tests/unit/admin-role-overview-ui.test.ts`
   - `tests/unit/admin-ops-summary-first-ui.test.ts`
   - related route guard/redaction baseline tests if impacted.
3. `corepack pnpm@10.26.1 run lint`
4. `corepack pnpm@10.26.1 run typecheck`
5. `git diff --check`
6. Module Run v2 pre-commit and pre-push checks.

## Adversarial Review Focus

- `ops_admin` and `super_admin` remain the only operations workspace roles.
- Content admins do not receive operations log entries.
- Organization admins do not receive global audit or AI call logs.
- Audit page does not fetch AI call logs, cost summaries, model providers, model configs, or Prompt templates.
- AI call log page does not fetch audit logs, model providers, model configs, or Prompt templates.
- Redacted detail panels still exclude raw prompts, raw outputs, Provider payloads, credentials, session material, internal ids, full content, and plaintext redeem codes.
- Provider-enabled behavior remains blocked and unexecuted.
