# Task Plan: advanced-organization-training-publish-version-route-flow-readonly-recheck

## Goal

Readonly recheck the organization training publish-version route flow from durable `master`.

This task verifies ADR-002 layering, route/service/repository consistency, metadata-only output, public-id route semantics, trusted lineage boundaries, default runtime blocking behavior, and formal target write blocking. It does not implement or change runtime behavior.

## Read First

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-boundary-readonly-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-flow-readonly-recheck-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-flow-readonly-recheck-seeding.md`

## Readonly Source Scope

- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/server/mappers/organization-training-mapper.ts`
- `src/server/mappers/organization-training-mapper.test.ts`
- `src/server/contracts/organization-training-contract.ts`
- `src/server/models/organization-training.ts`
- `src/server/validators/organization-training.ts`
- `src/server/validators/organization-training.test.ts`
- `src/server/contracts/api-response.ts`
- `src/server/services/route-error-response.ts`
- `src/server/services/route-error-response.test.ts`

## Allowed Edits

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-organization-training-publish-version-route-flow-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-route-flow-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-organization-training-publish-version-route-flow-readonly-recheck.md`

## Blocked Work

- No environment file read/write/output.
- No product source, route runtime, service, repository, mapper, contract, model, validator, UI, schema, drizzle, script, package, lockfile, or dependency edits.
- No DB access, direct row/private data read, migration generation, or migration execution.
- No provider/model call, provider configuration, quota/cost measurement, or Cost Calibration Gate work.
- No dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, PR, or force push.
- No formal content write, formal target write, public identifier value list exposure, provider payload, raw prompt, raw answer, secret, token, cookie, Authorization header, database URL, row data, or private data.

## Review Steps

1. Confirm git readiness and current branch isolation.
2. Verify route entrypoint remains a thin POST export.
3. Verify route helper validates JSON input through the existing organization training validator.
4. Verify path/body `draftPublicId` mismatch is blocked before lineage resolution and service invocation.
5. Verify client-provided internal lineage is not accepted as authoritative input.
6. Verify trusted lineage is the only path into service `publishVersion`.
7. Verify default runtime lineage unavailable behavior blocks before persistence.
8. Verify service/repository/mapper flow keeps internal lineage out of returned DTOs.
9. Verify formal target write and direct formal content adoption remain blocked.
10. Run scoped unit tests and Module Run V2 closeout gates.

## Risk Controls

- Evidence records only file paths, field names, command outcomes, and redacted conclusions.
- Concrete public identifier value lists are not recorded.
- Any runtime trusted lineage implementation remains a separate future task.
