# P1 F-0115 Phase-11 Scope Correction Hotfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development and execute each checkbox in order.

**Goal:** Add one phase-11 test path to the frozen F-0115 allowlist through an exact, one-time transition-only governance bridge.

**Architecture:** Extend the existing P1/Module exact-hotfix pattern with a separately named base-pinned contract. The initial static contract RED preceded guard implementation; behavior-level disposable Git fixtures were added after independent review rejected static-only coverage. The queue transformation remains one-line and the pre-push ancestor exception remains topology-bound.

**Tech Stack:** PowerShell 7/Windows PowerShell, Git, YAML, Markdown.

## Global Constraints

- Base: `582c156afb0cdde8a3daa99785fda8540b56fe27`.
- Branch: `codex/p1-f0115-phase11-scope-correction-hotfix`.
- Exact twelve-file governance commit; no product path.
- No hook bypass, dependency/schema/database/provider/runtime/P2/deploy/PR/force-push action.
- Other `in_progress` SHA drift remains hard-blocked.

---

### Task 1: Establish RED smoke contracts

**Files:**

- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

- [x] Establish static contract RED checks for the new task/base/branch/file set and one-line queue delta before guard implementation.
- [x] After the first review rejected static-only coverage, add exact behavior-level positive/adversarial Git fixtures and record this TDD sequence deviation explicitly.

### Task 2: Implement exact P1 and Module guards

**Files:**

- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`

- [x] Add isolated constants and validation functions for the phase-11 correction.
- [x] Accept only the exact staged/committed twelve-file set and exact queue replacement.
- [x] Emit transition-only only for the exact one-parent commit.
- [x] Permit Module ancestor checkpoint only after P1 transition-only and independent topology validation.
- [x] Run the three smokes and verify GREEN.

### Task 3: Materialize queue delta and final evidence

**Files:**

- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: authorization, design, plan, evidence, and audit files named for this task.

- [x] Insert only `tests/unit/phase-11-system-ops-user-management-loop.test.ts` at the designed anchor.
- [x] Record completed baseline, static RED, behavior regression correction, smoke, format, and diff evidence without secrets; leave exact staged/hook gates pending Task 4.
- [x] Complete two adversarial review rounds and final decision.

### Task 4: Commit, merge, push, and resume product branch

- [x] Stage exactly twelve files and run P1/Module/P0 pre-commit.
- [ ] Create one governance commit through hooks.
- [ ] Fast-forward `master`, run P1 transition-only plus Module pre-push ancestor gates, and push normally.
- [ ] Fast-forward the product branch to the governance commit while preserving its dirty product changes.
- [ ] Delete the governance worktree/branch after proving merge and remote sync.
- [ ] Adapt only the now-authorized phase-11 type/fake and resume F-0115 Task 8.

## Stop Conditions

Stop on any thirteenth file, non-additive queue delta, guard regression, product change in the governance worktree, hook bypass requirement, non-fast-forward remote action, or unapproved capability.
