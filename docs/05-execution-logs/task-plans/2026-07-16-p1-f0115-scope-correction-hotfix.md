# P1 F-0115 Scope Correction Hotfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task with specification review and code-quality review after each task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Materialize the approved F-0115 persistent-command/schema-source scope through one base-pinned governance commit while every other `in_progress` SHA drift remains hard-blocked.

**Architecture:** P1 and Module pre-commit independently validate one exact twelve-file correction and a deterministic replacement of only the active F-0115 queue block. P1 pre-push alone emits `transition_only`; Module pre-push independently permits the ancestor checkpoint only for the proven state-checkpoint-to-origin-to-master chain.

**Tech Stack:** Windows PowerShell 5.1-compatible guards, disposable Git repositories in smoke tests, Git for Windows hooks, YAML/Markdown governance artifacts.

## Global Constraints

- Read and obey `AGENTS.md`, Code Taste Ten Commandments, and every ADR.
- Design: `docs/05-execution-logs/task-plans/2026-07-16-p1-f0115-scope-correction-hotfix-design.md`.
- Approval: `docs/05-execution-logs/acceptance/2026-07-16-p1-f0115-scope-correction-hotfix-authorization.md`.
- Parent task: `p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`.
- Base/branch/worktree: `6bde2f2aec3d71fa0ce138b26f64243861cace6f` / `codex/p1-f0115-scope-correction-hotfix` / `D:/tiku/.worktrees/p1-f0115-scope-correction-hotfix`.
- The exact queue delta and twelve-file hotfix set are frozen by the design; no other state or task block may change.
- Only this governance commit may use `transition_only`; standard `in_progress` drift remains hard-blocked.
- No product, schema generation, migration generation/execution, dependency, database, Provider, runtime/browser, P2, PR, force-push, deployment, hook bypass, or audit-repository mutation.
- The user selected one final governance commit; Tasks 1–4 create no intermediate commit, and Task 5 creates the only commit.

---

### Task 1: Add P1 RED coverage for the exact F-0115 correction

**Files:**

- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- Test: `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`

**Interfaces:**

- Consumes: fixed base/branch/task, exact twelve paths, approval markers, deterministic queue transformation.
- Produces: assertions for `p1F0115ScopeCorrectionAuthorization: approved_one_time` and `p1TransitionScopeMode: transition_only`.

- [x] Add a disposable Git fixture whose parent queue contains the exact current F-0115 block and whose staged queue is the exact design transformation.
- [x] Assert the exact pre-commit passes and the exact one-parent committed pre-push emits `transition_only`.
- [x] Add negatives for wrong base, branch, task, status, approval, scalar/list/order queue delta, missing/extra path, partial staging, product path, replay, and ordinary steady-task drift.
- [x] Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1` and verify RED because the F-0115 marker/mode is absent while existing cases remain green.

### Task 2: Add independent Module RED coverage

**Files:**

- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- Test: both smoke files.

**Interfaces:**

- Consumes: the same immutable contract without trusting the P1 implementation.
- Produces: `preCommitScopeMode: p1_f0115_scope_correction` assertions and transition-only ancestor handoff coverage.

- [x] Add an exact staged positive fixture and negatives for wrong base/branch/task/status, invalid approval, changed queue semantics, missing path, extra product path, and index/worktree split.
- [x] Add the integrated ancestry fixture `state checkpoint -> origin/master(base) -> exact hotfix`, plus state mismatch, origin movement, replay, and standard drift negatives.
- [x] Run both Module smoke files and verify RED only in the new F-0115 cases.

### Task 3: Implement the minimal P1 bridge

**Files:**

- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`

**Interfaces:**

- Produces: `Test-P1F0115ScopeCorrectionFileSet`, `Test-P1F0115ScopeCorrectionAnchors`, and one-time authorization/mode output.

- [x] Add immutable constants for the task/base/branch/artifact paths, exact twelve-file set, and every queue anchor/replacement defined by the design.
- [x] Implement exact set equality, one-occurrence replacement checks, full queue equality, and proof that no block other than F-0115 changed.
- [x] Validate index/HEAD blobs, base and single-parent topology, active task/status, approval content and parent absence, completed evidence/audit, no untracked or staged/worktree split.
- [x] Exempt only the validated bridge from steady scope-change, self-modification, product branch binding, and product final-review branches.
- [x] Emit `transition_only` only at valid pre-push; run the P1 smoke to GREEN.

### Task 4: Implement the minimal Module bridge

**Files:**

- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`

**Interfaces:**

- Produces: independent exact pre-commit scope mode and exact transition-only ancestor acceptance.

- [x] Duplicate the immutable contract and independent validation in Module pre-commit; do not call or trust the P1 guard.
- [x] Retain all product/dependency/schema/migration/env/audit-repository blocks for the hotfix file set.
- [x] In Module pre-push, accept an older checkpoint only when P1 mode is `transition_only` and every design ancestry/state/branch/status predicate holds.
- [x] Run the Module pre-commit and pre-push smokes to GREEN, then confirm the unchanged P1 guard/smoke retains its latest 10 positive/65 negative GREEN evidence.

### Task 5: Apply the queue correction, review, verify, and create one commit

**Files:**

- Create: approval, evidence, and audit artifacts from the exact design file set.
- Modify: only the F-0115 block in `docs/04-agent-system/state/task-queue.yaml`.

**Interfaces:**

- Produces: one governance commit accepted as `transition_only` and the exact product allowlist consumed after integration.

- [x] Create the approval artifact with `Status: approved`, human approval source, parent task id, `schemaMigration`, and all explicit preserved blocks.
- [x] Apply the exact queue transformation; prove all other bytes equal the parent after normalizing only LF.
- [x] Record RED/GREEN command outputs and exact positive/negative smoke inventory in evidence.
- [x] Perform Round 1 adversarial review of topology, exact queue identity, self-authorization, and one-time semantics.
- [x] Perform an independent Round 2 review of missing/extra files, wrong base/branch/task/status, tampering, path normalization, ordinary drift, ancestry, sensitive content, and immutable audit repository.
- [x] Complete final code-review rereview; close the sole contradictory-artifact Important finding and confirm no new Critical or Important finding.
- [x] Run P1, Module pre-commit, and Module pre-push smokes; P0 baseline; PowerShell parser; scoped Prettier; YAML parse; `git diff --check`; exact scope; and audit-repository immutability checks.
- [x] Stage exactly twelve A/M paths with no unstaged or untracked path.
- [ ] Complete the final staged-index read-only review, rerun the real pre-commit hook on that exact index, and commit `fix(governance): authorize F-0115 scope correction`.

### Task 6: Integrate, push, clean up, and resume the product task

- [ ] Fast-forward local `master` to the hotfix commit and run fresh-master governance gates.
- [ ] Push `master` normally through the real pre-push hook; verify local/origin/live SHA equality.
- [ ] Fast-forward the F-0115 product worktree/branch to the governance tip while preserving its existing staged specification and local plan/evidence/audit changes.
- [ ] Verify only the approved product-task paths remain modified and no product implementation exists yet.
- [ ] Delete the merged hotfix worktree and branch only after remote synchronization; preserve `stash@{0}`.
- [ ] Resume the approved F-0115 product plan with fresh task subagents and two-stage reviews.

## Plan Self-Review Checklist

- [x] Every design requirement maps to a task.
- [x] P1 and Module validate independently.
- [x] The queue transformation and product allowlist are exact, not generic.
- [x] The bridge is base/branch/task/status/file-set/approval bound and one-time.
- [x] Standard `in_progress` SHA drift remains hard-blocked.
- [x] No product/schema/migration/database/runtime action occurs in the governance hotfix.
- [x] Final history contains one governance commit.

## Stop Conditions

Stop if implementation needs a thirteenth path, changes project-state or another queue block, permits a non-exact file set or queue delta, applies after the fixed base, weakens standard SHA drift, requires hook bypass, or expands into product/dependency/schema/migration/database/Provider/runtime/P2/PR/force/deploy work.

## SDD Progress Ledger

- Task 1: complete (working-tree snapshot `d52f410708b93790740a789c11ba99958b70193e`; RED after existing 8 positive/48 negative; spec visible requirements satisfied; quality approved).
- Task 1 reviewer Minor: missing/extra/product-path assertions currently accept generic `P1_PROGRAM_`; narrow them after Task 3 defines the exact F-0115 file-set/product-scope findings and include the result in Task 3 re-review.
- Task 1 reviewer cross-task check: the exact queue transformation was manually matched to the approved design; ordinary non-transition SHA drift remains assigned to Task 2 Module pre-push coverage.
- Task 2: complete (working-tree snapshot `1f330d3c727a6642f4d7ee42ca8b0644befb785e`; both existing Module smokes baseline-green then new F-0115 cases RED; spec compliant; quality approved).
- Task 2 reviewer Minor: disposable fixture output contains pre-existing CRLF/LF warnings; keep final validation classification based on explicit exit/status markers and do not suppress repository line-ending diagnostics.
- Task 3: complete (working-tree snapshot `7426e29c4d0f20d23486706638620cda8d97750a`; P1 smoke 10 positive/65 negative GREEN; spec compliant; quality approved after three Important review findings were fixed and re-reviewed).
- Task 3 review closure: approval requires the exact schema/preserved-capability block; final authorization marker/mode occur only after all findings clear; missing/extra/product and post-candidate failure tests are real, deterministic, and fail-closed.
- Task 4: complete (working-tree snapshot `dd9e40af4a31e0d2a803b374028f28b0ae6dda16`; Module pre-commit/pre-push smokes GREEN; spec compliant; quality approved after three Important review findings were fixed and re-reviewed).
- Task 4 review closure: Module independently validates the exact capability block; success markers emit only after all findings clear; pre-push exact-12 topology accepts only A/M and hard-blocks D/R/T, replay, origin movement, state mismatch, and ordinary drift.
- Task 5 implementation review: snapshot `a04bae1074b7f335207254a8d933661f7c86bd77` closed the sole contradictory-artifact Important finding with no new Critical/Important. It is an implementation-review anchor, not the final staged index; the later delta is limited to the audit, evidence, and implementation-plan self-recording documents. Fresh P1 smoke `10 positive, 67 negative`, Module pre-commit smoke (`183.1s`), Module pre-push smoke (`57.0s`), P0 baseline, and the first real staged hook are GREEN. Final staged-index review/hook rerun, P1 manual, commit, merge, and push remain pending.
