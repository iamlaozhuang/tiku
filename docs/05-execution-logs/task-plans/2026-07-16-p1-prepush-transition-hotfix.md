# P1 Transition Pre-Push Hotfix Implementation Plan

> **For agentic workers:** execute inline with systematic debugging and TDD. The main Agent is the only writer; no Subagent is used.

**Goal:** Remove the P1 successor-transition pre-push deadlock without weakening any non-transition `in_progress` SHA-drift hard block.

**Architecture:** The P1 guard is the sole classifier of a governance-only transition. The hook runs it before Module Run and conditionally passes a narrow transition mode. Module Run independently verifies branch, task status, state/origin equality, and strict ancestor relationships before accepting only the local-master checkpoint difference.

**Tech Stack:** Git for Windows `sh`, PowerShell 5.1-compatible guard scripts, disposable Git repositories in smoke tests.

## Global Constraints

- Read and obey `AGENTS.md`, the Code Taste Ten Commandments, and ADR-001 through ADR-007.
- Approval source: `docs/05-execution-logs/acceptance/2026-07-16-p1-prepush-transition-hotfix-authorization.md`.
- Base: `origin/master` at `4806ba0aed4c9e5f85fd65e1a663bda3e73ebce3`.
- Exact branch/worktree: `codex/p1-prepush-transition-hotfix` / `D:/tiku/.worktrees/p1-prepush-transition-hotfix`.
- No dependency, product, schema, database, Provider, runtime, browser, P2, PR, force-push, deployment, or audit-repository mutation.
- The hotfix is a separate governance commit and must be pushed before rebasing the pending F-0003 task.

## Root-Cause Evidence

- Full-range push: P1 guard rejects transition plus implementation.
- Transition-only push: P1 pre-push passes, while Module Run rejects only `HARD_BLOCK_PRE_PUSH_REPOSITORY_SHA_DRIFT master`.
- The recorded checkpoint cannot equal the commit that contains it, so equality for an active transition is self-referential and impossible.

### Task 1: Establish RED coverage

**Files:**

- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`

- [x] Add a P1 transition pre-push assertion requiring `p1TransitionScopeMode: transition_only`.
- [x] Add ordinary pre-push and same-task closeout assertions requiring `standard`.
- [x] Add a disposable-repository Module Run fixture where `master` is one governance commit ahead of `origin/master`, both state SHAs equal `origin/master`, and task status is `in_progress`.
- [x] Require that fixture to pass only with `-P1TransitionScopeMode transition_only` and fail without it.
- [x] Add negative cases for invalid state/origin equality and a non-ancestor checkpoint.
- [x] Run both smoke scripts and record the expected RED failure caused by the missing output/parameter.
- [x] Reproduce the current Module pre-commit out-of-scope block for the independently authorized exact hotfix set.

### Task 2: Implement the minimal guard handoff

**Files:**

- Modify: `.husky/pre-push`
- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`

- [x] Make the P1 guard emit `transition_only` only after a valid pre-push task transition has no implementation change; emit `standard` otherwise.
- [x] Capture stdin before any consumer, run P1 before Module Run, and forward the mode only from a successful P1 invocation.
- [x] Add Module Run's validated mode parameter.
- [x] Require `in_progress`, branch `master`, `HEAD == master`, both state SHAs equal actual `origin/master`, and strict `origin/master -> master` ancestry.
- [x] Permit only the local-master checkpoint mismatch under this mode; keep origin mismatch and every other path hard-blocked.
- [x] Add a one-time pre-commit bridge pinned to the exact hotfix files, approved base/branch/bootstrap state, and a new approval artifact absent from the parent; do not mutate the task queue allowlist.
- [x] Run focused smoke scripts to GREEN.

### Task 3: Adversarial regression and evidence

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-07-16-p1-prepush-transition-hotfix.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-16-p1-prepush-transition-hotfix.md`
- Modify: `docs/05-execution-logs/evidence/2026-07-16-p1-remediation-program-bootstrap.md`
- Modify: `docs/05-execution-logs/audits-reviews/2026-07-16-p1-remediation-program-bootstrap.md`

- [x] Run P1 guard smoke, Module Run pre-push smoke, Content Admin recovery smoke, P1 startup guard, P0 global baseline, P0 serial guard, Module pre-commit, Module closeout, scoped formatting, and `git diff --check`.
- [x] Prove product files, dependencies, schema, runtime and audit repository are unchanged.
- [x] Perform Round 1 review on trust boundaries, proof provenance, shell stdin handling, ref validation, ancestry and fail-closed behavior.
- [x] Perform Round 2 review on cross-program hooks, PowerShell 5.1, regression coverage, historical artifacts, P2/runtime holds and sensitive evidence.
- [x] Record exact outputs and final decision.

### Task 4: Commit, integrate and unlock the pending P1 task

- [ ] Commit one focused governance hotfix.
- [ ] Fast-forward local `master` from `origin/master`, run fresh-master governance gates, and ordinary-push the hotfix.
- [ ] Rebase the four unpushed F-0003 commits onto the new remote base without force-pushing any published ref.
- [ ] Push the rewritten transition-only commit through the repaired hook, then push the remaining implementation/evidence/closeout commits normally.
- [ ] Verify local/remote/live SHA equality before deleting both completed worktrees and branches.
- [ ] Materialize hotfix closure in the next transition state without rewriting historical semantics.

## Stop Conditions

Stop if the implementation needs a hook bypass, broad `in_progress` ancestry acceptance, product/dependency/schema changes, audit-repository writes, a non-fast-forward remote update, or cannot distinguish transition-only from steady implementation ranges.
