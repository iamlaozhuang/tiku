# 2026-07-05 Full-chain Scenario 12 Advanced Org Admin Analytics Training Preflight Plan

## Scope

- Task id: `full-chain-scenario-12-advanced-org-admin-analytics-training-preflight-2026-07-05`
- Branch: `codex/full-chain-scenario-12-advanced-org-admin-analytics-training-preflight-2026-07-05`
- Status: blocked after read-only aggregate preflight
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scope label: `marketing:3`
- Role label: `org_advanced_admin`

This is a read-only reconciliation and preflight task before S12 browser/runtime. It does not start the app, run browser/e2e, write DB data, repeat employee import, repeat S10 learning, change product source/tests, call Provider, touch staging/prod, run Cost Calibration, change schema/migration/seed/dependency, or make release/final/production claims.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md`
- `src/app/(admin)/organization/organization-analytics/page.tsx`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `src/app/(admin)/organization/organization-training/page.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `src/app/api/v1/organization-ai-generation-requests/route.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

## Minimum Preflight Checklist

Run only selector-scoped aggregate DB reads against `tiku_full_chain_acceptance_20260704_001`:

- DB target matches the approved isolated label.
- Advanced organization admin binding exists for the advanced organization scope.
- Active advanced `marketing:3` `org_auth` exists.
- Imported advanced employee count remains greater than 5.
- Published enterprise training baseline exists.
- Submitted enterprise training answer count and distinct submitted employee count are sufficient for S12 analytics.
- No raw employee answers, raw DB rows, internal ids, private values, screenshots, DOM, traces, Provider payloads, prompts, AI I/O, or full content are recorded.

## Stop Rule

If distinct submitted employee activity is below the S12 analytics prerequisite threshold, close this task as blocked and split a separate provisioning/activity task. Do not enter S12 browser/runtime and do not fill the gap by direct DB writes, fake data, fixture expansion, repeated employee import, or repeated S10 data.

Preflight decision: block. The target DB, advanced `org_auth`, org admin binding, imported employee count, and training baseline are present, but distinct submitted employee activity is below the S12 analytics prerequisite threshold.

## Closeout Gates

- Scoped Prettier write/check for state, queue, plan, evidence, and audit.
- `git diff --check`
- Blocked path diff for source/test/schema/migration/seed/dependency/runtime artifacts.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.
