# P1 F-0117 Smoke Scope-Correction Closeout Lifecycle Hotfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:systematic-debugging and superpowers:test-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 让已同步到 `origin/master` 的 F-0117 smoke scope-correction 身份文件不再永久劫持后续正常产品 closeout，同时保持该治理提交首次推送时的 transition-only 单父祖先检查及其他普通 `in_progress` SHA drift hard-block。

**Architecture:** 将旧 F-0117 smoke scope-correction 的 pre-push candidate 从“master 中任一身份文件存在”收窄为精确未物化生命周期：`master` 必须是批准治理提交、唯一父提交为批准 base，且 `origin/master` 仍等于批准 base。为本 follow-up 热修增加一次性固定 task/base/branch/file-set contract，使其自身只能作为 `71f150ce...` 的单父治理提交走 transition-only；同步后不再成为 candidate，正常 F-0117 产品 closeout回到既有 generic closeout ancestry。

**Tech Stack:** PowerShell、Git topology、P1/Module Run v2 guards、disposable Git smoke fixtures。

## Global Constraints

- Task ID：`p1-f0117-smoke-scope-closeout-lifecycle-hotfix-2026-07-18`。
- Parent task：`p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`。
- Base：`71f150ceef0af54fca8d72db20a4254313630c7f`。
- Branch：`codex/f0117-smoke-scope-closeout-fix`。
- 只有本 exact follow-up governance commit 通过 `transition_only`、exact-one-parent、origin-at-base、exact file set 与 authorization 后可使用 ancestor checkpoint。
- 已同步旧 identity 必须不再进入旧 special candidate；普通 F-0117 product closeout 继续由既有 closeout/generic ancestry 决策。
- 普通 `in_progress` SHA drift、wrong branch/base/task/status/file set/topology、standard mode、replay 全部 hard-block。
- 不修改 product/schema/migration/state/queue/package/lock/provider/runtime/browser/P2/PR/deploy，不执行数据库或远端动作。

## Allowed Files

1. `docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix-authorization.md`
2. `docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md`
3. `docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md`
4. `docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-closeout-lifecycle-hotfix.md`
5. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
6. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
7. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
8. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
9. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
10. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Blocked Files And Actions

- `docs/04-agent-system/state/project-state.yaml` 与 `docs/04-agent-system/state/task-queue.yaml`。
- 所有产品源码、产品测试、schema、migration、package、lockfile、env、provider、runtime/browser 与 P2 文件。
- commit、merge、push、PR、force-push、deploy、数据库连接或数据库执行。

---

### Task 1: Reproduce the synced-identity lifecycle hijack

**Files:**

- Modify: `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`
- Modify: `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
- Modify: `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`

**Interfaces:**

- Consumes: master/origin topology and existing F-0117 smoke scope-correction identity paths.
- Produces: a failing assertion proving synced identity must not select the old special candidate, plus static contract checks for the follow-up exact scope.

- [x] **Step 1: Add RED smoke**

Add a disposable pre-push case where `master == origin/master == 71f150ce...`, the old authorization exists, and a later normal F-0117 closeout child is evaluated. Assert that output must not contain any old `HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_*` finding and must follow generic closeout ancestry.

- [x] **Step 2: Verify RED**

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
```

Expected: fail because the old identity-only candidate invokes the old exact hotfix topology after synchronization.

### Task 2: Implement the exact lifecycle and follow-up contract

**Files:** all ten Allowed Files.

**Interfaces:**

- Consumes: RED fixture, fixed base/branch/task/file set, existing exact transition patterns.
- Produces: lifecycle-aware old candidate and one-time follow-up admission in P1, Module pre-commit, and Module pre-push.

- [x] **Step 1: Make old candidate lifecycle-aware**

Require old candidate to satisfy all of: old identity at `master`, `origin/master == 3e3c400f...`, `master` has exactly one parent equal to `3e3c400f...`, and `master != origin/master`. The identity remaining after synchronization is insufficient by itself.

- [x] **Step 2: Add exact follow-up scope**

Validate fixed task ID, parent task, base `71f150ce...`, branch, authorization uniqueness, exact ten files, no state/queue delta, transition-only, exact-one-parent, origin-at-base, and replay hard-block. Do not add wildcard or generic bypass.

- [x] **Step 3: Verify GREEN and adversarial matrix**

Run the focused lifecycle smoke and negative cases for synced identity, wrong origin/base/branch/task/status, missing/extra file, authorization tamper, standard mode, multi-parent, replay, and ordinary unrelated `in_progress` drift.

### Task 3: Validate and document

**Files:** evidence and audit documents plus the six allowed scripts.

**Interfaces:**

- Consumes: fresh command outputs and final diff.
- Produces: sanitized evidence, adversarial audit, and an uncommitted exact-scope worktree.

- [x] **Step 1: Run required validation**

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18
npm.cmd run format:check
git diff --check
```

- [x] **Step 2: Write evidence and adversarial audit**

Record exact RED/GREEN cause, positive/negative matrix, no state/queue/product/database/remote action, parser status, file inventory, and taste checklist.

- [x] **Step 3: Leave uncommitted**

Report changed files, validation results, risks, and worktree state to the main thread. Do not commit, merge, push, or clean up.

## Stop Conditions

- Lifecycle cannot be expressed as exact origin/base/single-parent/file-set predicates.
- Any fix requires state/queue or product/schema/migration/package/lock/provider/runtime/P2 changes.
- Any ordinary `in_progress` SHA drift, wrong topology, standard mode, or replay becomes allowed.
- Focused smoke or required P1/P0/Module/format/diff validation fails.
- Any database or remote action would be required.
