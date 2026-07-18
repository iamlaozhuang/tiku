# P1 F-0116 Scope-Correction Guard Hotfix Evidence

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

Cost Calibration Gate remains blocked.

已读取 F-0116 product plan/evidence/audit、真实 pre-commit 失败、F-0132/F-0115 scope-correction 与 F-0116 designPath exact-hotfix 正负 fixture。

## Root-Cause Reproduction

Result: pass

F-0116 产品变更与已批准的 queue allowlist correction 同时 staged 时，真实 P1 pre-commit 报 `P1_PROGRAM_SCOPE_CHANGED_OUTSIDE_TASK_TRANSITION` 与 `P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE`。根因是当前守卫没有 F-0116 smoke scope-correction 的一次性治理通道；恢复旧 rows transport 或绕过 hook 均不允许。

## TDD Evidence

Result: pass

- RED：三套 smoke 先要求 F-0116 exact scope-correction markers，原守卫均缺失并失败。
- GREEN：P1/pre-commit/pre-push 仅在固定 base、固定 parent task、精确 12 文件、完整 state/queue 投影、fresh authorization、两轮 review 与单父提交拓扑成立时放行。
- 对抗 fixture：错误分支、缺文件、额外 queue delta、standard pre-push、二次 replay 均 hard-block；错误 task 现在返回明确 context failure，不再泄漏空参数绑定错误。

## Validation Results

Result: pass

- PowerShell Parser：6/6 pass。
- `Test-P1RemediationSerialProgram.Smoke.ps1`：15 positive、81 negative，pass。
- `Test-ModuleRunV2PreCommitHardening.Smoke.ps1`：pass。
- `Test-ModuleRunV2PrePushReadiness.Smoke.ps1`：pass。
- 真实 staged candidate P1 pre-commit：`approved_one_time`、`p1ProgramGuardResult: pass`。
- 真实 staged candidate Module pre-commit：12 files、`approved_one_time`、`pre-commit hardening passed`。
- `git diff --check`：pass。

## Round 1

Result: pass

自审确认通道只识别固定 F-0116 治理提交；未授权文件、普通 in_progress SHA 漂移、非单父拓扑和非 transition-only 推送仍失败。

## Round 2

Result: pass

独立只读复核结论 `APPROVE`：精确 12 文件、parent 全文投影、固定 F-0116 context、transition-only、exact-one-parent、standard/replay hard-block 与禁止范围均成立；Critical/Important/Minor 均无。

## Security and Boundary Result

Result: pass

未新增依赖，未触及 schema/migration/database/provider/runtime/browser/P2/PR/force-push/deploy；未降低 P1、Module Run v2、P0、ContentAdmin 或敏感信息门禁。
