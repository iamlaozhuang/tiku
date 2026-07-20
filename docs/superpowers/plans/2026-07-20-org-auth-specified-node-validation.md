# F-0112 org_auth Specified Node Validation Plan

## RC-03 residual disposition

- `F-0088`: `separate`; resource multi-level representation is a schema/migration task and requires fresh approval when scheduled.
- `F-0112`: `separate`; org_auth creation loses missing specified-node inputs and accepts disabled purchaser/targets. This is the current task.
- `F-0119`: `separate`; organization portal support projection compresses multiple current/historical org_auth records into one row.
- `F-0140`: `separate`; two upgrade codes race on one personal_auth target because the target invariant is not locked.
- `F-0141`: `separate`; learner UI lacks one explicit authorizationPublicId selection propagated across home/profile/AI navigation.
- `F-0142`: `separate`; AI history/result/learning consumers apply ownership but not the current effective authorization lifecycle policy.

None share one authority path, business invariant, minimal fix, validation matrix, and reviewable diff. No finding is statically covered by F-0009, F-0004, F-0015, or current master; none requires `runtime_hold` to establish the static root cause.

## Scope

Close F-0112 only. Inside the existing org_auth creation transaction:

1. lock and require an active purchaser organization;
2. normalize the specified-node input to a distinct public-id set;
3. resolve and row-lock every requested organization;
4. require exact set equality and active status before quota, overlap, org_auth, scope, employee binding, or audit mutation;
5. preserve descendant-scope and existing overlap/quota semantics.

No entitlement expansion, schema/migration, real database execution, dependency, Provider/external call, secret/env, deployment, safety-kernel, PR, force-push, or Subagent work is allowed.

## TDD and validation

1. Add focused RED characterization for active purchaser locking, distinct exact-set resolution, missing/disabled fail-closed, row locking, and validation-before-mutation ordering.
2. Implement the smallest repository-only change; reuse the existing creation transaction and scope mutation lock.
3. Run focused tests, affected org_auth regression, lint, typecheck, changed-file format, build only if impact requires it, and `git diff --check`.
4. Adversarially review duplicate IDs, missing IDs, disabled purchaser/target, concurrent status changes, partial success, mutation ordering, entitlement expansion, schema/dependency changes, real DB/external side effects, and extra files.

If the frozen scope stays exact and all checks pass, use `standing-bounded-medium-risk-closeout-approval-2026-07-20` for one commit, ff-only merge, canonical ordinary push, sync verification, cleanup, and then continue the queue. Stop on any excluded action or required allowlist expansion.

## Verification

- TDD RED: 4/4 focused cases failed for the four missing invariants.
- Focused GREEN: 9/9 across F-0112, org_auth quota atomicity, and overlap concurrency.
- Affected regression: 44/44 across the admin org_auth route, operations loop, and baseline.
- Lint, typecheck, changed-file format, and diff check: pass.
- P0 global safety baseline: pass (35 P0 findings, 143 P1/P2 impacts, 21 runtime-pending items, 8 root-cause clusters, 0 dependency cycles).
- Full unit profile: the candidate's only attempt used one worker and reached the 600-second execution ceiling without a test-failure result; it was not repeated. The focused and affected matrices remained green.
- Main-thread adversarial review: pass. Missing and disabled targets fail before overlap/quota/auth/scope/employee writes; duplicate inputs are compared as a distinct set; purchaser and targets are row-locked in the existing transaction; descendant scope behavior is unchanged. No entitlement expansion, schema/migration, real database execution, dependency, external call, secret/env, Provider, deployment, safety-kernel change, or extra file was found.
