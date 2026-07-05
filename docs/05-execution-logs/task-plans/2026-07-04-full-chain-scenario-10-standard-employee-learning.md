# 2026-07-04 Full-Chain Scenario 10 Standard Employee Learning Plan

Status: closed

## Task

- Task id: `full-chain-scenario-10-standard-employee-learning-2026-07-04`
- Branch: `codex/full-chain-scenario-10-standard-employee-learning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_standard_employee`
- Imported employee batch selector label: `fc_org_standard_employee_batch`
- Scenario selector label: `fc_scenario_10_standard_employee_learning`
- Role label: `org_standard_employee`

## Read Gate

Already read for this task before runtime:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-materials-pack-spec.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-provider-cost-approval.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-4-standard-org-package-rerun-after-org-admin-input-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-2-content-baseline-rerun-after-admin-flow-cookie-session-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-login-input-state-binding-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-login-input-state-binding-repair.md`
- `src/app/(auth)/login/page.tsx`
- `src/app/(student)/home/page.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `src/app/(student)/practice/page.tsx`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/app/(student)/mock-exam/page.tsx`
- `src/server/services/practice-service.ts`
- `src/server/services/mock-exam-service.ts`
- `src/server/services/student-paper-service.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/db/schema/auth.ts`
- `src/db/schema/student-experience.ts`
- `src/db/schema/organization-training.ts`
- `tests/unit/student-login-ui.test.ts`
- `tests/unit/ui-input-contract.test.ts`
- `tests/unit/student-home-ui.test.ts`
- `tests/unit/student-practice-ui.test.ts`
- `C:/Users/jzzhu/.codex/skills/playwright/SKILL.md`

## Execution Plan

1. Confirm the private standard employee selector material is present and use credential values only in process memory.
2. Confirm the local runtime DB target label and pre-run selector-scoped aggregate counts.
3. Start the local app on loopback with the isolated DB target; keep runtime logs outside the repository.
4. Before any product DB write, run a minimal browser login smoke with hydrated/interactable readiness and submit-enabled proof.
5. Continue from the standard employee learning node only; do not repeat employee import.
6. Create minimal standard learning data through product UI. Prefer objective practice or safe mock flow that does not require Provider execution.
7. Verify standard employee boundary: no enterprise training or advanced AI route/surface access.
8. Verify selector-scoped post-run aggregate counts only.
9. Stop runtime, update evidence/audit/state/queue, run scoped closeout gates, commit, fast-forward merge, push, and delete the short branch.

## Stop Rules

Stop and split repair/provisioning if any of these occur: login failure, DB target mismatch, missing private selector input, employee/domain collision, missing standard org authorization, missing content/paper, permission bypass, redaction risk, product source/test repair need, schema/migration/seed need, Provider/staging/prod/Cost boundary, destructive DB operation, employee import repeat requirement, or any release readiness/final Pass/production usability claim.

## Evidence Rules

Allowed: task id, branch, route/surface label, selector label, role label, aggregate counts, command name, pass/fail/block, and redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete material/question/paper/resource/chunk content, private fixture contents, employee answers, and plaintext card values.

## Runtime Result

Blocked before standard learning data creation. The selected standard employee login smoke reached `/home`, but selector-scoped preflight showed the selected standard employee has 3 active standard organization scopes and 0 matching published papers. The browser task stopped before practice/mock product learning writes, did not repeat employee import, and did not invoke Provider, staging/prod, Cost, schema, dependency, or source/test repair.

Next required task: split `full-chain-scenario-10-standard-employee-content-scope-provisioning-2026-07-04` to provision or repair a matching published content scope for the standard employee through governed product/runtime flow, then rerun Scenario 10 from the browser login and learning node.
