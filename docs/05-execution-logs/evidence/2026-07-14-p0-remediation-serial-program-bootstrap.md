# P0 Remediation Serial Program Bootstrap Evidence

Date: 2026-07-14

Task ID: `p0-remediation-serial-program-bootstrap-2026-07-14`

Branch: `codex/p0-remediation-startup-v1`

Task kind: `mechanism_hardening`

validationStatus: pass

reviewStatus: pass

deploymentExecuted: false

## Summary

本任务关闭 P0 整改启动包并把用户批准的 RC-01 至 RC-08 WIP=1 串行方案物化为 Program、授权、state/queue、
双 hook Guard 和恢复入口。产品源码、产品测试、依赖、schema/migration、runtime acceptance 与只读审计仓库均不在
本任务变更范围。

## Requirement Mapping Result

- `docs/01-requirements/00-index.md` 仍是产品需求入口；本任务不新增或改写产品行为。
- P0 finding、根因簇、验收契约和 P1/P2 影响映射由启动包与 ledger 持有。
- 当前用户明确批准的串行执行、commit、ff-only merge、`origin/master` push 和清理边界已物化到 standing
  authorization 与 bootstrap task `closeoutPolicy`。
- 依赖、schema/migration、数据库、runtime/browser/e2e、Provider、secret/env、PR、force push 和部署仍需要 fresh
  approval；21 项 runtime validation 明确排除在本 Program 外。

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已读：`AGENTS.md`、品味十诫、ADR-001 至 ADR-007、standard/advanced requirement index、
`edition-aware-authorization-requirements.md`、requirement SSOT SOP、task lifecycle、standing autonomy、Lean Module Run
v3、mechanism tuning、dependency gate、现有 Content Admin Platform Program/Guard/smoke、Module Run hardening、
state/queue、启动包四文件与只读审计基线。

## TDD RED Evidence

1. Content Admin Platform closed Program successor coexistence：smoke 退出码 1，命中
   `PROGRAM_GUARD_TOP_LEVEL_CURRENT_TASK_MISMATCH` 与
   `PROGRAM_GUARD_TOP_LEVEL_CURRENT_TASK_STATUS_MISMATCH`。
2. Recovery successor coexistence：smoke 退出码 1，命中
   `RECOVERY_SURFACE_TOP_LEVEL_BLOAT`、`CURRENT_TASK_RECORD_INVALID`、`ACTIVE_TASKS_INVALID` 与
   `STANDING_AUTHORIZATION_MISMATCH`。
3. P0 Program Guard：smoke 退出码 1，明确报告 `Test-P0RemediationSerialProgram.ps1` 不存在。
4. approval-gated capability：把 `schemaMigration` 改为 approved 但不给 fresh approval source 时，旧 Guard 负例
   意外通过；补强后命中 `P0_PROGRAM_FRESH_APPROVAL_SOURCE_MISSING`。
5. queue-only WIP：只把下一 task 的 queue status 改为 `in_progress` 时，旧 Guard 负例意外通过；补强后命中
   `P0_PROGRAM_NEXT_TASK_STATUS_INVALID`。
6. hook fail-fast：`git show HEAD:.husky/pre-commit` 检查退出码 1，报告
   `HOOK_FAIL_FAST_MISSING pre-commit baseline`。

这些 RED 分别证明：关闭历史 Program 错误占用全局活动指针；recovery surface 不允许后继 Program；P0 顺序/WIP/
scope/approval 没有机器门禁。

## TDD GREEN Evidence

- Content Admin Platform serial smoke：`3 positive, 13 negative`，退出码 0。
- Content Admin Platform recovery smoke：`5 positive, 7 negative`，退出码 0。
- P0 Program Guard smoke：`2 positive, 9 negative`，退出码 0。
- pre-commit/pre-push 均物化 `set -e`，Git sh 语法检查退出码 0。

## Changed Files

- 启动包：plan、main package、finding ledger、evidence。
- Program：standing authorization、serial plan、bootstrap plan/evidence/audit、project state、task queue。
- Guard：Content Admin Platform serial/recovery script 与 smoke 的关闭 Program 兼容；新增 P0 Program Guard 与 smoke。
- Hooks：pre-commit/pre-push 增加 P0 Program Guard。

精确文件集合必须与 queue `allowedFiles` 一致；最终以 `git diff --name-only` 复核。

## Approval Boundary

- consumed: 当前用户批准的 P0 串行 Goal 本地 closeout 授权。
- blocked: dependency、schema/migration、database、runtime acceptance、browser/e2e、Provider、secret/env、PR、force
  push、deploy/staging/prod/cloud、P1/P2 implementation。
- audit repository: read-only。

## Validation Results

| Gate                                  | Result                                                                                                             |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Content Admin Platform serial smoke   | pass；3 positive / 13 negative                                                                                     |
| Content Admin Platform recovery smoke | pass；5 positive / 7 negative                                                                                      |
| P0 Program smoke                      | pass；2 positive / 9 negative                                                                                      |
| closed historical Program guard       | pass_closed_program                                                                                                |
| historical recovery guard             | pass                                                                                                               |
| active P0 Program guard               | pass；current=bootstrap，next=RC-01                                                                                |
| Module Run v2 pre-commit hardening    | pass；19 个 changed files 全部命中 allowlist                                                                       |
| Module Run v2 module closeout         | pass                                                                                                               |
| Module Run v2 pre-push readiness      | pass；提交前使用 `-SkipRemoteAheadCheck`                                                                           |
| P0/P1/P2/runtime consistency          | pass；35 unique P0；30 confirmed / 5 root_cause_alias；8 clusters；143 unique P1/P2；21 pending runtime            |
| YAML parse                            | pass；project-state、task-queue、finding ledger                                                                    |
| hook fail-fast and sh syntax          | pass                                                                                                               |
| scoped Prettier write/check           | pass；11 个 Markdown/YAML 文件                                                                                     |
| `git diff --check`                    | pass                                                                                                               |
| product/dependency/schema diff        | zero                                                                                                               |
| source baseline                       | master/origin/live remote 均为 `7aac83765ca4b650b73b1612013e26a0111775ae`；root clean                              |
| audit baseline                        | HEAD `a84224fa12ec85b28e6acd945deba2afa28c6c02`；tree `668acf31e8579410b9969c1370f2405485b8fdd4`；clean；fsck pass |
| audit finding register SHA-256        | `CDB8CE059566ABEDDA3D4C723E3F048ECFA677697053FB7765D6EF46273752F2`                                                 |

staged hooks 和 fresh checkout recovery 在提交/closeout 阶段运行；最终 SHA/merge/push/cleanup 按 Post-Closeout SHA
Rule 记录在最终 handoff，不创建自指 evidence 提交。

## Validation Command Accounting

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformRecoverySurface.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformSerialProgram.Smoke.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.Smoke.ps1
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformRecoverySurface.ps1 -RepositoryRoot .
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ContentAdminPlatformSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-P0RemediationSerialProgram.ps1 -Phase manual
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p0-remediation-serial-program-bootstrap-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p0-remediation-serial-program-bootstrap-2026-07-14
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p0-remediation-serial-program-bootstrap-2026-07-14 -SkipRemoteAheadCheck
```

Cost Calibration Gate remains blocked.

threadRolloverGate: continue_same_goal_after_bootstrap_closeout

nextModuleRunCandidate: `p0-remediation-rc-01-identity-session-admin-account-2026-07-14`

## Round 1 — Root Cause And Diff Review

result: pass

- 旧 Program 并未禁用：其 order、completed、checkpoint、artifact 和 deployment 继续由原 Guard 验证；仅在 closed
  后释放全局 `currentTask`/`activeTasks` 所有权。
- P0 Guard 从 serial plan 获取 canonical order，阻断重排、跳 task、多 WIP、queue-only WIP、前序 closeout 不完整、
  制品缺失和 scope 越界。
- 对抗复核发现 approval-gated capability 缺 fresh source 和 hook 不 fail-fast 两处缺口，均已补测试/门禁。

## Round 2 — Approval, Regression And Recovery Review

result: pass

- closeout 仅允许 `master`/`origin/master`；PR、force push、部署、runtime acceptance、P1/P2 implementation 保持 blocked。
- dependency/schema/database/Provider 若不为 blocked，必须引用存在且含明确批准证据的 fresh approval source。
- 产品源码/测试/依赖/schema 零 diff；审计仓库 HEAD/tree/status/hash 保持基线。
- 恢复链已收敛为 state -> queue -> serial plan -> current plan/evidence/audit -> startup package/ledger；下一 task
  只能是 RC-01。

## Redaction Check

- secret/env: not read, not recorded
- token/cookie/Authorization header/database URL: not read, not recorded
- private row/public identifier inventory: not read, not recorded
- Provider payload/raw prompt/raw answer: not used
- generated fixture: smoke only, temporary directory removed

## Blocked Work

- 没有进入 RC-01 产品实现。
- 没有执行 21 项 runtime validation。
- 没有修改依赖、schema/migration、数据库、Provider 或外部配置。
- 没有修改 `D:/tiku-readonly-audit`。

## Recovery Handoff

恢复顺序：`project-state.yaml` -> `task-queue.yaml` -> P0 serial plan -> 当前 task plan -> 本 evidence/audit -> 启动包/
ledger。当前 task 完成实际 closeout 后，下一 task 在其投影中把 bootstrap checkpoint 记为 pass/closed，再将 RC-01
设为唯一 `in_progress`。

## Residual Risk

Program bootstrap 只证明治理顺序和静态恢复门禁；不证明任何 P0 产品缺陷已修复或业务 runtime 验收通过。
