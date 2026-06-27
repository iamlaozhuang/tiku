# Formal Publish Student-Visible Content Execution Approval

Task id: `formal-publish-student-visible-content-execution-approval-2026-06-26`

Decision status: `FRESH_APPROVAL_TEMPLATE_PREPARED_EXECUTION_STILL_BLOCKED`

This package is docs/state-only. It does not execute publish, connect to a database, mutate content, create
student-visible content, run browser/e2e validation, call a Provider, or claim release readiness.

## Boundary Decision

Decision: `PUBLISH_REMAINS_SEPARATE_FRESH_APPROVAL`.

Formal publish and student-visible content are not part of the current AI generation boundary batch. They remain blocked
even when a content-admin formal draft adoption path exists.

## Required Fresh Approval Fields

A later publish execution task must receive a fresh owner approval that names:

- local environment only;
- exact draft `paper` target or a permitted read-only preflight to select one target;
- maximum publish calls, default `1`;
- whether publish execution may mutate local DB state;
- rollback, archive, or takedown strategy;
- whether student-visible local runtime verification is allowed;
- whether browser/e2e/dev server is allowed;
- redacted evidence fields;
- explicit blocks for Provider/Cost, staging/prod, payment, external service, release readiness, and final Pass.

## Default Publish Execution Profile For Future Approval

Recommended default:

- one local draft `paper`;
- one publish call maximum;
- no Provider call;
- no staging/prod;
- no payment or external service;
- no release readiness;
- student-visible verification disabled unless the approval explicitly enables local-only student-visible validation.

## Package-Wide Blocks

- No source/test/e2e/script/package/lockfile/schema/drizzle/env changes.
- No DB connection, DB write, migration, seed, cleanup, publish route, or publish service execution.
- No formal publish or student-visible content creation.
- No browser/e2e/dev server.
- No Provider call, Provider credential read, Provider configuration, or Cost Calibration.
- No staging/prod/deploy/payment/external-service, PR, force push, release readiness, or final Pass.

## Fresh Approval Required

The next execution step is not approved by this package. A later task must explicitly approve publish execution and
student-visible validation separately, or leave student-visible validation blocked.
