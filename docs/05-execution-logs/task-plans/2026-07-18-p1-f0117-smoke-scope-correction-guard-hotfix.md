# P1 F-0117 Smoke Scope-Correction Guard Hotfix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 以一次精确治理提交物化用户批准的 F-0117 旧 migration smoke allowlist correction，并确保只有该已通过 P1 `transition_only` 的单父治理提交可使用 Module ancestor checkpoint。

**Architecture:** 固定 base、branch、parent task、authorization 和 12 个治理文件。`project-state` 只把 repository checkpoint 投影到当前父提交，`task-queue` 只向 F-0117 `allowedFiles` 增加一个旧 smoke 路径。三套守卫沿用既有 exact one-time transition 模式，不抽象新机制、不改变普通 `in_progress` 语义；产品 smoke 内容在治理提交合入后由原 F-0117 产品任务修改。

**Tech Stack:** PowerShell、YAML、Git transition topology、P1/Module Run v2 smoke fixtures。

## Global Constraints

- Task ID：`p1-f0117-smoke-scope-correction-guard-hotfix-2026-07-18`。
- Parent task：`p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18`。
- Base：`3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a`。
- Branch：`codex/f0117-smoke-scope-correction`。
- 用户批准内容：一次性把 `tests/unit/p1-employee-import-command-migration-source.test.ts` 加入 F-0117 allowlist；后续产品修正只能删除 F-0116 migration 永久 terminal 假设，同时保留 entry 唯一、idx 连续和 snapshot `prevId` 线性校验。
- 只有已通过 P1 `transition_only` 的本治理提交可使用 ancestor checkpoint；其他 `in_progress` SHA drift、standard mode、replay、多父提交继续 hard-block。
- 不修改产品源码、产品测试内容、schema/migration、依赖/lockfile、数据库、Provider、runtime/browser、P2、PR、force-push 或 deploy。
- 不削弱 P1/P0/Module 守卫、证据、审批、WIP=1、敏感信息或 closeout 纪律。

## Exact Governance Files

1. `docs/04-agent-system/state/project-state.yaml`
2. `docs/04-agent-system/state/task-queue.yaml`
3. `docs/05-execution-logs/acceptance/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix-authorization.md`
4. `docs/05-execution-logs/task-plans/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md`
5. `docs/05-execution-logs/evidence/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md`
6. `docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0117-smoke-scope-correction-guard-hotfix.md`
7. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
8. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
9. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
10. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
11. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Exact State Projection

`docs/04-agent-system/state/project-state.yaml` 只允许：

```yaml
repositoryCheckpoint:
  lastKnownMasterSha: 3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a
  lastKnownOriginMasterSha: 3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a
  lastKnownRemoteMasterSha: 3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a
```

其他 state 字段保持父提交全文一致。

`docs/04-agent-system/state/task-queue.yaml` 只允许在当前 F-0117 `allowedFiles` 的既有 migration source test 后加入：

```yaml
- tests/unit/p1-employee-import-command-migration-source.test.ts
```

其他 queue 字段保持父提交全文一致。

---

### Task 1: Exact one-time governance transition

**Files:** 仅 `Exact Governance Files` 中 12 个文件。

**Interfaces:**

- Consumes: 当前 F-0117 `in_progress` state/queue、base SHA、用户批准文本和既有 F-0117 spec-transition exact guard pattern。
- Produces: P1 pre-commit/pre-push 的 `approved_one_time` + `transition_only`，Module pre-commit 的 exact 12-file admission，以及 Module pre-push 的 `exact_one_parent` ancestor checkpoint。

- [x] **Step 1: 创建 authorization 文档**

精确记录：

```text
Status: approved
Task ID: p1-f0117-smoke-scope-correction-guard-hotfix-2026-07-18
Parent task: p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18
Base: 3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a
Branch: codex/f0117-smoke-scope-correction
Human approval source: current user message approving one-time F-0117 smoke scope-correction on 2026-07-18
Approved allowlist correction: tests/unit/p1-employee-import-command-migration-source.test.ts
ancestorCheckpoint: only_after_transition_only_guard_pass
otherInProgressShaDrift: hard_block
standardMode: hard_block
replay: hard_block
```

并按上述顺序列出 12 个 exact governance files；禁止列入产品 smoke 文件本身。

- [x] **Step 2: 在三套 smoke 写 RED**

新增独立 F-0117 scope-correction fixture，要求生产守卫输出以下 marker：

```text
p1F0117SmokeScopeCorrectionAuthorization: approved_one_time
p1TransitionScopeMode: transition_only
p1F0117SmokeScopeCorrectionTransitionTopology: exact_one_parent
OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master
```

RED 必须先因生产守卫尚无本次 exact task/authorization/file-set 而失败。fixture 必须覆盖：错误 base/branch/task/status、missing/extra file、queue/state 额外 delta、authorization 字段缺失/重复/篡改、standard mode、replay、多父提交、普通 SHA drift，以及把产品 smoke 内容夹入治理提交。

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
```

Expected: 新增 F-0117 scope-correction positive fixture 精确失败，既有 fixture 不得失败。

- [x] **Step 3: 做最小 GREEN**

在三套生产守卫增加固定常量与验证函数，复用既有 exact one-time pattern，但不得抽象或改变普通路径：

```powershell
New-Variable -Name p1F0117SmokeScopeCorrectionTaskId -Option Constant -Value "p1-f0117-smoke-scope-correction-guard-hotfix-2026-07-18"
New-Variable -Name p1F0117SmokeScopeCorrectionParentTaskId -Option Constant -Value "p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18"
New-Variable -Name p1F0117SmokeScopeCorrectionBaseSha -Option Constant -Value "3e3c400fe3cc7d41b476d9a5d37b1cc9c52f3e5a"
New-Variable -Name p1F0117SmokeScopeCorrectionBranch -Option Constant -Value "codex/f0117-smoke-scope-correction"
```

验证顺序必须是 context → exact staged/committed files → authorization uniqueness/fields/file set → exact state projection → exact queue projection → transition-only → single parent/topology → replay hard-block。任何一步失败均输出 F-0117 scope-correction 专属诊断，不退回 generic ancestor fallback。

- [x] **Step 4: 物化 state/queue exact projection**

仅应用 `Exact State Projection` 两处变化；不得更新 task status、execution gate、finding、capability、closeoutPolicy 或其他 allowlist。

- [x] **Step 5: 转 GREEN 并运行对抗矩阵**

Run:

```powershell
$scripts = @(
  "scripts/agent-system/Test-P1RemediationSerialProgram.ps1",
  "scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1",
  "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1",
  "scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1",
  "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1",
  "scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1"
)
foreach ($script in $scripts) {
  [void][System.Management.Automation.Language.Parser]::ParseFile(
    (Resolve-Path $script),
    [ref]$null,
    [ref]$null
  )
}
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
```

Expected: parser 6/6，三套完整 smoke exit 0；positive 仅在 exact transition-only context 通过，全部 negative hard-block。

- [x] **Step 6: 写脱敏 evidence/audit 并运行真实 staged candidate**

Evidence 必须记录 RED、GREEN、positive/negative matrix、exact projection、无产品 test 内容和无数据库动作；Audit 必须完成自审与独立复核 disposition。

Run:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase pre_commit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-redeem-code-nullable-deadline-2026-07-18
npm.cmd run format:check
git diff --check
```

Expected: P1 staged candidate 为 `approved_one_time`，Module 精确 12 files，P0/format/diff 全部 exit 0。

- [x] **Step 6A: 修复外部独立审查 finding**

以 missing state/queue 负例证明 candidate 识别盲区，随后仅改为专属 identity 命中并由 exact file-set 拦截缺失文件。清理改为三个系统 temp 短根、精确名称校验、最多 3 次重试、残留即 throw。pre-push committed file-set 校验前置于未放宽的 context 校验。

- [ ] **Step 7: 独立复核后创建单一治理提交**

只能精确 stage 12 个治理文件，不得使用 `git add .`：

```powershell
git commit -m "fix(governance): authorize F-0117 smoke scope correction"
```

提交必须是 base 的唯一单父子提交。随后由主线程 ff-only 合入 `master`、普通 push `origin/master`，确认 P1 pre-push 输出 `transition_only` 且 Module 输出 `exact_one_parent` 后清理 worktree/短分支。

## Stop Conditions

- 无法把治理提交限定为精确 12 文件；
- 需要在治理提交修改产品 smoke 内容或其他产品文件；
- 需要 wildcard、普通 ancestor fallback、standard mode 放行或 replay；
- 任一普通 `in_progress` SHA drift 不再 hard-block；
- 需要数据库、依赖、Provider、runtime/browser、P2、PR、force-push 或 deploy。
