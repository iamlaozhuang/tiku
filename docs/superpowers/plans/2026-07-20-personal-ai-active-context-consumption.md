# F-0142 Personal AI Active Context Consumption Plan

## Objective

Require the exact selected authorization to remain an effective advanced AI-capable context before request history, result history/detail, or learning-session data can be consumed. Fail closed before disclosure or learning writes.

## Frozen boundary

- Task: `p1-remediation-rc-03-personal-ai-active-context-consumption-2026-07-20`
- Finding: `F-0142`
- Branch: `fix/personal-ai-history-effective-authorization`
- Approval: `standing-bounded-medium-risk-closeout-approval-2026-07-20`
- Exact files and commands: `docs/04-agent-system/state/task-safety.json`; the frozen product boundary includes the learner AI caller and its existing route-contract tests so the selected authorization is carried through learning-session requests.
- The user additionally approved the two Phase 11 system-ops tests in the frozen allowlist; they may only receive assertion/mock adjustments required by this product boundary.
- Blocked: schema/migration, dependency/lockfile, real database execution, external services, secrets/env, deployment, Provider, safety-kernel changes, entitlement expansion.

## Root cause and invariant

The read/learning routes currently prove only raw row ownership. Raw ownership survives expiry/cancellation and is therefore insufficient for consuming advanced AI data. Every consumer must resolve exactly one current effective context matching the selected authorization and required task capability. Missing, ambiguous, standard, expired, blocked, foreign, or capability-incompatible contexts fail before repository disclosure or learning mutation.

## TDD and validation

1. RED: prove request history, result history/detail, and learning creation/progress/answer accept raw-owned but ineffective contexts.
2. GREEN: reuse the existing effective authorization resolver; wire the effective service into production route entries; derive learning authorization from the persisted result/session rather than client ownership claims.
3. Focused and affected commands are frozen in `task-safety.json`; then lint, typecheck, format/diff, P0 baseline, and one main-thread adversarial review.
4. Candidate closeout only if the diff is exact, entitlement is not expanded, no schema/external action occurs, and all disclosure/write paths fail closed.

## Rollback

Before merge, abandon the short branch. After an authorized ff-only merge, revert the single task commit; no schema or external state requires rollback.

## Verification evidence

- RED: 4 expected failures demonstrated raw-owned ineffective contexts could still reach consumption paths.
- GREEN: focused 99/99; affected regression 99/99; lint, typecheck, production build, changed-file format/diff, P0 global baseline, and P0 serial baseline passed.
- Adversarial review: corrected a false-positive test so progress/answer denial is proven only after a learning session was successfully created and its selected authorization later became ineffective.
- Boundary: no entitlement expansion, schema/migration, dependency, persistent database execution, real external call, Provider, secret/env, deployment, or safety-kernel change.
