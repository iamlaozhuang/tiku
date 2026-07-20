# F-0119 Organization Portal Authorization Read Model Plan

## Scope

Close F-0119 only. Keep session-derived organization workspace admission unchanged, but stop using its single selected org_auth public ID as the support projection filter. Return and render every org_auth record whose organization coverage includes the session organization, preserving each record's package, source/effective edition, lifecycle status, term, quota, organization coverage count, and profession/level scope.

Use one set-based repository query for all authorization rows and coverage counts; do not introduce N+1 queries. Historical expired/cancelled records remain read-only support context and must not grant capabilities. No authorization write, entitlement expansion, schema/migration, real database execution, dependency, Provider/external call, secret/env, deployment, safety-kernel, PR, force-push, or Subagent work is allowed.

## TDD and validation

1. Add focused RED assertions that the DTO is plural, the repository input no longer accepts a selected authorization ID, the repository has no active-only/single-row fallback, coverage counts are set-based, and the UI renders every current/historical row.
2. Update route/repository and UI fixtures for multiple active, expired, and cancelled authorization records.
3. Implement the smallest contract/service/repository/UI change while preserving the admission context and API envelope.
4. Run focused tests, affected organization workspace regression, lint, typecheck, changed-file format, `git diff --check`, and the P0 safety baseline.
5. Adversarially review session-ID injection, cross-organization leakage, active-only filtering, hidden quota/term differences, historical records granting capabilities, N+1 queries, sensitive IDs, entitlement expansion, schema/dependency changes, real side effects, and extra files.

If the frozen scope stays exact and all checks pass, use `standing-bounded-medium-risk-closeout-approval-2026-07-20` for one commit, ff-only merge, canonical ordinary push, sync verification, cleanup, and then continue RC-03. Stop on any excluded action or required allowlist expansion.

## Verification

- TDD RED: initial 4/4 invariants failed; adversarial follow-up then failed 3/4 until upcoming-state display and duplicate-upgrade aggregation were added.
- Focused GREEN: 14/14 across the F-0119 characterization, runtime route/repository, and portal UI.
- Affected regression: 17/17 across standard/advanced workspace contracts, portal UI, and route/repository behavior.
- Lint, typecheck, changed-file format, and diff check: pass.
- P0 global safety baseline: pass (35 P0 findings, 143 P1/P2 impacts, 21 runtime-pending items, 8 root-cause clusters, 0 dependency cycles).
- Full unit/build/e2e: not triggered; the diff is a narrow read-only internal DTO/repository/UI projection with direct route and rendered UI coverage.
- Main-thread adversarial review: pass. The session organization remains the sole scope input; the session-selected org_auth ID cannot filter the repository; all covering active/upcoming/expired/cancelled rows are returned; duplicate active upgrade joins collapse to one org_auth row; coverage counts are set-based; historical rows do not control workspace capabilities; no internal public ID or sensitive value is exposed. No entitlement expansion, schema/migration, real database execution, dependency, external call, secret/env, Provider, deployment, safety-kernel change, or extra file was found.
