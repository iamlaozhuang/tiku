# F-0015 Lifecycle Command Atomicity Plan

## Scope

Close F-0015 only. Preserve existing entitlement semantics while moving each successful lifecycle mutation and all of its required side effects into one PostgreSQL transaction:

- user disable: account state, quota release, session revocation, active practice/mock termination, employee training answer blocking, redacted success audit;
- organization disable: selected organization state, active practice/mock termination, affected organization training answer blocking, redacted success audit;
- `org_auth` cancel: authorization state, authorization-lineage practice/mock termination, `organization_training_version.org_auth_id`-lineage answer blocking, redacted success audit.

Failure and permission-denial audits that occur before any product mutation remain outside these transactions. No role, permission, authorization scope, quota, default capability, API response entitlement, schema, migration, dependency, persistent database execution, real external call, Provider, secret/env, deployment, safety-kernel, PR, force-push, or Subagent work is allowed.

## TDD

1. Add focused RED assertions that the three success paths pass an external actor into a repository command, perform all mutation/termination/training/audit writes inside the same transaction, and no longer perform success termination/audit sequencing in route services.
2. Add adversarial cases for audit failure rollback boundary, wrong `org_auth` training lineage, unrelated employee/organization records, missing targets, repeat cancellation, and redacted metadata.
3. Implement the smallest repository-command changes; reuse the existing transaction locks and `organization_training_version.org_auth_id` lineage.
4. Run focused tests first, then affected regression, lint, typecheck, format check, build if the impact requires it, and `git diff --check`.

## Review and closeout

Adversarially verify no entitlement expansion, schema/migration, real database execution, external call, dependency, extra file, or service-level post-commit success side effect. If green and exact-scope, bind `standing-bounded-medium-risk-closeout-approval-2026-07-20`, create one commit, ff-only merge to `master`, ordinary push only to canonical `origin/master`, verify sync/clean, clean the short branch, and continue the queue.

Stop if the implementation requires a schema/migration, persistent database write outside isolated tests, new dependency, real external call, entitlement expansion, safety-kernel change, or allowed-file expansion after freeze.
