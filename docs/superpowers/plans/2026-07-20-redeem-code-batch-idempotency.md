# Redeem Code Batch Idempotency Plan

> Main-thread execution only. No subagent or independent reviewer is authorized.

## Goal

Close `F-0017` without a schema or migration. A generation intent carries one client request public ID. The repository
derives an actor-scoped stable generation group, serializes matching attempts, returns the already-created matching batch
on retry, rejects payload reuse, and commits the batch plus redacted create/view audits in one transaction.

## Authority And Boundary

- SSOT: advanced operations authorization module, user-auth card generation requirements, finding ledger `F-0017`, and
  ADR-007.
- Existing generation entitlement remains exactly `ops_admin | super_admin`; no role, card type, scope, quantity, quota,
  or plaintext entitlement changes.
- `generation_group_id` already stores a simple batch identity. An actor-scoped deterministic value plus a transaction
  advisory lock provides persistent retry identity without adding a column or migration.
- No schema/migration, real database execution, dependency, Provider/external call, export, secret/env, deployment, PR,
  force-push, or safety-kernel change.
- Bounded approval: `standing-bounded-medium-risk-closeout-approval-2026-07-20`.

## Root Cause And Adversarial Cases

The repository commits card rows first; the service then writes audits separately. A failed audit leaves live cards that
the caller never received. A retry has no stable request identity and creates another batch.

Attack cases:

- either required audit write fails after rows were prepared;
- two concurrent calls reuse the same actor/request identity;
- the same identity is replayed with changed quantity, type, scope, duration, or deadline;
- another actor supplies the same client request public ID;
- an adapter lacks the atomic command or returns a mismatched persisted batch;
- response interruption is followed by an exact retry;
- retry evidence, audit metadata, errors, or logs contain plaintext or hashes.

## TDD And Implementation

1. RED repository transaction rollback, exact replay, payload-mismatch conflict, actor isolation, and serialized retry.
2. RED route validation and UI reuse of one request public ID across a failed confirmation retry.
3. Move batch create and both redacted audits into one repository transaction. Derive the group from actor/request,
   acquire a transaction advisory lock, rehydrate an exact existing batch, and fail closed on mismatch.
4. Keep the confirmation dialog and request identity on recoverable failure; clear them only after success or explicit
   cancel. Never place card plaintext or hashes in idempotency/audit metadata.

## Verification And Metrics

- Focused and affected regression commands are frozen in `task-safety.json`; then run lint, typecheck, build, exact-file
  Prettier check, `git diff --check`, P0 global, and P0 serial, all serially.
- Main-thread adversarial review proves transaction rollback ownership, exact retry reuse, concurrent serialization,
  mismatch rejection, actor isolation, audit redaction, unchanged entitlement, no schema/migration, no real database, and
  exact file scope.
- approvalRequests: `1` for the directly affected phase-21 concurrency regression; approvalIdMismatch: `0`;
  postApprovalCandidateTreeChanges: `0`; repeatedBlockerReports: `2`; validationRetryCount: `3`; fullRuns: at most `1`.
