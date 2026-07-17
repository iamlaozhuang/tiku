# P1 RC-02 员工创建原子性证据

日期：2026-07-16

任务：`p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

已读取 F-0115 ledger、post-P0 map、P1-RC-02 根因簇、标准/高级版需求入口、管理员运营 module/story、D05、CT-REQ-009/011/043/051/054、SC-ATOMICITY-IDEMPOTENCY，以及当前 employee account service、组织授权 runtime/repository、批量导入 UI 与聚焦测试。另读取 registration 的事务内幂等恢复作为相似实现：它依赖持久 session 事实和凭据复核，不能直接移植为无持久记录的员工随机初始密码恢复。

## Requirement Mapping Result

- `auth_user`、`auth_account`、`user`、`employee` 与 quota reservation 必须共同提交或共同回滚。
- 单建与批量导入均以明确目标 `organization` 为边界；缺省密码由服务端生成，只能在对应提交成功后进入一次性分发结果。
- 批量结果必须逐行可解释并脱敏；部分失败、异常、响应丢失与重放不得产生不可辨识的部分成功。
- 当前需求无冲突；若未知结果恢复必须新增持久 batch command、secret recovery 或 schema/migration，本任务按冻结 stop condition 停止，不以客户端缓存或派生密码伪造恢复。

## Transition Evidence

Result: pending

- 前序 F-0114 实现提交 `70bf9f8ab` 与 ready-for-closeout 提交 `8ee336aa4` 已 ff-only 合入 master。
- fresh-master 聚焦 6 文件 90/90、完整 unit 405 文件 2448/2448、lint、typecheck、format、build、P1/P0/Module 与真实 pre-push 均通过。
- local master、origin/master 与实时远端均为 `8ee336aa4f9a073b9456fc86bde641fc989f1123`；前序 worktree 与短分支已清理，既有 recovery stash 未触碰。
- 本 transition 只允许 state、queue、新 plan、新 evidence、新 audit 五份治理文件；产品源码与测试必须零 diff。
- 只有该治理提交通过 P1 `transition_only` 和 Module ancestor checkpoint 后才能开始 F-0115 产品复检；其他 `in_progress` SHA 漂移继续 hard-block。

## JIT Revalidation Result

Result: pass

F-0115 Verdict: `post_p0_core_covered_with_bounded_residual_and_stop_condition`

- P0 已移除原 credential adapter → employee repository 双事务：当前 repository 在一个 `database.transaction` 内依次写 `auth_user`、`auth_account`、`user`、`employee` 并预留 quota，任一步抛错均由同一事务回滚；旧事务拆分证据已 superseded。
- 当前批量 loop 只处理返回式 `ApiResponse`。第 N 行若抛异常，前 N-1 行已提交，但聚合结果和随机初始密码不会返回，形成可复现的静态 residual。
- HTTP 响应提交后断链仍无 request/batch key、持久结果或 secret recovery 事实；随机密码只在同步内存响应中存在。registration 相似实现之所以能恢复，依赖持久 session 行、幂等锁和凭据复核，证明不能靠 catch、客户端缓存或普通查询安全恢复本场景的一次性随机密码。
- transition 后只允许先用 RED 证明事务共同回滚和 batch throw 行为；若完整关闭仍要求持久 batch command/secret recovery，则触发 stop condition，不扩展 schema。

## Scope Freeze

Result: pass

冻结范围为当前 repository 单事务证明、批量第 N 行异常的逐行可解释结果、仅已提交行的一次性密码结果及对应 smoke tests。未知响应的持久恢复不在本任务授权内；不得以降低随机性、重复显示旧 secret、客户端缓存或把 auth/session 表挪作 batch 存储规避门禁。

## Validation Results

Result: pending

待 transition 推送后按 TDD 执行。

## Round 1

Result: pending

## Round 2

Result: pending

## Closeout Command Evidence

- `corepack pnpm@10.15.1 exec vitest run src/server/services/employee-account-service.test.ts src/server/repositories/admin-organization-org-auth-runtime-repository.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts --maxWorkers=1`
- `npm.cmd run test:unit -- --maxWorkers=1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-employee-creation-atomicity-2026-07-16 -SkipRemoteAheadCheck`
- `git diff --check`

Cost Calibration Gate remains blocked。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不并行物化下一产品任务。

nextModuleRunCandidate: `P1-RC-02 employee import confirmation and partial-result JIT revalidation (F-0116)`；仅为冻结 ledger 指针，不预先物化任务或声明结论。
