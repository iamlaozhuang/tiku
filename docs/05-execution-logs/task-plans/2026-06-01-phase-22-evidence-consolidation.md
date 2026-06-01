# Phase 22 Evidence Consolidation Plan

## Scope

Consolidate child task evidence, run gates, produce security review, commit, merge, push `master`, and clean the merged branch.

## Steps

1. Summarize child pass/fail/blocked outcomes.
2. Run local CI and required repository gates.
3. Write security review for high-risk verification surfaces.
4. Update project state and queue statuses.
5. Commit the batch.
6. Merge to `master`.
7. Run required post-merge gates on `master`.
8. Push `master` with the user-approved push scope.
9. Delete only the merged short-lived branch.
10. Confirm `master` and `origin/master` alignment, no unmerged `codex/*` branch, and no unknown worktree.

## Stop Conditions

If a gate fails due to a product/runtime defect that requires forbidden code/schema/test/script/dependency changes, record a blocked gate and do not fix it in this batch.
