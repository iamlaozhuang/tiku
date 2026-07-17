# P1 F-0132 Scope Correction Hotfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: execute inline with `superpowers:executing-plans`, `superpowers:systematic-debugging`, and `superpowers:test-driven-development`. Steps use checkbox syntax for tracking.

**Goal:** Add the one omitted phase-11 test path to the active F-0132 allowlist through a one-time governance checkpoint without weakening any other `in_progress` SHA-drift hard block.

**Architecture:** P1 and Module pre-commit independently recognize the same base-pinned twelve-file bridge, reject index/worktree splits, and validate the same exact queue transformation from staged blobs. P1 alone emits `transition_only` for the committed pre-push range; Module pre-push independently validates state-checkpoint-to-origin-to-master ancestry.

**Tech Stack:** Windows PowerShell 5.1-compatible guard scripts, disposable Git repositories in smoke tests, Git for Windows hooks.

## Global Constraints

- Read and obey `AGENTS.md`, Code Taste Ten Commandments, and ADR-001 through ADR-007.
- Approval source: `docs/05-execution-logs/acceptance/2026-07-16-p1-f0132-scope-correction-hotfix-authorization.md`.
- Base/branch/worktree: `5a5d9ac9c66f00991c17c3af7410958199d02a79` / `codex/p1-f0132-scope-correction-hotfix` / `D:/tiku/.worktrees/p1-f0132-scope-correction-hotfix`.
- The only queue mutation is insertion of `tests/unit/phase-11-redeem-code-batch-management-loop.test.ts` into the active F-0132 `allowedFiles` after the phase-8 test.
- No hook bypass, dependency, product implementation, test content, schema, migration, database, Provider, runtime/browser acceptance, P2, PR, force push, deployment, or audit-repository mutation.

---

### Task 1: Establish P1 RED coverage

**Files:**

- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- Test: `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`

**Interfaces:**

- Consumes: fixed base, exact twelve-file set, exact queue insertion, current F-0132 state.
- Produces: assertions for `p1F0132ScopeCorrectionAuthorization: approved_one_time` and `p1TransitionScopeMode: transition_only`.

- [ ] Add a disposable repository fixture that stages the exact file set and exact queue insertion against the fixed base.
- [ ] Assert pre-commit passes only for the exact context and pre-push emits `transition_only` only after the exact commit is created.
- [ ] Add negatives for wrong task/status/branch/base, invalid approval, changed queue semantics, missing path, extra path, and ordinary steady-task drift.
- [ ] Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1` and verify RED because the new authorization marker/mode is absent.

### Task 2: Establish Module pre-commit RED coverage

**Files:**

- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- Test: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`

**Interfaces:**

- Consumes: the same fixed base, file set, queue delta, task/status, and authorization contract.
- Produces: assertions for `preCommitScopeMode: p1_f0132_scope_correction` and the one-time authorization marker.

- [ ] Add the exact positive fixture using real staged files and real queue content.
- [ ] Add invalid approval, wrong queue delta, missing path, and extra `src/out-of-scope.ts` negatives.
- [ ] Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1` and verify RED because the bridge is unknown.

### Task 3: Implement the minimal P1 bridge

**Files:**

- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`

**Interfaces:**

- Produces: `Test-P1F0132ScopeCorrectionFileSet` and `Test-P1F0132ScopeCorrectionAnchors`.

- [ ] Add constants for task id, parent task id, base, branch, authorization/evidence/audit paths, exact queue anchor, and exact twelve-file set.
- [ ] Implement exact file-set equality and parent-relative queue equality:

```powershell
$expectedQueueText = $parentQueueText.Replace($queueAnchor, "$queueAnchor`n$queueInsertion")
if ($parentQueueText -eq $expectedQueueText -or $queueText -cne $expectedQueueText) {
    Add-Finding "P1_PROGRAM_F0132_SCOPE_CORRECTION_QUEUE_DELTA_INVALID"
}
```

- [ ] Validate pre-commit/pre-push Git topology, current task/status, approval parent absence/content, and final hotfix evidence/audit markers.
- [ ] Reject partial staging/untracked drift and validate mutable hotfix artifacts from index blobs at pre-commit and `HEAD` blobs at pre-push.
- [ ] Exempt only the validated bridge from the steady-task scope-control, self-modification, branch-binding, and current-product final-review branches; retain F-0132 scope-freeze validation.
- [ ] Emit `transition_only` only when `Phase == pre_push` and this bridge is valid.
- [ ] Run the P1 smoke to GREEN.

### Task 4: Implement the minimal Module pre-commit/pre-push bridge

**Files:**

- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

**Interfaces:**

- Produces: `Test-P1F0132ScopeCorrectionFileSet`, `Test-P1F0132ScopeCorrectionAnchors`, and scope mode `p1_f0132_scope_correction`.

- [ ] Add the same immutable constants and exact file-set comparison.
- [ ] Independently validate fixed base/branch/task/status, approval parent absence/content, exact queue delta, and final evidence/audit.
- [ ] Select only the exact twelve files as allowed scope; keep product/dependency/schema/env/audit-repository blocks.
- [ ] Permit an older state checkpoint only under P1 `transition_only`, with state equality, state-to-origin ancestry, and strict origin-to-master ancestry.
- [ ] Run the Module pre-commit smoke to GREEN.
- [ ] Re-run the existing Module pre-push smoke to prove standard drift still blocks and transition-only ancestry still passes.

### Task 5: Evidence, adversarial reviews, and focused commit

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-07-16-p1-f0132-scope-correction-hotfix.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-07-16-p1-f0132-scope-correction-hotfix.md`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

**Interfaces:**

- Produces: final evidence/audit consumed by both guards and the exact allowlist correction consumed by F-0132.

- [ ] Insert the one approved allowlist line with no other queue difference.
- [ ] Record RED/GREEN outputs and exact positive/negative coverage.
- [ ] Perform Round 1 on one-time topology, queue-delta identity, self-authorization, and final-review separation.
- [ ] Perform Round 2 on missing/extra files, wrong base/branch/task/status, approval tampering, ordinary drift, path normalization, sensitive evidence, and immutable audit repository.
- [ ] Run P1 smoke, Module pre-commit smoke, Module pre-push smoke, P1 manual, P0 baseline, real Module pre-commit, scoped Prettier, PowerShell parser checks, and `git diff --check`.
- [ ] Stage exactly twelve paths, run the real pre-commit hook, and commit `fix(governance): authorize F-0132 scope correction`.

### Task 6: Integrate and resume F-0132

- [ ] Fast-forward merge the hotfix into local `master` and run fresh-master governance gates.
- [ ] Push `master` normally through the real pre-push hook; verify local/origin/live SHA equality.
- [ ] Fast-forward the clean F-0132 product branch to the hotfix commit, restore its named stash, and verify only the approved product-task allowlist is touched.
- [ ] Delete the merged hotfix worktree and branch only after remote synchronization.
- [ ] Resume F-0132 implementation commit and closeout; do not start another product finding.

## Stop Conditions

Stop if the bridge needs hook bypass, permits any queue delta beyond the one line, permits a non-exact file set, applies after the fixed base, changes phase-11 test content in the hotfix, weakens ordinary `in_progress` drift, or expands into product/dependency/schema/database/runtime/P2/remote actions beyond the approved closeout.
