# F-0141 Explicit Learner Authorization Context Selection Plan

## Objective

Make one exact `authorizationPublicId` the learner's selected context across home, profile, and AI training. A sole candidate may default; multiple candidates require an explicit user selection. Advanced entry visibility, quota owner, history, and generation must all derive from that same context.

## Frozen boundary

- Task: `p1-remediation-rc-03-explicit-learner-authorization-context-selection-2026-07-20`
- Finding: `F-0141`
- Branch: `fix/student-authorization-context-selection`
- Approval: `standing-bounded-medium-risk-closeout-approval-2026-07-20`
- Exact files and commands: `docs/04-agent-system/state/task-safety.json`
- Blocked: entitlement expansion, schema/migration, dependency, persistent database execution, Provider/external service, secret/env, deployment, and safety-kernel changes.

## Root cause and invariant

The home page selects only a merged `profession + level`, the context band takes the first matching row, AI visibility scans all rows, the AI page defaults another row, and profile labels row zero as current. The invariant is one exact, current authorization selection: no consumer may substitute another row merely because it is advanced or has more quota.

## TDD and validation

1. RED: prove a different-scope advanced row exposes AI from a selected standard row; same-scope duplicates choose row zero; multi-context AI and profile silently default.
2. GREEN: select exact contexts on home, carry the public ID through links, honor only exact or sole-candidate selection on profile/AI, and leave multi-context forms unusable until user action.
3. Run focused/regression, lint, typecheck, changed-file format/diff, impact-based build, P0 baselines, and one main-thread adversarial review.
4. Close only if standard contexts stay denied, organization quota is never silently selected, invalid/dead deep links fail closed, and no protected boundary changes.

## Rollback

Before merge, abandon the short branch. After authorized ff-only merge, revert the single task commit; no schema or external state requires rollback.
