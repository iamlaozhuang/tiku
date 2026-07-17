# P1 F-0132 Scope Correction Hotfix Evidence

Date: 2026-07-16

Task: `p1-f0132-scope-correction-hotfix-2026-07-16`

Base: `5a5d9ac9c66f00991c17c3af7410958199d02a79`

Branch: `codex/p1-f0132-scope-correction-hotfix`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

Read and applied `AGENTS.md`, the Code Taste Ten Commandments, ADR-001 through ADR-007, the active project state/task queue, the P1 Program guards/smokes, and the Module Run pre-commit/pre-push guards/smokes.

## Requirement Mapping Result

Result: pass

- The queue delta is exactly one insertion: `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts` in the active F-0132 `allowedFiles` after the phase-8 test.
- The governance bridge is bound to one fixed base, branch, active task, `in_progress` status, twelve-file set, fresh approval absent from the parent, single-parent pre-push commit, and exact queue transformation.
- Pre-commit rejects unstaged tracked changes and untracked files, then validates approval, queue, evidence, and audit from index blobs. Pre-push validates committed `HEAD` blobs.
- Module pre-push accepts an older checkpoint only after P1 emits `transition_only` and only when state master/origin checkpoints are equal, state is an ancestor of `origin/master`, and `origin/master` is a strict ancestor of local `master`.
- Standard `in_progress` SHA drift, replay, wrong base/branch/status, partial staging, missing/extra paths, product changes, and all out-of-scope actions remain blocked.

## Root-Cause Reproduction

Result: pass

- The original F-0132 commit attempt was correctly rejected because the phase-11 test was absent from the frozen task allowlist and governance self-modification could not be combined with product implementation.
- Initial P1 RED failed because the exact F-0132 bridge functions and authorization marker did not exist.
- Initial Module pre-commit RED reported the existing steady-task scope/self-modification hard blocks.
- The new lagging-checkpoint Module pre-push RED failed with `HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID` plus repository SHA drift for both master and origin/master, proving the prior equality-only policy could not perform the approved push.
- A smoke-fixture status mutation originally used a catastrophic multiline regex and was replaced with a bounded line regex; runtime returned to the prior tens-of-seconds range.

## TDD Evidence

Result: pass

- P1 behavior covers exact positive pre-commit/pre-push, `transition_only`, wrong branch/status/base, invalid approval, partial-stage split, wrong queue delta, missing path, extra product path, and materialized replay.
- Module pre-commit independently covers the same critical context/authorization/queue/scope failures rather than relying on P1 as a fallback.
- The integrated fixture executes the committed P1 output through Module pre-push using the real `08aee... -> 5a5d9... -> hotfix` ancestor shape.
- Module pre-push smoke separately proves the transition-only state-to-origin-to-master ancestor path and invalid checkpoint rejection.

## Validation Results

Result: pass

- P1 smoke: `8 positive, 48 negative`, pass.
- Module pre-commit smoke: pass; main run `63.4s`, independent adversarial rerun `94.1s`.
- Module pre-push smoke: pass; main reruns `19.6s`/`32.9s`, independent adversarial rerun `20.7s`.
- P0 global baseline: pass; P0 `35`, P1/P2 impacts `143`, runtime pending `21`, root-cause clusters `8`, dependency cycles `0`.
- Content Admin pre-commit, Content Admin recovery, and P0 pre-commit guards: pass.
- PowerShell parser: all six modified guard/smoke scripts pass.
- Exact staged P1 pre-commit: `p1F0132ScopeCorrectionAuthorization: approved_one_time`, `p1ProgramGuardResult: pass`.
- Exact staged Module pre-commit: `preCommitScopeMode: p1_f0132_scope_correction`, twelve `OK_SCOPE` results, `pre-commit hardening passed`.
- Scoped Prettier check for the queue and five hotfix Markdown artifacts: pass.
- Independent topology and smoke re-reviews: both `APPROVE`, no remaining blocker.
- `git diff --check`: pass.
- Early timed-out TDD fixtures: absolute paths verified under `%TEMP%`, read-only attributes normalized, `9` residual directories removed, remaining `0`.
- No dependency, lockfile, product implementation, phase-11 test content, schema, migration, database, Provider, browser/runtime, P2, PR, force push, deployment, or audit-repository write occurred.

Cost Calibration Gate remains blocked.

## Remote Boundary

The approved local fast-forward merge and ordinary `origin/master` push remain gated by the real pre-commit/pre-push hooks. PR creation, force push, deployment, and every other remote action remain unauthorized.
