# P1 F-0115 Phase-11 Scope Correction Hotfix Evidence

Date: 2026-07-17

Task: `p1-f0115-phase11-scope-correction-hotfix-2026-07-17`

Base: `582c156afb0cdde8a3daa99785fda8540b56fe27`

Branch: `codex/p1-f0115-phase11-scope-correction-hotfix`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

Read and applied `AGENTS.md`, the Code Taste Ten Commandments, all architecture decisions in `docs/02-architecture/adr/`, active project state/task queue, F-0115 plan/evidence, and the P1/Module guard and smoke implementations. The fixed-base F-0132 and original F-0115 bridges were reviewed as analogous implementations.

## Requirement Mapping Result

Result: pass

- The queue delta is exactly one insertion: `tests/unit/phase-11-system-ops-user-management-loop.test.ts` in the active F-0115 `allowedFiles` after `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- The correction is bound to one task ID, parent task, base SHA, branch, fresh authorization, exact twelve-file set, and exact queue transformation.
- P1 and Module pre-commit validate staged blobs and reject index/worktree splits, missing/extra/type-changed paths, replay, wrong context, product changes, and every non-exact queue delta.
- P1 pre-push emits `transition_only` only for the exact one-parent governance commit. Module pre-push accepts the ancestor checkpoint only after that signal and an independent topology check.
- All other `in_progress` SHA drift remains hard-blocked. P0, Content Admin, dependency, schema/database, Provider, runtime, P2, PR, force-push, deployment, and sensitive-information boundaries are unchanged.

## Root-Cause Reproduction

Result: pass

- F-0115 Task 8 requires adapting the phase-11 repository fake/type contract, but the frozen active-task allowlist omitted that test path; combining governance self-modification with the product commit is correctly prohibited.
- Before production implementation, the three new smoke contract checks failed because the F-0115 phase-11 constants, exact file-set/anchor validation, transition topology, and dedicated error markers were absent.
- The phase-11 product test independently reproduced the stale fake as one failure in four tests with application code `422601`; no product file was changed in this governance worktree.

## TDD Evidence

Result: pass

- RED: P1 smoke rejected the absent F-0115 phase-11 task/file-set/anchor/authorization/error-code contract.
- RED: Module pre-commit smoke rejected the absent independent F-0115 phase-11 exact-scope contract.
- RED: Module pre-push smoke rejected the absent fixed-base transition topology contract.
- Sequence note: these initial RED checks were static contract checks, not behavior-level Git fixtures. The real behavior matrices were added only after both reviewers rejected the first static-only GREEN; they are regression correction evidence, not retroactive behavior-first TDD evidence.
- GREEN: all six modified PowerShell files parse successfully.
- The first GREEN attempt retained only static contract assertions. Both independent reviewers rejected it because dead code could satisfy those assertions; the audit decision was withdrawn until behavior fixtures existed.
- GREEN: P1 smoke now executes a fixed-base disposable Git matrix and passed `12 positive, 77 negative` in about seven minutes. The phase-11 matrix covers exact pre-commit/pre-push success, `transition_only`, wrong branch/status/base, 11/13 paths, extra product path, queue byte drift, partial staging, replay, and a multi-commit transition.
- GREEN: Module pre-commit smoke now runs the same parameterized behavior matrix for F-0132 and F-0115 phase-11; the final rerun passed in `259.4s`, including exact mode/marker/scope success and wrong context, approval, partial staging, queue, missing path, extra product path, and independently materialized approval replay rejection.
- GREEN: Module pre-push smoke now executes a dedicated F-0115 phase-11 repository topology fixture; it passed in `70.0s`, covering exact ancestor acceptance plus origin movement, non-ancestor state, merge topology, replay commit, and ordinary drift rejection.

## Validation Results

Result: pass

- Baseline before edits: P1 manual guard pass; P0 baseline pass; P1 smoke `10 positive, 67 negative`; Module pre-commit and pre-push smokes pass.
- Post-change parser: all six guard/smoke scripts pass.
- Post-change full P1, Module pre-commit, and Module pre-push behavior smokes: pass.
- Exact queue comparison: one added allowlist line and no other queue semantic change.
- `git diff --check`: pass before final staging.
- Exact staged P1 pre-commit: `p1F0115Phase11ScopeCorrectionAuthorization: approved_one_time`, `p1ProgramGuardResult: pass`, steady pre-commit mode remains `standard`.
- Exact staged Module pre-commit: task mode `p1_f0115_phase11_scope_correction`, twelve `OK_SCOPE` results, `pre-commit hardening passed`.
- Exact staged P0 pre-commit: `p0ProgramGuardResult: pass_closed_program`.
- Commit-hook result remains pending the next Task 4 step and is not yet claimed.
- No dependency, lockfile, product implementation, schema, migration, database, Provider, browser/runtime, P2, PR, force-push, deployment, or audit-repository write occurred.

Cost Calibration Gate remains blocked.

## Remote Boundary

The approved local fast-forward merge and ordinary `origin/master` push remain gated by the real pre-commit/pre-push hooks. PR creation, force push, deployment, hook bypass, and every other remote action remain unauthorized.
