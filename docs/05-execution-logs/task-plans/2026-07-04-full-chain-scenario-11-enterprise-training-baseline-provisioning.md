# 2026-07-04 Full-Chain Scenario 11 Enterprise Training Baseline Provisioning Plan

Task id: `full-chain-scenario-11-enterprise-training-baseline-provisioning-2026-07-04`

## Objective

Provision only the missing S11 prerequisite: an assigned, published, advanced organization `marketing:3` enterprise
training baseline for the already imported advanced employee group. This is a separate provisioning task, not an S11
runtime rerun.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-06-29-full-acceptance-org-advanced-admin-training-workflow.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-org-package-rerun-after-login-input-state-binding-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-org-package-rerun-after-login-input-state-binding-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-pre-provider-learning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-pre-provider-learning.md`
- `src/app/(admin)/organization/organization-training/page.tsx`
- `src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx`
- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/validators/organization-training.ts`
- `tests/unit/organization-training-admin-entry-surface.test.ts`
- `e2e/organization-training-local-full-flow.spec.ts`

## Requirement Mapping Result

- S11 stopped correctly before browser/runtime because the assigned published enterprise training baseline count was `0`.
- The provisioning target maps to advanced organization training requirements: `org_advanced_admin` creates `企业训练`
  inside valid advanced `org_auth`; `org_advanced_employee` later discovers assigned training.
- Standard organization admins and employees remain denied or unavailable for `企业训练`.
- Training stays separate from formal `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book` flows.

## Boundaries

Allowed now:

- Update state, queue, this plan, evidence, and audit.
- Run redacted preflight checks for selector, account, authorization, content baseline, training baseline, DB target, and
  forbidden repeat items.
- Later in this same provisioning task, only after the preflight passes, start local app/browser and use product
  organization training surfaces or API routes to create the baseline.

Blocked:

- S11 runtime rerun.
- Repeating employee import.
- Repeating S10 standard employee learning data.
- Retargeting old content to another scope.
- Fake content or fixture expansion for convenience.
- Product source/test edits, dependency changes, schema/migration/seed changes, destructive DB operations.
- Provider, staging, prod, Cost Calibration, release readiness, final Pass, production usability.

## Minimal Pre-Browser Checklist

Before any browser action or product DB write:

| Item                   | Required result                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------- |
| selector               | S11 advanced employee and organization-admin selectors present by label only                 |
| account                | org advanced admin login input available in memory only                                      |
| authorization          | active advanced `marketing:3` organization authorization exists                              |
| content baseline       | published `marketing:3` paper/question aggregate exists                                      |
| training baseline      | current assigned published training count is checked                                         |
| DB target              | target label is `tiku_full_chain_acceptance_20260704_001`                                    |
| forbidden repeat items | employee import, S10 learning data, S11 runtime, and old authorization flow are not repeated |

If any item is missing, stop and split a smaller provisioning/repair task. Do not enter runtime.

## Evidence Rules

Allowed evidence: task id, branch, selector label, role label, route/surface label, scope label, file category, aggregate
counts, command labels, pass/block/fail, and redacted summary.

Forbidden evidence: credentials, account private values, phone, email, connection strings, tokens, sessions, cookies,
localStorage, Authorization headers, raw DB rows, internal ids, screenshot, raw DOM, traces, Provider payloads, raw
Prompt, raw AI I/O, full material/question/paper/training content, private fixture contents, employee answers, and
plaintext card values.

## Closeout

Closeout requires scoped formatting, `git diff --check`, blocked path diff, Module Run v2 pre-commit, Module Run v2
pre-push, one reviewable commit, fast-forward merge to `master`, push `origin/master`, and deletion of the short branch.

After closeout, S11 reruns only from the affected node: browser login, advanced employee learning, enterprise training
boundary, and no-submit AI boundary. S1-S10 are not repeated.
