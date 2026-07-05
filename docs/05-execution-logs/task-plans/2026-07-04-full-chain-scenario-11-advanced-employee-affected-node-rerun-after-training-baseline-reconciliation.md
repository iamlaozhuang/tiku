# 2026-07-04 Full-Chain Scenario 11 Advanced Employee Affected-Node Rerun After Training Baseline Reconciliation Plan

Status: blocked

## Task

- Task id: `full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-reconciliation-2026-07-04`
- Branch: `codex/full-chain-scenario-11-advanced-employee-affected-node-rerun-after-training-baseline-reconciliation-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Employee selector label: `fc_org_advanced_employee`
- Content scope label: `marketing:3`
- Restart node: `s11_browser_login_advanced_employee_learning_and_enterprise_training_boundary`

## Read Gate

Read before runtime:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-training-baseline-gap-provisioning.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-training-baseline-gap-provisioning.md`
- Relevant login, student home, practice, organization training, AI training source and tests.

## Minimum Pre-Browser Checklist

Before local app/browser runtime, verify selector, account, advanced organization authorization, content baseline, assigned
published training baseline, DB target, and forbidden repeat items. If any item is missing, stop and split; do not enter
runtime.

## Execution Plan

1. Run redacted minimum pre-browser checklist.
2. Start local app on loopback with process-scoped DB target override only after preflight passes.
3. Run browser login readiness smoke and wait for hydrated/interactable login controls.
4. Log in as advanced employee using private values only in process memory.
5. Exercise advanced employee learning and enterprise training boundary through product UI.
6. Observe AI-training surface only; do not click AI generation submit actions.
7. Run selector-scoped aggregate verification.
8. Stop runtime, update evidence/audit/state/queue, run closeout gates, commit, fast-forward merge, push, delete branch.

## Stop Rules

Stop on login failure, DB target mismatch, missing private selector input, missing advanced org authorization, missing
content baseline, missing assigned published enterprise training baseline, permission bypass, redaction risk, source/test
repair need, schema/migration/seed/dependency need, Provider/staging/prod/Cost need, destructive DB action, employee
import repeat requirement, S10 learning repeat requirement, old authorization flow requirement, or release/final/production
claim.

## Runtime Closeout Decision

The task stopped before enterprise training submit because the advanced employee practice learning surface returned an
error state and the student home did not expose a practice resume/link for the assigned published content baseline. Login,
organization-training visibility, AI-training no-submit visibility, DB target, advanced employee selector, authorization,
content baseline, and assigned published training baseline were not the blocker.

Next split task:
`full-chain-scenario-11-advanced-employee-learning-surface-gap-repair-or-provisioning-2026-07-04`.

The split task must first classify whether the gap is data provisioning or product source behavior. It must not repeat
employee import, S10 learning data, S1-S10 runtime, old authorization flow, Provider/staging/prod/Cost, schema/migration,
seed, dependency changes, or destructive DB operations.
