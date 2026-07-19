# P1 F-0117 Smoke Scope-Correction Closeout Lifecycle Hotfix Evidence

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked.

已完整读取 `AGENTS.md`、代码品味十诫、ADR-001 至 ADR-007、原 F-0117 smoke scope-correction authorization/plan/evidence/audit，以及 P1、Module pre-commit、Module pre-push 守卫和对应 smoke。

## Root-Cause Reproduction

Result: pass

- 真实同步状态：`master == origin/master == 71f150ceef0af54fca8d72db20a4254313630c7f`，旧 authorization identity 已存在于双方。
- RED：`Test-ModuleRunV2PrePushReadiness.Smoke.ps1` 在进入 disposable fixture 前即 exit 1，输出 `HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_CONTEXT_INVALID` 与 `HARD_BLOCK_P1_F0117_SMOKE_SCOPE_CORRECTION_REQUIRES_TRANSITION_ONLY`。
- 根因：旧 candidate 仅检查 master tree 是否含任一 identity 文件，没有检查 identity 是否在当前 push range 内首次物化，也没有检查 origin 是否仍停在批准 base。

## TDD Evidence

Result: pass

- RED 先新增同步 identity + 后续正常 closeout 子提交用例，并观察现有生产守卫失败。
- 首轮 GREEN 把 F-0117 context 的 generic transition 放得过宽，既有普通 `in_progress` unrelated drift 负例立即检出回归；该宽化已撤回。
- 最小 GREEN：旧 special candidate 仅在 identity 存在且 `origin/master` 仍是旧批准 base，或当前 push range 实际修改 identity 时成立。同步后的静态 identity 不再成立。
- 正常 F-0117 generic ancestry 仅在 task 为 `ready_for_closeout | done | closed` 时可选；普通 `in_progress` drift 继续 hard-block。
- 本 follow-up 自举限定为 base `71f150ce...`、branch、parent task、exact ten files、authorization uniqueness、transition-only、exact-one-parent、origin-at-base 与 replay hard-block。

## Validation Results

Result: pass

- PowerShell parser：6/6，exit 0。
- RED reproduction：exit 1，精确 lifecycle hijack findings 如上。
- 既有 ordinary `in_progress` drift 对抗负例：首轮过宽 GREEN 被检出，边界已收窄。
- Focused pre-push：59.7 秒，exit 0；输出 `F-0117 smoke scope closeout lifecycle focused pre-push smoke passed`。覆盖 standard-mode、exact authorization/file-set/single-parent、extra file、replay、synced identity closeout 与普通 `in_progress` transition hard-block。
- P1 full smoke：1043.6 秒，exit 0；`15 positive, 81 negative`。
- Module pre-commit full smoke：443.3 秒，exit 0；输出 `Module Run v2 pre-commit hardening smoke passed`。
- Module pre-push full smoke：360.5 秒，exit 0；输出旧 F-0117 smoke scope-correction 与新 lifecycle behavior 两个 pass marker。
- 真实 staged candidate：10/10 exact files；P1 pre-commit 输出 `approved_one_time`，Module 输出 `preCommitScopeMode: p1_f0117_smoke_scope_closeout_lifecycle_hotfix` 与 `filesToScan: 10`。
- Missing-audit negative：P1 与 Module 均 exit 1，分别输出专属 `P1_PROGRAM_...ALLOWLIST_MISMATCH` 与 `HARD_BLOCK_...ALLOWLIST_MISMATCH`。
- P1 manual：exit 0，`p1ProgramGuardResult: pass`。
- P0 global baseline：exit 0，`p0GlobalBaselineResult: pass`、`programStatus: closed`。
- `format:check` 首轮仅指出本任务 4 个新 Markdown；仅对这 4 个允许文件执行项目既有 Prettier 后复跑。
- 最终 `format:check`、`git diff --check`、`git diff --cached --check`：exit 0；PowerShell parser 复核 6/6。
- 最终 staged inventory：10 files；tracked unstaged 0，untracked 0；P1 与 Module pre-commit 复跑 exit 0。
- 未执行数据库或远端动作。

## Independent Review Remediation

Result: pass

- Review finding：首轮把共享 `$canUseGenericP1TransitionMasterAncestry` 的 task status 从 `in_progress` 扩为 closeout statuses，会让非 F-0117 closeout transition-only 候选获得 generic ancestor checkpoint。
- 有效 RED：disposable active task/state 均投影为不属于 F-0115/F-0116/F-0117 special context 的已关闭 P1-RC-01 task；现有实现错误通过，focused 38.8 秒 exit 1，精确失败为 `Expected command to fail with pattern: HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID`。
- 最小 GREEN：恢复共享 generic predicate 为 `taskStatus -eq in_progress`；新增 F-0117-specific closeout predicate，只在 `TaskId` 与 `stateCurrentTaskId` 均精确等于 F-0117 parent 的 no-special-candidate fallback 使用，并保留原 branch/head/state/origin ancestry/topology 条件。
- GREEN focused：38.3 秒，exit 0；`non_f0117_closeout_transition_only` 与 `f0117_in_progress_ordinary_drift` 两个负例均 hard-block，F-0117 synced closeout 正例继续通过。
- 根据主线程影响面要求，review 修正后先运行 focused、parser 与受影响短门禁；两项 Important 均关闭后，对最终 pre-push guard/smoke fresh 重跑完整 Module pre-push smoke。

## Split-Identity Review Remediation

Result: pass

- Review finding：F-0117-specific closeout predicate 曾依赖 `$isP1F0117TransitionContext` 的 OR 语义，只要 CLI `TaskId` 或 state `currentTask.id` 一侧为 F-0117，就可能取得 ancestor checkpoint。
- 有效 RED：新增 `TaskId=F-0117 / stateCurrentTaskId=非 F-0117` 负例；旧实现错误通过，focused 36.9 秒 exit 1，精确失败为 `Expected command to fail with pattern: HARD_BLOCK_P1_TRANSITION_ANCESTOR_CONTEXT_INVALID`。
- 最小 GREEN：predicate 直接同时要求 `TaskId` 与 `stateCurrentTaskId` 等于批准的 F-0117 parent，不再复用 OR context。
- GREEN focused：42.1 秒，exit 0；`f0117_task_non_f0117_state_mismatch`、`non_f0117_task_f0117_state_mismatch` 与 `f0117_in_progress_ordinary_drift` 均 hard-block。
- 已确认被中止的旧 full smoke 进程树无残留。
- GREEN 后短门禁：PowerShell parser 6/6、完整 `format:check`、working/cached diff check、P1 manual、P0 global baseline、P1 exact pre-commit 与 Module exact pre-commit 均 exit 0。

## Final Independent Review And Fresh Full Rerun

Result: pass

- 独立 reviewer 最终结论 Approved；Critical 0、Important 0、Minor 0。共享 generic 全局放宽和 F-0117 split-identity 两项 Important 均已关闭。
- 最终 Module pre-push full smoke：360.2 秒，exit 0；输出旧 F-0117 scope-correction、新 lifecycle behavior 与 `Module Run v2 pre-push readiness smoke passed` 三个 marker。
- 最终实现只让双重身份一致的 F-0117 closeout 使用专用 ancestor predicate；非 F-0117 closeout、普通 F-0117 `in_progress` drift、两种 split identity、standard mode、wrong topology/file set、extra file 与 replay 继续 hard-block。

## Scope Freeze

- 最终文件集严格为 authorization、plan、evidence、audit 与六个 P1/Module guard/smoke，共 10 文件。
- `project-state.yaml`、`task-queue.yaml`、产品、schema、migration、package、lockfile、Provider、runtime/browser、P2 均未修改。
- 无数据库连接/执行，无 commit、merge、push、PR、force-push 或 deploy。
