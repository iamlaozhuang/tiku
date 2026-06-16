# Task Plan: advanced-organization-training-publish-version-persistence-repository-mapper

## Scope

- Task: `advanced-organization-training-publish-version-persistence-repository-mapper`
- Branch: `codex/advanced-organization-training-publish-version-persistence-repository-mapper`
- Task kind: L2 local implementation, TDD, no DB execution.
- Allowed product files:
  - `src/server/repositories/organization-training-repository.ts`
  - `src/server/repositories/organization-training-repository.test.ts`
  - `src/server/mappers/organization-training-mapper.ts`
  - `src/server/mappers/organization-training-mapper.test.ts`
- State/log files:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - this plan, evidence, and audit review.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-boundary-planning.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-schema-migration.md`
- `src/db/schema/organization-training.ts`
- `src/db/schema/index.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`

## Implementation Plan

1. Record the readiness gate from `master` and claim the task on a short branch.
2. Add RED-first unit tests for the organization training publish-version mapper and repository before implementation.
3. Keep tests gateway-backed and pure. Do not call the Postgres runtime factory, local DB, migration tooling, provider, dev server, Browser, or e2e.
4. Implement a mapper that converts `organization_training_version` rows to `OrganizationTrainingPublishedVersionDto` with camelCase public fields and no numeric ids or internal authorization lineage.
5. Implement a repository boundary that:
   - consumes `OrganizationTrainingPublishedVersionWrite` plus internal `organizationId` and `orgAuthId`;
   - asks its gateway for the latest version number for the draft and assigns the next number;
   - inserts the existing schema shape, including internal lineage storage;
   - returns only the mapped public DTO.
6. Run scoped unit tests, regression unit tests, diff check, lint, typecheck, and Module Run v2 closeout gates.
7. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, fetch prune, and verify clean alignment only if all gates pass.

## Risk Controls

- No `.env*` read/write/output.
- No DB access, row/private data read, migration execution, or `drizzle-kit push`.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, API runtime, contract, model, validator, UI, provider/model, e2e, dev-server, staging/prod/cloud/deploy/payment/external-service, quota/cost, Cost Calibration, PR, or force-push work.
- No formal content write and no formal target write.
- Evidence records only commands, counts, file paths, and redacted conclusions.
