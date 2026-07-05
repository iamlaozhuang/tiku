# 2026-07-04 Full-Chain Scenario 7 Redeem Code Empty State Generation Panel Repair

Status: active

## Task

- Task id: `full-chain-scenario-7-redeem-code-empty-state-generation-panel-repair-2026-07-04`
- Branch: `codex/full-chain-scenario-7-redeem-code-empty-state-generation-panel-repair-2026-07-04`
- Source blocker: `full-chain-scenario-7-redeem-code-contact-config-2026-07-04`
- Target: keep the governed `redeem_code` generation controls reachable on `/ops/redeem-codes` when the list is empty.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ops-authorization-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/05-execution-logs/task-plans/2026-07-04-full-chain-scenario-7-redeem-code-contact-config.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-7-redeem-code-contact-config.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-7-redeem-code-contact-config.md`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
- `tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`

## Boundaries

- Allowed repo files: state, queue, this plan, evidence, audit, `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`, and targeted redeem-code UI tests.
- Product source change: UI reachability only; no authorization weakening, no API/runtime permission change, no schema/migration/seed, no Provider, no staging/prod, no Cost Calibration.
- Runtime/browser/DB: blocked in this repair task; S7 browser rerun must be a separate affected-node task after this repair is merged.
- Evidence: task id, branch, file paths, command names, pass/fail/block, and redacted summary only.

## Implementation Plan

1. Add a focused regression test proving the empty redeem-code list still renders the system ops entry and `redeem-code-generate-button`.
2. Adjust `AdminRedeemCodePage` so `loading`, `unauthorized`, and `error` still short-circuit, but `empty` renders the normal card management shell with an empty-list status inside the content area.
3. Run the `AdminRedeemCodePage` filtered UI regression, adjacent redeem-code runtime/baseline tests, lint/typecheck, scoped formatting, diff gates, and Module Run v2 gates.

## Stop Rules

Stop and split a new task if the repair requires permission changes, API contract changes, direct DB writes, schema/migration/seed, dependency/lockfile changes, Provider/staging/prod/Cost work, private value handling, or release readiness/final Pass/production usability claims.
