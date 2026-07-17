# P1 F-0132 Scope Correction Hotfix Design

Date: 2026-07-16

Design approval source: the user's explicit 2026-07-16 approval of a one-time F-0132 scope-correction governance hotfix.

## Problem

F-0132 changes the learner redeem repository and route contract from direct `{ code }` consumption to server preview followed by version-bound confirmation. The existing phase-11 batch-management integration test must therefore adopt the new preview/confirm contract and stop expecting learner plaintext echo. The transition commit froze all required production and focused test paths except `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts`.

The P1 guard correctly rejects adding that path to `allowedFiles` after the task entered `in_progress`, and it also rejects combining queue self-expansion with implementation. Bypassing the hook or adding compatibility behavior solely to preserve the obsolete test would weaken the governance or product invariant.

## Considered Designs

### Selected: base-pinned exact scope-correction bridge

The modified P1 and Module pre-commit guards recognize one exact twelve-file hotfix set. Both independently bind it to base `5a5d9ac9c66f00991c17c3af7410958199d02a79`, branch `codex/p1-f0132-scope-correction-hotfix`, active task `p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16`, status `in_progress`, a fresh authorization artifact absent from the parent, an unsplit index/worktree, and an exact queue transformation that inserts one allowlist line after the phase-8 test. At pre-push, only that validated range may emit `transition_only`; Module pre-push then independently proves the recorded state checkpoint is an ancestor of `origin/master` and that `origin/master` is a strict ancestor of the hotfix.

### Rejected: commit queue correction with F-0132 implementation

This is self-authorization and is already correctly blocked by `P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE`.

### Rejected: hook bypass or test-only product compatibility

`--no-verify` would detach proof from the commit. A production fallback for the obsolete code-only confirmation contract would preserve the very F-0132 failure being removed.

## Exact File Set

1. `docs/04-agent-system/state/task-queue.yaml`
2. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
3. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
4. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
5. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
6. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
7. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
8. `docs/05-execution-logs/acceptance/2026-07-16-p1-f0132-scope-correction-hotfix-authorization.md`
9. `docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix-design.md`
10. `docs/05-execution-logs/task-plans/2026-07-16-p1-f0132-scope-correction-hotfix.md`
11. `docs/05-execution-logs/evidence/2026-07-16-p1-f0132-scope-correction-hotfix.md`
12. `docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0132-scope-correction-hotfix.md`

No phase-11 test content or product source belongs in this commit.

## Guard Architecture

### P1 Program guard

- Detect the exact file set only during `pre_commit` or `pre_push`.
- Reject unstaged or untracked worktree content and validate authorization, queue, evidence, and audit from the staged index at pre-commit and from `HEAD` at pre-push.
- Validate base/branch/parent shape, current task/status, authorization markers, parent absence, exact queue delta, and completed hotfix evidence/audit.
- Exempt only this validated set from steady-task scope-control, scope-self-modification, current product branch binding, and product final-review requirements.
- Continue validating the active F-0132 scope-freeze contract.
- Emit `p1TransitionScopeMode: transition_only` only for the validated hotfix pre-push range; emit `standard` for every other steady-task range.

### Module Run pre-commit guard

- Independently detect the same exact file set.
- Independently reject index/worktree splits and validate base/branch/task/status, staged approval, parent absence, staged exact queue delta, and staged hotfix evidence/audit.
- Use the exact set as the only allowed scope and retain blocked patterns for product, dependency, schema, migration, env, and audit-repository paths.

### Module Run pre-push guard

- Accept ancestor checkpoint semantics only when P1 emitted `transition_only`.
- Require `in_progress`, branch `master`, `HEAD == master`, equal non-empty state master/origin checkpoints, state checkpoint ancestry into `origin/master`, and strict `origin/master -> master` ancestry.
- Keep ordinary `in_progress` SHA drift hard-blocked when transition mode is absent or any ancestry/context condition fails.

## One-Time Semantics

At pre-commit, `HEAD` must equal the fixed base, the authorization path must be absent from `HEAD`, and no staged/working-tree split or unrelated untracked file may exist. At pre-push, the hotfix commit must have exactly one parent equal to the fixed base, `origin/master` must still equal that base, and the authorization path must be absent from the parent. After the commit is materialized or the base advances, the bridge cannot be reused.

## Verification Design

- P1 behavior: exact positive pre-commit/pre-push, `transition_only` emission, wrong task/status/base/branch, invalid approval, partial-stage split, altered queue delta, missing/extra file, materialized replay, and ordinary steady drift negatives.
- Module pre-commit smoke: independent exact positive plus wrong branch/status/base, invalid approval, partial-stage split, wrong queue delta, extra product path, and missing path negatives.
- Module pre-push smoke and integrated fixture: real `state checkpoint -> origin/master -> hotfix` transition-only positive, P1-to-Module handoff, state mismatch negative, materialized replay negative, and ordinary `in_progress` drift negative.
- Real worktree gates: P1/Module smokes, P0/P1 baselines, Module pre-commit, PowerShell syntax, Prettier, `git diff --check`, exact scope inventory, and immutable audit-repository verification.

## Scope

No dependency, lockfile, product implementation, test content, schema, migration, database, Provider, runtime/browser acceptance, P2 implementation, PR, force push, deployment, or read-only audit repository mutation is included.
