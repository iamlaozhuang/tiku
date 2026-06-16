# Task Plan: advanced-organization-training-publish-version-service-runtime-wiring

## Scope

- Task: `advanced-organization-training-publish-version-service-runtime-wiring`
- Branch: `codex/advanced-organization-training-publish-version-service-runtime-wiring`
- Task kind: L2 local implementation, TDD, no DB execution.
- Purpose: wire organization training publish-version service runtime to the existing repository/mapper persistence boundary by carrying internal organization and `org_auth` lineage into the store write while keeping public DTOs redacted.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service-runtime-wiring-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-persistence-repository-mapper.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/server/mappers/organization-training-mapper.ts`
- `src/server/mappers/organization-training-mapper.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`

## Implementation Plan

1. Write RED-first service unit tests proving publish-version commands carry internal `organizationId` and `orgAuthId` lineage to the injected store/repository boundary while the returned DTO omits internal ids.
2. Preserve existing blocked behavior by keeping invalid/capability/scope publish paths from calling the store.
3. Add minimal service runtime types and validation for internal persistence lineage.
4. Pass internal lineage into the existing publish-version store write.
5. Align the repository input type with the service runtime persistence write type without changing schema, mapper, route, UI, or DB behavior.
6. Run the queued scoped unit tests, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.

## Risk Controls

- No `.env*` read/write/output.
- No DB access, migration generation, migration execution, `drizzle-kit push`, schema/drizzle edit, or row/private data read.
- No route/API/UI/provider/model/e2e/dev-server/staging/prod/cloud/deploy/payment/external-service work.
- No package, lockfile, script, dependency, contract/model/validator/mapper changes outside the queued allowed files.
- No formal content write and no formal target write.
- Evidence records command results and redacted conclusions only.
