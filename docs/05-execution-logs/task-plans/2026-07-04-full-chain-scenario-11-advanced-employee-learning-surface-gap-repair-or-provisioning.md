# 2026-07-04 Full-Chain Scenario 11 Advanced Employee Learning Surface Gap Repair Or Provisioning Plan

Status: closed

## Task

- Task id: `full-chain-scenario-11-advanced-employee-learning-surface-gap-repair-or-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-11-advanced-employee-learning-surface-gap-repair-or-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Selector label: `fc_org_advanced_employee`
- Scope label: `marketing:3`
- Blocker label: `advanced_employee_practice_surface_error_and_home_practice_link_absent`

## Read Gate

Read before diagnosis:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- S11 provisioning and rerun evidence/audit listed in task state.
- Relevant student home, practice, route, service, repository, validator, and focused test files.

## Diagnostic Plan

1. Keep the task in root-cause classification mode until evidence identifies the failing component.
2. Run only selector-scoped aggregate DB diagnostics against the isolated DB target.
3. Compare the aggregates against the source data flow:
   - `/api/v1/student-papers/scopes`
   - `/api/v1/student-papers`
   - `/api/v1/practices`
   - `StudentHomePage`
   - `StudentPracticePage`
4. Classify the blocker as one of:
   - data provisioning gap;
   - runtime selector/scope selection gap;
   - product source behavior gap;
   - browser harness route-selection gap.
5. Stop and split before any product source edit, test edit, DB write, browser/runtime rerun, Provider, staging/prod, Cost, schema, migration, seed, or dependency change.

## Diagnostic Result

Result: `pass_classified_browser_harness_scope_route_selection_gap_no_product_source_or_data_provisioning`

The aggregate diagnostic confirmed the selector, advanced `marketing:3` org auth, published `marketing:3` formal
content baseline, and assigned published enterprise-training baseline exist in the isolated DB target. The effective
scope list contains `marketing:3`, but `marketing:3` is not the first default scope. The browser rerun must therefore
select or verify the target scope before relying on home practice links, and must enter practice only through the
product-generated link for the selected scope.

No repair or provisioning is required in this task. The follow-up is an affected-node S11 browser rerun with an explicit
`marketing:3` scope-selection gate.

## Stop Rules

Stop on missing DB target, missing selector input, ambiguous product decision, redaction risk, need for product source/test repair, need for DB write/provisioning, schema/migration/seed/dependency need, browser/runtime need, Provider/staging/prod/Cost need, destructive DB operation, employee import repeat, S10 learning repeat, old authorization flow repeat, or release/final/production claim.
