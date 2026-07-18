# P1 RC-02 员工导入服务端预检证据

日期：2026-07-17

任务：`p1-remediation-rc-02-employee-import-preflight-2026-07-17`

## Reading Evidence

status: complete
conflictsFound: false
targetSourceReviewed: true
targetTestsReviewed: true
analogousImplementationReviewed: true

已完整读取标准/高级需求入口、管理员运营 module/story、edition-aware authorization、ADR-007、ops UI/UX contract、D05/G03、相关 CT-REQ 行、2026-07-07 UI/UX source entry/baseline/batch 0/batch 1，以及 F-0116 ledger、post-P0 map、F-0115 evidence/audit 和当前 command/UI/parser/repository/test anchors。

## Requirement Mapping Result

Result: pass

F-0116 映射到员工单建入口、服务端逐行导入预检、授权/quota 可解释性与 confirm 前 JIT freshness；F-0115 原子 command、幂等和 secret distribution 作为已关闭前置能力复用，不重开。

## JIT Revalidation Result

Result: pass

当前源码仍由浏览器解析 CSV/TSV 并只做聚合 quota 估算，且页面仍无单建入口；服务端 preview revision 不存在。因此 F-0116 residual 在 `f466caa81` 基线继续成立，方案 A 的最小范围未被后续提交 supersede。

## Root-Cause Reproduction

Result: pass

- F-0115 已实现 `single_create | batch_import` 原子 command、逐行终态、幂等恢复和 revision-bound 密码分发，原子执行根因不得重开。
- 当前员工工具栏仍只有“批量导入员工”，单建 command 没有可发现 UI 入口。
- 当前页面函数 `parseEmployeeImportDelimitedRows` 在浏览器生成 rows；preview 只读取页面已加载 `orgAuths` 做聚合行数/quota 估算，不查询逐行账号、绑定、disabled、跨域或当前授权事实。
- command collection POST 直接写入，不存在 review-before-confirm 的 server preview revision。因此前端预览与最终服务端事实仍可分叉，F-0116 residual 成立。

## TDD Evidence

Result: pending_spec_review

用户已批准方案 A：统一服务端 parser + 单建/批量逐行 preflight + preview revision + 确认时 JIT 复检。按 brainstorming 门禁，已先写规格；用户书面复核和 implementation plan 完成前不得创建产品 RED。

## Scope Freeze

Result: pass

- 设计阶段精确 6 文件：state、queue、design task plan、evidence、audit、design spec。
- 产品阶段预期只触及 queue 中冻结的 employee import command contract/validator/parser/repository/service/route、admin UI/client/hooks/components 和聚焦 tests。
- schema/migration/dependency/database/provider/runtime/browser/P2/PR/force-push/deploy 均未授权。

## Transition Evidence

Result: pending

- base/master/origin：`f466caa81260686d5a2fbcbf62ba08717bf56a82`。
- 前序 F-0115 产品提交、ready transition、普通 push、worktree 和短分支清理已完成；机制小修 `ce6aef7b3` 已通过 transition-only/exact-one-parent 并远端同步。
- F-0116 designPath 守卫热修 `f466caa81` 已以精确十文件通过 P1 `transition_only` 与 Module `exact_one_parent` 并远端同步；只有该治理提交使用 ancestor checkpoint，其他 `in_progress` SHA 漂移继续 hard-block。
- 本 transition 必须只包含上述 6 文件并通过 P1 `transition_only` 与 Module ancestor checkpoint。

## Validation Results

Result: pending

## Round 1

Result: pending

## Round 2

Result: pending

## Closeout Command Evidence

- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase pre_commit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-import-preflight-2026-07-17`

Cost Calibration Gate remains blocked。

threadRolloverGate: `continue_current_thread`。保持 WIP=1。
