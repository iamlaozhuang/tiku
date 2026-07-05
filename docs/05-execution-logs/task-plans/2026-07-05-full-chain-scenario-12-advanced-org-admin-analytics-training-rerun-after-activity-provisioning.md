# 2026-07-05 Full-chain Scenario 12 Advanced Org Admin Analytics Training Rerun After Activity Provisioning Plan

## Scope

- Task id: `full-chain-scenario-12-advanced-org-admin-analytics-training-rerun-after-activity-provisioning-2026-07-05`
- Branch: `codex/full-chain-scenario-12-advanced-org-admin-analytics-training-rerun-after-activity-provisioning-2026-07-05`
- Status: closeout gates passed
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scope label: `marketing:3`
- Role labels: `org_advanced_admin`, `org_standard_admin`

This task reruns S12 only from the affected advanced organization admin browser node after the employee activity prerequisite was provisioned. It validates organization analytics, enterprise training admin surface, standard-admin reverse boundary, and organization AI no-submit boundary. It does not repeat employee import, S10 learning, S11 employee training submissions, old authorization flow, direct DB writes, product source/test edits, schema/migration/seed/dependency changes, Provider execution, staging/prod, Cost Calibration, release readiness, final Pass, production usability, or full-chain completion claims.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-03-employee-answer-statistics.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-06-retention-log-governance.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-organization-analytics-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-organization-ai-post-actions-ui-ux-contract.md`
- `docs/05-execution-logs/task-plans/2026-07-05-full-chain-scenario-12-advanced-org-admin-analytics-training-preflight.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-12-advanced-org-admin-analytics-training-preflight.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-12-advanced-org-admin-analytics-training-preflight.md`
- `docs/05-execution-logs/task-plans/2026-07-05-full-chain-scenario-12-advanced-employee-activity-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-12-advanced-employee-activity-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-12-advanced-employee-activity-provisioning.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `C:\Users\jzzhu\.codex\skills\playwright\SKILL.md`

## Execution Plan

1. Run selector-scoped DB/private-input preflight before browser: DB target, advanced org admin selector, standard org admin selector, active advanced org auth, admin binding, submitted employee activity threshold, published training baseline, and no repeated import/S10/S11 writes.
2. Start local app runtime only against the approved isolated DB target. Run hydrated/interactable login readiness smoke before private input fill.
3. Log in as `org_advanced_admin` through browser and verify organization analytics loads aggregate-only summary and employee statistics with submitted employee count at or above threshold.
4. Verify enterprise training admin surface is reachable for `org_advanced_admin` without creating new drafts, publishing new training, exposing raw employee answers, or writing DB data.
5. Verify organization AI surfaces are reachable only as no-submit/no-Provider boundary checks; do not submit AI requests.
6. Log in as `org_standard_admin` and verify advanced organization analytics/training surfaces are unavailable or denied, without any product mutation.
7. Run selector-scoped aggregate DB post-runtime verification for analytics counts and no forbidden writes, stop runtime, run closeout gates, commit, fast-forward merge to `master`, push, delete branch, then continue the next affected node.

## Stop Rules

Stop and split repair/provisioning if any of these occurs:

- DB target mismatch.
- Private account selector missing, ambiguous, or redaction risk appears.
- Advanced org admin binding, advanced org auth, published training baseline, or submitted employee threshold is missing.
- Browser login readiness smoke fails before private input fill.
- Advanced org admin cannot load organization analytics after the S12 activity prerequisite is met.
- Organization analytics exposes raw employee answers, internal ids, raw rows, tokens, sessions, DOM, screenshots, traces, Provider payloads, prompts, raw AI I/O, or full content.
- Standard org admin reaches advanced-only analytics, enterprise training, or organization AI capability.
- Enterprise training admin validation requires a new draft/publish write, direct API bypass, direct DB write, fake data, fixture expansion, employee import repeat, or S10/S11 repeat.
- Organization AI validation requires Provider execution or AI submit.
- Product source/test/schema/migration/seed/dependency repair is required.
- Provider, staging/prod, Cost Calibration, destructive DB action, release readiness, final Pass, production usability, or full-chain completion claim becomes necessary.

## Evidence Requirements

Allowed evidence: task id, branch, route/surface labels, selector labels, role labels, scope labels, aggregate counts, command names, pass/fail/block, and redacted summaries.

Forbidden evidence: credentials, account private values, phone, email, connection strings, tokens, sessions, cookies, localStorage, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw Prompt, raw AI I/O, full material/question/paper/training content, private fixture contents, raw employee answers, and plaintext card values.

## Closeout Gates

- Scoped Prettier write/check for state, queue, plan, evidence, and audit.
- Focused unit validation for organization analytics and organization training admin surfaces if no product source changed.
- `git diff --check`.
- Blocked path diff for product source/test/schema/migration/seed/dependency/runtime artifacts.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.
