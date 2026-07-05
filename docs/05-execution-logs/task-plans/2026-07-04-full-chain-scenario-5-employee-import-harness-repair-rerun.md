# 2026-07-04 Full-chain Scenario 5 Employee Import Harness Repair Rerun Plan

## Task

- Task id: `full-chain-scenario-5-employee-import-harness-repair-rerun-2026-07-04`
- Branch: `codex/full-chain-scenario-5-employee-import-harness-repair-rerun-2026-07-04`
- Goal: close the Scenario 5 employee import harness repair after the focused test-contract repair, proving that the
  product-supported employee import shape is CSV `content` plus `sourceFormat`.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-advanced-org-package.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-advanced-org-package.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-employee-import-harness-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-employee-import-harness-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-5-employee-import-test-contract-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-5-employee-import-test-contract-repair.md`
- `src/server/services/admin-organization-org-auth-runtime.ts`
- `tests/unit/phase-20-ra-01-04-employee-import.test.ts`
- `src/server/validators/employee-account.ts`
- `src/server/validators/employee-account.test.ts`
- `src/server/services/employee-account-route.test.ts`

## Scope

- Allowed files: this plan, matching evidence/audit files, `project-state.yaml`, and `task-queue.yaml`.
- No product source or test edit.
- No dev server, browser/e2e, private credential use, DB connection/read/write/mutation, schema/migration/seed, Provider,
  staging/prod, Cost Calibration, release readiness, final Pass, or production usability claim.

## Validation

1. Run focused employee import and validator unit tests.
2. Run adjacent employee account runtime/import test pair.
3. Run scoped Prettier write/check for docs/state files.
4. Run `git diff --check`.
5. Confirm blocked path diff is empty.
6. Run Module Run v2 pre-commit and pre-push readiness.

## Stop Rules

Stop and split a new repair/provisioning task on any focused unit failure, source/test diff requirement, product contract
conflict, DB/browser/Provider need, redaction risk, permission weakening, fixture expansion, dependency change,
schema/migration/seed need, staging/prod/Cost need, destructive DB action, or release/final/production claim pressure.
