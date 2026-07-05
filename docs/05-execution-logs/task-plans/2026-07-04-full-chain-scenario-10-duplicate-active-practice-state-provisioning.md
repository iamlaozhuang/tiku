# 2026-07-04 Full-Chain Scenario 10 Duplicate Active Practice State Provisioning Plan

Task id: `full-chain-scenario-10-duplicate-active-practice-state-provisioning-2026-07-04`

Status: pass

## Read Gate

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
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-practice-start-idempotency-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-practice-start-idempotency-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-10-practice-start-idempotency-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-10-practice-start-idempotency-repair.md`
- `src/db/schema/student-experience.ts`

## Scope

- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Scope label: `marketing:3`
- Selector label: `fc_org_standard_employee`
- Allowed action: selector-scoped local DB non-delete status provisioning.
- Required outcome: duplicate active `practice` groups for the selected `marketing:3` scope become zero before Scenario 10 rerun.

## Execution Plan

1. Materialize task plan/evidence/audit and align `project-state.yaml` plus `task-queue.yaml`.
2. Run aggregate-only DB preflight against the isolated local target.
3. If the same duplicate active practice condition remains, mark only lower-ranked duplicate active `practice` rows in the selected scope as `expired`.
4. Re-run aggregate-only verification to confirm duplicate active groups are zero and answer records remain present by aggregate count.
5. Close out with scoped formatting, `git diff --check`, blocked path diff, Module Run v2 pre-commit, Module Run v2 pre-push, commit, fast-forward merge, push, and branch cleanup.
6. Continue Scenario 10 from browser login and standard employee learning node; do not repeat employee import.

## Provisioning Decision

The status transition uses existing `practice_status = expired` from `src/db/schema/student-experience.ts`.
It preserves all rows and answer records, keeps one active practice per selected user-paper group by aggregate-only
ranking, and avoids product source/test/schema/migration/seed/dependency changes.

## Stop Rules

Stop and split a new task if this requires destructive DB operations, schema/migration/seed/dependency changes, product source/test changes, browser/runtime, Provider, staging/prod, Cost Calibration, employee import repeat, raw row inspection, private value exposure, or a product decision about which completed learning attempt should be preserved.

## Evidence Rules

Evidence may record only task id, branch, selector/scope labels, aggregate counts, command names, pass/fail/block status, and redacted summaries. It must not record credentials, connection strings, tokens, sessions, cookies, headers, raw rows, internal ids, phone/email/password, screenshots/raw DOM/traces, Provider payload, prompts, AI I/O, full content, private fixture values, employee answers, or plaintext card values.
