# Audit Review: advanced-organization-training-publish-version-persistence-schema-inventory-readonly-audit

## Scope Reviewed

- Current Drizzle schema exports and table definitions under `src/db/schema/**`.
- Existing repository, mapper, and REST route surfaces under `src/server/repositories/**`, `src/server/mappers/**`, and
  `src/app/api/v1/**`.
- Organization training service, contract, model, validator, and scoped tests.
- Prior persistence-boundary planning and seeding evidence.
- Capability catalog, advanced code-stage seeding plan, and organization training implementation plan.
- ADR-002 layering requirements.

## Findings

- No product implementation was performed by this readonly audit.
- Current schema has no isolated `organization_training_*` durable storage table.
- Current schema only recognizes `organization_training_generation` as an AI generation task type; that is task metadata, not
  published organization training version storage.
- Formal `question`, `paper`, `practice`, `mock_exam`, `answer_record`, `exam_report`, and `mistake_book` tables already exist
  and must not be reused as organization training publish-version storage.
- `src/server/repositories/organization-training-repository.ts` does not exist.
- `src/server/mappers/organization-training-mapper.ts` does not exist.
- `src/server/services/organization-training-route.ts` does not exist.
- `src/app/api/v1/organization-trainings` does not exist.
- The service currently exposes an injected `OrganizationTrainingPublishedVersionWrite` store boundary and preserves internal
  `org_auth` lineage there.
- The public `OrganizationTrainingPublishedVersionDto` omits `authorizationSource` and `authorizationPublicId`, and that
  non-exposure boundary should remain unchanged.

## Decision

APPROVE READONLY INVENTORY WITH SCHEMA/MIGRATION REQUIRED BEFORE REPOSITORY/MAPPER IMPLEMENTATION.

The next implementation task should be a fresh-approved schema/migration task for isolated organization training
publish-version persistence. Repository/mapper TDD should not start until the schema is present or a later task proves an
existing isolated storage surface is sufficient.

## needs_recheck

- The next task must define exact schema and migration files, local capability gate, migration plan, and rollback/recovery
  statement.
- The next task must preserve internal authorization lineage persistence while keeping public DTO non-exposure.
- Formal content separation must be rechecked after schema design: no writes into formal `question`, `paper`, `practice`,
  `mock_exam`, `answer_record`, `exam_report`, or `mistake_book`.
- Route adapter work must wait until repository/mapper persistence is verified.

## Blocked Gate Audit

Preserved:

- `.env*`, DB access, row/private data, migration generation/execution, provider/model calls, provider payloads, raw prompts,
  raw answers, quota/cost, Cost Calibration Gate, dev server, Browser/Playwright/e2e,
  staging/prod/cloud/deploy/payment/external-service, schema/drizzle/scripts/package/lockfile/dependencies, product source
  implementation changes, route/repository/mapper/API runtime/UI changes, takedown, copy-to-new-draft, employee answer,
  analytics, formal content writes, formal target writes, public identifier value list exposure, PR, and force push remain
  blocked.
