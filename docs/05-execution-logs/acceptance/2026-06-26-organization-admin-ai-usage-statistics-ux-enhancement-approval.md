# Organization Admin AI Usage Statistics UX Enhancement Approval

Task id: `organization-admin-ai-usage-statistics-ux-enhancement-approval-2026-06-26`

Decision status: `SECOND_LAYER_UX_ENHANCEMENT_SCOPED_IMPLEMENTATION_STILL_BLOCKED`

This package is docs/state-only. It does not design UI screens, implement source code, connect to a database, access raw
employee answers, run browser/e2e validation, export data, or touch staging/prod.

## Boundary Decision

Decision: `ORG_ADMIN_AI_USAGE_STATS_SECOND_LAYER_ENHANCEMENT_NOT_CURRENT_GENERATION_CLOSURE`.

Organization admin AI usage statistics UX is valuable, but it is not required to close the current AI generation product
boundary. The current minimum closure remains:

- generated-result/history ownership;
- organization-owned draft or private learner boundaries;
- redacted status and audit summaries;
- no direct formal publish.

## When It Becomes Necessary

Organization statistics UX becomes a necessary acceptance surface when a future task makes organization-owned
draft/training content employee-visible and needs organization admin oversight of participation or training outcomes.

At that point the minimum required statistics should still be redacted:

- counts by generated-result status;
- organization-owned draft/training usage summaries;
- completion state;
- score/time summaries where already approved by the organization training data boundary;
- quota and Provider-blocked status summaries.

## UX Enhancement Scope

Future design-first package may cover:

- dense organization admin dashboard or analytics tab;
- loading, empty, error, and permission-denied states;
- generated draft usage rollups;
- training participation summaries;
- completion, score, and timing summaries;
- quota usage and Provider-disabled state;
- redacted audit links.

## Privacy And Visibility Boundary

Blocked without fresh approval:

- raw employee subjective answers;
- raw learner AI generated content;
- prompts, raw Provider output, or task payloads;
- individual employee generated-result detail;
- export/download;
- external-service sharing;
- cross-organization visibility.

## Required Future Task Split

Recommended successors remain blocked until fresh approval:

1. Organization analytics UX design-first artifact.
2. Redacted statistics data contract and source TDD.
3. Organization admin local UI implementation and local-only validation.
4. Optional local browser/e2e validation if explicitly approved.

## Package-Wide Blocks

- No source/test/e2e/script/package/lockfile/schema/drizzle/env changes.
- No DB connection, DB write, migration, seed, or cleanup.
- No browser/e2e/dev server.
- No raw employee answer or raw AI content access.
- No export, external service, staging/prod/deploy/payment, PR, force push, release readiness, or final Pass.

## Fresh Approval Required

Any future UX design, source implementation, data contract, DB/schema work, browser/e2e, export, or runtime validation
requires fresh task-scoped approval.
