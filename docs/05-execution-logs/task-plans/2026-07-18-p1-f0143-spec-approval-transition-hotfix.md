# P1 F-0143 Spec Approval Transition Hotfix Plan

日期：2026-07-18

任务：`p1-f0143-spec-approval-transition-hotfix-2026-07-18`

父任务：`p1-remediation-rc-02-employee-personal-ai-context-2026-07-18`

基线：`0fe8edae7a7efc00154f5c54227623be55796983`

分支：`codex/p1-f0143-spec-approval-transition-hotfix`

## Goal

以一个单父、一次性、可审计治理提交，将 F-0143 已获当前用户书面批准的 `currentExecutionGate` 从 `waiting_for_spec_review` 精确物化为 `satisfied`；不修改产品代码或产品实施计划，并保持所有普通 `in_progress` SHA drift hard-block。

## Architecture

沿用已验证的 F-0117 exact-hotfix 模式，在 P1 pre-commit/pre-push、Module pre-commit/pre-push 中增加固定父任务、固定 base、固定分支、精确 12 文件、精确 state/queue projection、未物化授权、单父拓扑与授权字段唯一性合同。P1 仅在 exact candidate 成立时输出 `transition_only`；Module pre-push 仅在 `transition_only` 且治理提交为 base 唯一直接子提交时接受 ancestor checkpoint。`.husky/pre-push` 现有编排已经消费 P1 输出的 `transition_only`，保持不变。

## Tech Stack

PowerShell 7/Windows PowerShell、Git disposable fixtures、P1 serial guard、Module Run v2 pre-commit/pre-push guards。

## Global Constraints

- 用户授权原文：一次性 F-0143 spec-approval transition 治理热修，仅限 P1/Module 守卫、对应 smoke、精确状态及 evidence/audit；仅 transition-only 通过后允许 ancestor checkpoint，其他 in_progress SHA 漂移继续 hard-block。
- WIP 仍为 F-0143 产品父任务；本热修不是第二个产品任务，不改变 finding、task status、execution stage、产品 allowlist、capability 或 closeout policy。
- exact base 固定为 `0fe8edae7a7efc00154f5c54227623be55796983`；branch 固定为 `codex/p1-f0143-spec-approval-transition-hotfix`；治理提交必须恰好一个 parent、一个 commit。
- exact 12-file allowlist 之外任何文件 hard-block；尤其禁止修改 `.husky/pre-push`、F-0143 产品 implementation plan、`src/**`、`tests/**`、schema/migration、依赖/lockfile、env、Provider/runtime/P2/PR/force-push/deploy。
- authorization 文档的标量键必须各出现一次且值精确匹配；Exact Files 必须按 canonical 顺序逐项相等，不得通过排序/去重掩盖重复。
- standard pre-push、wrong branch/base/task/projection、missing/altered/duplicate authorization、extra/product file、partial stage、replay/multi-commit 和任何 unrelated `in_progress` drift 均 fail closed。
- 先写 smoke 并确认 RED，再写最小 guard 实现；禁止先改生产 guard 后补测试。
- 由一个独立实现 Subagent 完成 RED→GREEN；主线程逐文件复核；另一个独立 reviewer 做 spec+quality review；最终 whole-diff review 仍独立。
- 任务只创建一个治理提交；review、evidence、audit 与全部验证完成前禁止提交、合入或推送。

## Exact Files

1. `docs/04-agent-system/state/project-state.yaml`
2. `docs/04-agent-system/state/task-queue.yaml`
3. `docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-spec-approval-transition-hotfix-authorization.md`
4. `docs/05-execution-logs/task-plans/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md`
5. `docs/05-execution-logs/evidence/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md`
6. `docs/05-execution-logs/audits-reviews/2026-07-18-p1-f0143-spec-approval-transition-hotfix.md`
7. `scripts/agent-system/Test-P1RemediationSerialProgram.ps1`
8. `scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1`
9. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
10. `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
11. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1`
12. `scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1`

## Exact Projection

F-0143 state 与 queue 的 `currentExecutionGate` 必须且只能改为：

```yaml
currentExecutionGate:
  status: satisfied
  reason: current_user_approved_written_f0143_spec_2026_07_18
  approvalRequestPath: docs/superpowers/specs/2026-07-18-employee-personal-ai-selected-context-design.md
  resumeAction: execute_f0143_employee_personal_ai_selected_context_plan_red_to_green
```

state 的三个 repository checkpoint 必须且只能从 `4f63c3c17731cbc686bb234b89a64c31f36ab03b` 同步为 exact hotfix base `0fe8edae7a7efc00154f5c54227623be55796983`。不得修改 `updatedAt`、task status、WIP、产品 allowlist、capabilities 或其他 state/queue 字段。

## Stable Contract Names

```powershell
$p1F0143SpecApprovalTransitionHotfixTaskId = "p1-f0143-spec-approval-transition-hotfix-2026-07-18"
$p1F0143SpecApprovalTransitionHotfixParentTaskId = "p1-remediation-rc-02-employee-personal-ai-context-2026-07-18"
$p1F0143SpecApprovalTransitionHotfixBaseSha = "0fe8edae7a7efc00154f5c54227623be55796983"
$p1F0143SpecApprovalTransitionHotfixBranch = "codex/p1-f0143-spec-approval-transition-hotfix"
$p1F0143SpecApprovalTransitionHotfixAuthorizationPath = "docs/05-execution-logs/acceptance/2026-07-18-p1-f0143-spec-approval-transition-hotfix-authorization.md"
$p1F0143SpecApprovalTransitionHotfixHumanApprovalSource = "current user message approving one-time F-0143 spec-approval transition governance hotfix limited to P1/Module guards, corresponding smoke, exact state and evidence/audit; ancestor checkpoint only after transition-only guard passes; other in_progress SHA drift remains hard-blocked on 2026-07-18"
$p1F0143SpecApprovalTransitionHotfixStandingAuthorizationSource = "docs/05-execution-logs/acceptance/2026-07-16-p1-remediation-program-authorization.md"
```

P1/Module diagnostics and success markers use the exact `F0143_SPEC_APPROVAL_TRANSITION_HOTFIX` / `p1F0143SpecApprovalTransitionHotfixAuthorization: approved_one_time` names；Module pre-push success additionally emits `p1F0143SpecApprovalTransitionHotfixTransitionTopology: exact_one_parent`。

---

### Task 1: Exact F-0143 Transition Hotfix RED→GREEN And Closeout

**Produces:** 一个完整、可提交的 exact 12-file transition hotfix；同一独立实现 Subagent 必须完成下面三阶段，禁止把 RED smoke 与对应 production guard 分给不同实现者。

#### Phase A: RED Smoke Contract

**Files:** three `*.Smoke.ps1` files only。

- [ ] Add exact F-0143 marker assertions and disposable Git fixtures by copying the full F-0117 behavior pattern, substituting only the Stable Contract values and Exact Projection。
- [ ] Cover exact positive plus wrong branch/base/task/gate、altered/duplicate authorization scalars、duplicate/reordered Exact Files、missing authorization、extra/product file、partial stage、standard mode、replay/multi-commit and unrelated drift。
- [ ] Run each affected smoke and record RED caused specifically by missing F-0143 production guard symbols/behavior, not syntax or fixture setup。

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
```

Expected: all three fail with missing F-0143 exact contract/behavior；existing F-0117 behavior remains unchanged。

#### Phase B: Minimal Guard GREEN

**Files:** three production `*.ps1` guards plus state/queue and authorization doc。

- [ ] Copy the complete F-0117 one-time candidate/file-set/anchor/topology pattern and substitute only F-0143 exact constants/projection/diagnostics。
- [ ] Preserve authorization scalar uniqueness and ordered Exact Files comparison in P1、Module pre-commit、Module pre-push。
- [ ] Make P1 emit `transition_only` only for the exact 12-file candidate；make Module pre-push accept ancestor only when explicit mode + exact-one-parent topology both pass。
- [ ] Apply the Exact Projection and create authorization doc with all 12 canonical files。
- [ ] Run the three smoke scripts to GREEN；if any generic path must be loosened, stop。

Expected: all existing and new positive/negative matrices pass；no F-0117 semantic change。

#### Phase C: Evidence, Review and Closeout

**Files:** current task plan/evidence/audit plus exact existing files；no new scope。

- [ ] Run PowerShell parser for all six scripts, `git diff --check`, format check, P1 manual, P0, Module pre-commit and a committed disposable Module pre-push transition-only topology。
- [ ] Record exact RED/GREEN output, elapsed time, positive/negative counts, secret/placeholder scan, 12-file inventory and unchanged product worktree status in evidence。
- [ ] Main-thread Round 1 attacks projection exactness, authorization uniqueness, replay, standard mode, ancestor topology, ordinary drift and scope boundaries。
- [ ] Independent Round 2 reviews the whole diff from this plan and authorization, then all Critical/Important findings are fixed and re-reviewed。
- [ ] Stage exact 12 files, inspect cached diff, run real pre-commit, create one commit `fix(governance): authorize F-0143 spec transition`。
- [ ] From clean `master`, ff-only merge the one commit, run real pre-push, ordinary push `origin/master`, verify remote equality, then remove only the merged hotfix worktree/branch。
- [ ] Rebuild/rebase the F-0143 product worktree on the new master while preserving its sole implementation-plan file, then resume the approved product plan RED→GREEN。

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual -SkipExternalIntegrityChecks
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-f0143-spec-approval-transition-hotfix-2026-07-18
npm.cmd run format:check
git diff --check
```

## Stop Conditions

- exact 12-file、single-parent、single-commit、fixed-base path 无法表达，必须 wildcard、generic fallback 或修改 `.husky/pre-push`；
- 普通 `in_progress` SHA drift、standard mode、wrong authorization、extra/product file 中任一可通过；
- 需要修改产品、schema/migration、package/lockfile、env 或执行 database/Provider/browser/runtime/P2/PR/force/deploy；
- state/queue 无法通过唯一 anchor 精确投影，或需要改变 task status、WIP、产品 allowlist/capabilities；
- 产品 worktree 除 approved implementation plan 外出现额外变化。

## Self-Review

- [x] 用户授权的范围、ancestor 条件和普通 drift hard-block 均被逐字映射。
- [x] 生产修改与 smoke 修改各自先 RED 后 GREEN；没有 marker-only 代替行为 fixture。
- [x] Exact Files、projection、contract names、branch/base/parent/task 均无 placeholder。
- [x] `.husky/pre-push`、产品 implementation plan 与所有 blocked domains 均在 allowlist 外。
- [x] 单治理提交、ff-only/push/cleanup 和产品恢复顺序明确。

## Round 2 Important 修复计划（2026-07-19）

已重新读取 `AGENTS.md`、代码品味十诫、ADR-001 至 ADR-007，并逐项核对独立 Round 2 的两项 Important。技术根因确认如下：

1. F-0143 专用身份比较仍有 PowerShell 默认大小写不敏感的 `-eq`/`-ne`/`-in` 与 `(?i)` authorization regex，因此仅改变 branch、task/status、固定 SHA、授权路径或授权标量键值大小写可能被当作 exact identity。
2. P1 与 Module pre-commit 的 F-0143 scope 主要由 name-only 集合判断，未在专用 anchors 内验证 staged name-status；P1 pre-push 也未直接验证当前唯一提交的 name-status。删除或 rename 可保留相同 name-only 身份表面，却违反“exact 12 files 均为 A/M”的治理提交语义。

修复顺序：

- 先在既有 pre-commit/pre-push disposable smoke 增加仅大小写变化，以及额外 tracked 删除、exact 路径删除和 rename 的对抗用例；用旧 production guard 取得聚焦 RED。
- 仅在 F-0143 专用合同路径把身份比较改为 ordinal case-sensitive，authorization scalar key/value 改为逐行唯一且 case-sensitive；不修改 F-0117 或 generic helper。
- P1 pre-commit 与 Module pre-commit 直接解析 staged `--name-status --no-renames --diff-filter=ACMRTD`，P1 pre-push 直接解析当前 `HEAD` 的 `diff-tree --name-status --no-renames`；只接受 A/M 且路径集合精确等于 12，否则输出 F-0143 专用 `FILE_SET_INVALID`。
- Module pre-push 保留既有 A/M topology，并把 F-0143 身份、标量与 context 比较收紧为 case-sensitive。
- GREEN 后运行新增聚焦 fixture、六脚本 parser、`git diff --check`、format、P1 manual、P0 和精确 12 文件 inventory；独立 Round 2 仍保持 pending，禁止自批通过。

风险防御：候选识别可在 exact scope 不成立时执行 F-0143 anchors 以产生专用 FILE_SET_INVALID，但 allowedFiles/blockedFiles 例外仍只绑定 complete exact scope；因此额外/product/partial 候选不能借此进入 transition-only。禁止新增文件、依赖、`.husky/pre-push`、产品修改、stage/commit/merge/push。

## Round 3 Important 修复计划（2026-07-19）

独立复审确认 Module pre-push 的 F-0143 外层路由错误地使用 case-sensitive identity：当 CLI `TaskId` 与 state `currentTaskId` 同时仅改变大小写时，专用 context 变为 false，随后 generic transition ancestor 使用 PowerShell 默认大小写不敏感比较而错误接受。专用 topology 内部的 `-cne` 已能严格拒绝该身份，缺口仅在外层路由。

修复顺序：

- 先在 F-0143 disposable pre-push fixture 增加真实行为用例：同时改变 CLI `TaskId` 与 state `currentTaskId` 大小写并传入 `transition_only`；旧 production 必须复现 generic ancestor 错误接受的 RED。
- 仅把 `$isP1F0143TransitionContext` 的两项路由比较明确改为 `-ieq`，保证大小写变体仍进入 F-0143 专用分支；`Test-P1F0143SpecApprovalTransitionHotfixTransitionTopology` 内所有 identity 比较继续保持 `-cne`。
- GREEN 必须出现 `HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID`，且输出不得包含 generic ancestor OK；随后运行 affected parser、`git diff --check` 与聚焦 fixture。
- evidence 记录 RED/GREEN；audit Round 2/3 继续保持 pending，禁止自批通过；不新增文件，不 stage/commit/push。

## Round 4 Fixture 静态断言修复计划（2026-07-19）

完整 Module pre-commit smoke 在进入行为 fixture 前稳定失败。根因是 F-0143 common patterns、P1 专用 `P1_PROGRAM_*_FILE_SET_INVALID` 与 Module 专用 `HARD_BLOCK_*_FILE_SET_INVALID` 被放入同一数组，并统一只在 Module guard 文本中查找；P1 marker 不属于该 source，因此静态断言必然 RED。

修复顺序：

- 保留 F-0143 common patterns 仅在 Module guard source 中校验。
- 提前加载 `$p1GuardText`，将 P1 与 Module 的 `FILE_SET_INVALID` marker 分别对各自 source 做唯一的 source-specific 静态断言；不改变 production guard 或其余 fixture。
- 使用当前完整 smoke 的 `P1_PROGRAM_*` 静态失败记录 RED；修复后重跑同一完整 Module pre-commit smoke，必须越过静态 marker 并最终 GREEN。
- 更新 evidence/audit 且保持 reviewer pending；运行 affected parser、`git diff --check`，维持 exact 12 文件、空暂存区和禁止 stage/commit/push。

## Round 5 F-0143 缺失快照文件安全读取计划（2026-07-19）

完整 Module pre-commit 在越过 Round 4 静态断言后，以及独立完整 Module pre-push，均在 F-0143 missing-authorization 用例被 native `git show` fatal/`ErrorActionPreference=Stop` 提前中断，未能聚合既有专用 `FILE_SET_INVALID` finding。pre-commit 复现为 index 中路径不存在，pre-push 复现为 HEAD 中路径不存在；通用 `Get-GitSnapshotFileText` 的 stderr 重定向不能阻止 native error record。

修复顺序：

- 不修改 generic helper 或 F-0117；新增 F-0143-only snapshot reader。
- INDEX 读取前用 `git ls-files --cached -- path`、HEAD 读取前用 `git ls-tree -r --name-only HEAD -- path` 做 exact case-sensitive 存在性检查；不存在或检查失败直接返回空串，禁止调用 `git show`。
- 仅将 F-0143 authorization/evidence/audit 三处读取切换到安全 reader，使既有 name-status、authorization 与 review findings 正常聚合，不放宽 smoke 期待。
- 先以真实 disposable pre-commit/pre-push missing-authorization native fatal 作为 RED；修复后跑完整 Module pre-commit 与完整 Module pre-push 至 GREEN，并更新 evidence/audit、parser、`git diff --check`，保持 reviewer pending 和禁止 stage/commit/push。
