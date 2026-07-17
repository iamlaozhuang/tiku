# P1 F-0115 Scope Correction Hotfix Evidence

Date: 2026-07-16

Task: `p1-f0115-scope-correction-hotfix-2026-07-16`

Parent task: `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

Base: `6bde2f2aec3d71fa0ce138b26f64243861cace6f`

Branch: `codex/p1-f0115-scope-correction-hotfix`

- Evidence status: pass

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

Cost Calibration Gate remains blocked

Read and applied `AGENTS.md`, the Code Taste Ten Commandments, ADR-001 through ADR-007, the fixed-base F-0115 task block, the hotfix design and implementation plan, the F-0132 approval/evidence/audit analogue, all updated Task 1-4 reports and reviews, and the P1/Module F-0115 artifact-marker contracts.

## Requirement Mapping Result

Result: pass

- The approval is fixed to task `p1-f0115-scope-correction-hotfix-2026-07-16`, parent task `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`, base `6bde2f2aec3d71fa0ce138b26f64243861cace6f`, branch `codex/p1-f0115-scope-correction-hotfix`, and the ordered exact twelve-file set.
- Its `Capability Authorization` block is byte-for-byte aligned with the P1 and Module constants: migration source generation is the only approved schema capability; dependency, database, Provider, runtime/browser, P2, deploy, force push, PR, and Cost Calibration Gate remain blocked.
- The queue correction consists of the design's exact eight transformations inside only the active F-0115 block: fresh approval, rollback boundary, focused gates, product allowlist, removal of two schema/drizzle blocked patterns, schema capability, acceptance standards, and focused validation command.
- P1 and Module pre-commit independently require exact scope, parent absence, index/worktree identity, exact queue reconstruction, completed evidence, and two-round audit. P1 pre-push alone emits `transition_only`; Module pre-push independently requires the fixed one-parent A/M-only topology.

## Root-Cause Reproduction

Result: pass

- The original frozen F-0115 task correctly blocked persistence: `src/db/schema/**` and `drizzle/**` were blocked, `schemaMigration` required fresh approval, and the stop condition prohibited persistent batch-command/schema work.
- Task 1 P1 RED first completed the existing `8 positive, 48 negative` regression and then failed only because the F-0115 marker/mode contract was absent.
- Task 2 Module pre-commit RED reached the exact staged fixture and failed on the missing independent bridge; Module pre-push RED proved the old broad ancestry predicate accepted a replay second commit.
- Reviewer follow-up REDs proved three additional bypass classes before their fixes: incomplete/tampered capability authorization, success-marker leakage after later findings, and exact path-name sets concealing destructive `D`/`T` statuses.

## TDD Evidence

Result: pass

### P1 inventory

- Final fresh full smoke evidence: `10 positive, 67 negative`, exit `0`.
- Positive coverage: exact pre-commit one-time authorization and exact one-parent pre-push authorization with `p1TransitionScopeMode: transition_only`.
- Negative coverage: wrong base, branch, task, status, approval, missing schema marker, tampered preserved capability, contradictory authorization, duplicate failing/reject audit structure, scalar/list/order queue drift, missing path, staged thirteenth path, product path, partial stage, replay, ordinary steady-task scope drift, and candidate-valid later-finding marker suppression.

### Module pre-commit inventory

- Final fresh canonical full smoke evidence: exit `0`, `Module Run v2 pre-commit hardening smoke passed`, elapsed `183.1s`.
- Positive coverage: exact fixed context, exact twelve A/M paths, index/worktree equality, exact approval/capability block, exact queue reconstruction, and final evidence/audit markers.
- Negative coverage: wrong base, branch, task, status, invalid or contradictory approval, missing schema marker, tampered dependency marker, duplicate failing/reject audit structure, queue scalar/list/order/outside-block drift, missing path, extra product path, index/worktree split, and candidate-valid later-finding marker suppression.

### Module pre-push inventory

- Final full smoke evidence: exit `0`, `Module Run v2 pre-push readiness smoke passed`.
- Positive coverage: `state checkpoint -> origin/master fixed base -> exact one-parent hotfix` with P1 `transition_only` handoff.
- Negative coverage: standard-mode F-0115 rejection, state mismatch, independent origin movement, replay second commit, ordinary non-F-0115 drift, later-finding marker suppression, and exact-name-set commits containing deleted or type-changed expected files.

## Validation Results

Result: pass

### Existing completed validation

- P1 smoke: fresh `10 positive, 67 negative`, exit `0`, elapsed `443.2s`.
- Module pre-commit smoke: fresh canonical full rerun exit `0`, elapsed `183.1s`.
- Module pre-push smoke: fresh full rerun exit `0`, elapsed `57.0s`.
- PowerShell 7 and Windows PowerShell 5.1 parser checks for the changed guards passed in Tasks 3-4.
- Task-scoped guard/smoke `git diff --check` checks passed; no Task 1-4 stage, commit, push, PR, deployment, database, Provider, runtime/browser, schema generation, migration generation/execution, dependency, or audit-repository write occurred.

### Final code review

- Final implementation-rereview snapshot: `a04bae1074b7f335207254a8d933661f7c86bd77` against fixed base `6bde2f2aec3d71fa0ce138b26f64243861cace6f`. It is an implementation-review anchor, not the final staged index; the later delta is limited to this evidence, the audit, and the implementation plan self-recording documents, while the remaining nine blobs match.
- The sole prior Important finding is closed: both independent pre-commit guards now require global uniqueness of the approval heading, approval status, and all eleven canonical capability keys/values; they also reject contradictory evidence/audit result or decision markers and duplicate canonical review structure.
- P1 and Module smoke negatives reproduce contradictory authorization and failing/reject audit artifacts against real exact-twelve staged A/M candidates with no unstaged or untracked paths, require the precise contradiction findings, and forbid all success markers.
- The implementation review reports no Critical, Important, or Minor issue. The three self-recording deltas and full exact-twelve staged index require a separate final read-only review before commit.

### Current Task 5 pre-commit checks

- Scoped Prettier: the first check identified only one trailing blank line in four Markdown files; those four EOFs were corrected with `apply_patch`, and the full scoped rerun passed for the queue plus all five hotfix Markdown artifacts.
- YAML parse: PyYAML `safe_load` passed; the active F-0115 task occurs once, remains `in_progress`, has `54` allowed-file entries and `11` retained blocked-file entries, and records `schemaMigration: approved_source_generation_only_no_execution`.
- Parent-vs-candidate exact LF-normalized queue self-check: all eight anchors occurred once; prefix, suffix, task block, and full queue equality all returned `True`.
- PowerShell parser: Windows PowerShell 5.1 and PowerShell 7 both parsed all six changed guard/smoke scripts with zero errors.
- `git diff --check`: passed.
- Exact twelve-path staged index: expected `12`, actual `12`, statuses limited to `A`/`M`, with zero unstaged or untracked paths.
- Immutable audit-repository inventory: changed-path count under `D:/tiku-readonly-audit/**` is `0`.
- P0 baseline manual guard passed with `p0ProgramGuardResult: pass_closed_program`, exit `0`.
- A real staged pre-commit hook run passed before the three self-recording corrections: Content Admin, recovery surface, P0, P1 one-time F-0115 authorization, independent Module exact-twelve hardening, and lint-staged all exited `0`. Because the three staged documents changed afterward, a final staged-index hook rerun remains required before commit.
- P1 manual, real pre-push, commit, merge, push, cleanup, and remote synchronization remain pending; none is claimed complete here.

## Scope Freeze

Result: pass

The current materialization changes governance only: the exact six guard/smoke scripts, the single F-0115 queue block, and this hotfix's five governance documents. No product implementation, schema or migration source generation, migration/database execution, dependency, Provider, runtime/browser, P2, PR, force push, deployment, hook bypass, or immutable audit-repository mutation occurred.

## Remote Boundary

No commit, merge, push, PR, force push, deployment, or remote completion is claimed by this pre-commit evidence. Those actions remain pending their explicit later gates and authorization.
