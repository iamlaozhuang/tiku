# 2026-07-05 Full-chain Scenario 11 Paper-source Question Count Boundary Repair Plan

## Task

- Task id: `full-chain-scenario-11-paper-source-question-count-boundary-repair-2026-07-05`
- Branch: `codex/full-chain-scenario-11-paper-source-question-count-boundary-repair-2026-07-05`
- Scope: source/test/docs/state repair so employee enterprise-training DTOs never expose more paper-source question snapshots than the persisted published training question count.
- Boundary: source/test/docs/state only. No browser/runtime, DB write, schema/migration/seed, dependency, Provider, staging/prod, Cost Calibration, release readiness, final Pass, or production usability claim.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-organization-training-ui-ux-contract.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-snapshot-repair.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-05-full-chain-scenario-11-enterprise-training-question-snapshot-source-repair.md`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`

## Implementation Plan

1. Add a failing repository unit test with more paper-source snapshot candidates than the published training question count.
2. Cap mapped paper-source question snapshots by `OrganizationTrainingPublishedVersionDto.questionCount`.
3. Preserve ordering by paper question `sortOrder` and public selector fallback.
4. Re-run scoped repository tests and closeout gates.

## Stop Rules

Stop and split if exact per-question selection cannot be represented without schema/migration/provisioning, if a DB write is required, or if source repair would need Provider/staging/prod/Cost/dependency changes.

## Non-Claims

This task does not close durable training-question snapshot persistence or per-question employee answer storage.
