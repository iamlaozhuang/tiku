# 2026-07-05 Full-chain Scenario 12 Advanced Employee Activity Provisioning Plan

## Scope

- Task id: `full-chain-scenario-12-advanced-employee-activity-provisioning-2026-07-05`
- Branch: `codex/full-chain-scenario-12-advanced-employee-activity-provisioning-2026-07-05`
- Status: closed
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scope label: `marketing:3`
- Role label: `org_advanced_employee`

This task provisions only the missing S12 analytics prerequisite by using existing imported advanced employee accounts to submit enterprise training through the local product browser/runtime. It does not repeat employee import, S10 learning data, old authorization flow, S1-S10 runtime, direct DB fixture insertion, product source/test edits, schema/migration/seed/dependency changes, Provider, staging/prod, Cost Calibration, or release/final/production claims.

## Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
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
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-12-prepush-status-alignment.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-12-prepush-status-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/api/v1/sessions/route.ts`
- `src/features/student/organization-training/StudentOrganizationTrainingPage.tsx`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `tests/unit/organization-training-employee-entry-surface.test.ts`
- `src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx`
- `src/server/services/organization-analytics-route.ts`
- `src/server/services/organization-analytics-service.ts`
- `src/server/repositories/organization-analytics-repository.ts`
- `tests/unit/organization-analytics-admin-entry-surface.test.ts`
- `C:\Users\jzzhu\.codex\skills\playwright\SKILL.md`

## Execution Plan

1. Run selector-scoped aggregate DB preflight against the approved isolated DB target. Confirm the target DB, imported advanced employee count, published training baseline, current submitted employee count, and gap to threshold.
2. Load only the private advanced employee selector input needed for login in memory. Do not write private values to repo, logs, evidence, or conversation.
3. Start or reuse only a local app runtime whose DB target is the approved isolated DB. Before any product write, run a minimal hydrated/interactable browser login readiness smoke.
4. Use browser product UI to log in as additional existing advanced employees and submit the already-published enterprise training until the distinct submitted employee count reaches at least 5.
5. Run selector-scoped aggregate DB post-runtime verification. Record only counts and pass/block status.
6. Stop runtime, run closeout gates, update final evidence/audit/state/queue, commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, then continue S12 affected-node rerun.

## Stop Rules

Stop and split a new repair/provisioning task if any of these occurs:

- DB target mismatch.
- Private advanced employee selector input missing or ambiguous.
- Fewer than four additional unsubmitted existing advanced employees are available.
- Browser login readiness smoke fails before private input fill.
- Login succeeds but enterprise training is not visible or answerable.
- Product UI submission cannot be completed without direct API bypass, direct DB write, fake data, fixture expansion, or repeating import/S10 data.
- Any standard employee/admin gains enterprise training or advanced-only capability outside its boundary.
- Evidence redaction risk appears.
- Product source/test/schema/migration/seed/dependency repair is required.
- Provider, staging/prod, Cost Calibration, destructive DB action, release readiness, final Pass, or production usability claim becomes necessary.

## Evidence Requirements

Allowed evidence: task id, branch, route/surface labels, selector labels, role labels, scope labels, aggregate counts, command names, pass/fail/block, and redacted summaries.

Forbidden evidence: credentials, account private values, phone, email, connection strings, tokens, sessions, cookies, localStorage, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw Prompt, raw AI I/O, full material/question/paper/training content, private fixture contents, raw employee answers, and plaintext card values.

## Runtime Result

- Minimum selector/DB/private-input preflight: pass.
- Browser login readiness smoke: pass.
- Product UI training submissions: pass, four additional existing advanced employees submitted the published enterprise training.
- Selector-scoped aggregate verification: pass, S12 analytics prerequisite reached five distinct submitted employees.
- Runtime cleanup: pass.
- Forbidden scope checks: no direct DB write, employee import repeat, S10 learning repeat, product source/test change, schema/migration/seed/dependency change, Provider, staging/prod, Cost Calibration, or release/final/production claim.

## Closeout Gates

- Scoped Prettier write/check for state, queue, plan, evidence, and audit.
- Focused unit validation for organization training and analytics surfaces if no product source changed.
- `git diff --check`.
- Blocked path diff for product source/test/schema/migration/seed/dependency/runtime artifacts.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness.
