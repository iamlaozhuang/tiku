# Audit Review: advanced-organization-training-publish-version-persistence-schema-migration

## Scope Reviewed

- Current organization training service published-version write boundary.
- Prior readonly inventory and schema-migration seeding evidence.
- Existing Drizzle schema naming, index, foreign-key, and migration patterns.
- ADR-002 layering and ADR-004 migration boundary.

## Findings

- Added an isolated `organization_training_version` Drizzle schema table.
- Added `organization_training_version_status` with `published` and `taken_down`.
- Persisted internal organization lineage through `organization_id`, `org_auth_id`, `authorization_source`, and
  `authorization_public_id`.
- Preserved public-id read model metadata, publish scope snapshot, question type summary, lifecycle status, and takedown
  metadata.
- Generated the migration with a temporary no-env Drizzle config and removed that config before closeout.
- Did not execute DB access, migrate, or `drizzle-kit push`.
- Did not touch route/service/repository/mapper/API/UI/package/lockfile/formal target write surfaces.

## Decision

APPROVE GATED LOCAL SCHEMA MIGRATION WITH NO DB EXECUTION.

## needs_recheck

- Repository/mapper TDD is the next required implementation layer before route/UI work.
- Public DTO non-exposure remains a service/mapper concern and internal lineage stays internal.
- DB migration execution remains blocked unless separately approved.
- Formal learning tables remain untouched.

## Blocked Gate Audit

Preserved pending implementation:

- `.env*`, DB access, row/private data, migration execution, `drizzle-kit push`, destructive database operation,
  provider/model calls, provider payloads, raw prompts, raw answers, quota/cost, Cost Calibration Gate, dev server,
  Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, route/service/repository/mapper/API runtime/UI
  changes, dependency/package/lockfile changes, formal content writes, formal target writes, public identifier value list
  exposure, PR, and force push remain blocked.
