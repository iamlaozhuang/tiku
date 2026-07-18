# F-0115 closeout 守卫治理热修证据

日期：2026-07-17

任务：`p1-f0115-closeout-guard-hotfix-2026-07-17`

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true
Cost Calibration Gate remains blocked。

## Root-Cause Reproduction

Result: pass

- 固定 base：`66a9f526d68c2647a5843da1a9d9c2fe0933cc93`；分支：`codex/p1-f0115-closeout-guard-hotfix`。
- F-0115 产品提交 `cdbc7c03d5f3a0a1148f8f18ba6ab56fb12ef5d3` 后，仅暂存 `project-state.yaml` 与 `task-queue.yaml` 的四处 `in_progress` → `ready_for_closeout`，P1 manual 在 `Test-P1RemediationSerialProgram.ps1:1871` 异常退出：`Cannot bind argument to parameter 'Lines' because it is an empty string.`
- 根因是 `Get-NormalizedCloseoutProjection` 的 mandatory `string[] Lines` 未允许合法空字符串元素；`task-queue.yaml` 内已有空行，参数绑定发生在投影比较之前。
- 产品状态变更随即撤销，产品提交和工作树保持干净；未通过删空行、跳过门禁或放宽投影比较规避失败。

## TDD Evidence

Result: pass

- P1 same-task pre-commit fixture 在 parent/current queue 同位置保留合法空行；旧参数合同会在投影函数绑定阶段 RED。
- GREEN 仅为 `Lines` 添加 `[AllowEmptyString()]`，没有过滤、删除或归一化空行；函数仍只归一化目标 TaskId 的两处 `in_progress|ready_for_closeout` 状态。
- 同 fixture 随后增加额外 allowlist 文件仍被 `P1_PROGRAM_CLOSEOUT_PROJECTION_CHANGED` hard-block；pre-push fixture 继续覆盖 tip/range projection laundering。
- 一次性治理路径固定 base、branch、单 parent 与精确 10 文件；authorization 必须首次物化，review artifact 必须唯一 pass/APPROVE。
- 普通 `in_progress` SHA 漂移、额外提交、额外文件、错误父提交、重复授权与矛盾 evidence/audit 继续 hard-block。

## Validation Results

Result: pass

- Windows PowerShell parser：6 个修改脚本全部通过。
- `Test-P1RemediationSerialProgram.Smoke.ps1`：12 positive / 77 negative 通过，`544.6s`。
- `Test-ModuleRunV2PreCommitHardening.Smoke.ps1`：通过，`221.3s` 并行批次内完成。
- `Test-ModuleRunV2PrePushReadiness.Smoke.ps1`：通过，`94.7s`。
- 第一轮独立只读质量复核：APPROVE，Critical/Important/Minor 均为 0；确认空行修复最小且 closeout laundering 仍 hard-block。
- 第二轮独立只读安全/治理复核：APPROVE，Critical/Important/Minor 均为 0；确认 transition-only、固定单父、精确文件集、一次性授权及其他 SHA 漂移 hard-block 未退化。
- `git diff --check`：通过。
- 修改面严格限定 10 个授权治理文件；未修改 state/queue、hook、产品源码、依赖、schema/migration、数据库、Provider、runtime/browser、P2、PR、force-push 或 deployment。
