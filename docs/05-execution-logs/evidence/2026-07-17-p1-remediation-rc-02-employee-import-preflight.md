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

Result: pass

用户已批准方案 A，并于 2026-07-18 书面回复“批准规格”。实现严格从合同/validator RED 开始，依次覆盖 parser、repository、service、route/adapters、client/hook 和 panels/page。对抗审查新增的敏感内存保留、preview 竞态、未来授权 quota 预留、陈旧确认、文件读取竞态与 501 行早停问题均先观察到 RED，再完成最小修复并转 GREEN。

## Scope Freeze

Result: pass

- 设计阶段精确 6 文件：state、queue、design task plan、evidence、audit、design spec。
- 产品阶段预期只触及 queue 中冻结的 employee import command contract/validator/parser/repository/service/route、admin UI/client/hooks/components 和聚焦 tests。
- schema/migration/dependency/database/provider/runtime/browser/P2/PR/force-push/deploy 均未授权。

## Transition Evidence

Result: pass

- base/master/origin：`f466caa81260686d5a2fbcbf62ba08717bf56a82`。
- 前序 F-0115 产品提交、ready transition、普通 push、worktree 和短分支清理已完成；机制小修 `ce6aef7b3` 已通过 transition-only/exact-one-parent 并远端同步。
- F-0116 designPath 守卫热修 `f466caa81` 已以精确十文件通过 P1 `transition_only` 与 Module `exact_one_parent` 并远端同步；只有该治理提交使用 ancestor checkpoint，其他 `in_progress` SHA 漂移继续 hard-block。
- F-0116 设计 transition `f6b14825f41a83b3f9dd3994ec9c1936876b12ff` 已通过 P1 `transition_only` 与 Module ancestor checkpoint，已 ff-only 合入并普通推送 `origin/master`。
- 当前产品 worktree/branch 从该 transition tip 开始；其他 `in_progress` SHA 漂移继续 hard-block。

## Validation Results

Result: pass

- 2026-07-18 实施前聚焦基线：9 files / 171 tests passed，0 failed。
- 命令：`corepack pnpm@10.15.1 exec vitest run`，覆盖 validator、repository、service、route、phase-20 adapter、client、hook、admin baseline 与 P1 atomicity。
- 产品 RED→GREEN、完整静态回归、两轮对抗审查及治理门禁均已完成；最终结果见下方 Final Verification 与 Governance Gate Evidence。

## Round 1

Result: pass

- 第一性原理复核 parser 所有权、集合读取、身份分类、quota 分配、revision、stale/block 零写入、幂等恢复、事务/JIT 竞争窗口、角色边界与响应脱敏。
- 发现完成态 hook 仍保留 preview、原始 source 与密码引用；对应测试先 RED，修复后完成态清除 `preview`、`previewInput` 与页面敏感字段，聚焦回归转 GREEN。

## Round 2

Result: pass

- 独立只读审查最初发现 6 项：late preview 覆盖失效状态、未来有效授权 quota 与 F-0115 JIT 不一致、陈旧 preview 可确认、文件读取竞态、预检解释信息不足、501 行后未早停。均新增/强化对抗测试并关闭。
- follow-up 发现 session token 变化和离开 employees view 时页面字段或 pending file read 仍可能存留；集中 `clearEmployeeImportSensitiveState` 并用 generation token 失效旧读取后关闭。
- 最终 follow-up：原始 6 项和跨 session/view 问题全部 CLOSED；无新 blocker；static review `Ready to merge: Yes`。

## Closeout Command Evidence

- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase pre_commit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-employee-import-preflight-2026-07-17`

Cost Calibration Gate remains blocked。

threadRolloverGate: `continue_current_thread`。保持 WIP=1。

## 2026-07-18 Implementation Checkpoint

Result: superseded_by_approved_scope_correction_and_final_pass

- F-0116 聚焦矩阵：14 files / 227 tests passed，0 failed。
- Task 4 service + F-0115 atomicity：2 files / 44 tests passed。
- Task 5 route/adapters：3 files / 20 tests passed。
- Task 6 client/hook：2 files / 33 tests passed。
- Task 7 panels/admin baseline：4 files / 40 tests passed；浏览器 parser/授权与 quota 近似扫描为零命中。
- `npm.cmd run typecheck`：pass。
- 首次 full unit 在 304 秒超时，未产生失败输出；随后以 900 秒上限完整运行：417/419 files、2656/2659 tests passed。
- 仅余 3 个失败，全部位于当前 allowedFiles 之外的两个既有 smoke tests：`tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts` 与 `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts`。
- 失败均为旧合同断言：仍要求浏览器/legacy adapter 生成 `rows` 且不携带 `expectedPreviewRevision`；F-0116 正确合同为 raw source -> server preview -> revision-bound confirm。
- 禁止为满足旧 smoke 恢复浏览器 parser 或旧 rows confirmation。继续前需要一次性、精确 scope-correction，仅把上述两个 smoke tests 加入 allowedFiles 并更新断言；其他边界不变。

## 2026-07-18 Approved Scope Correction

Result: pass

- 用户书面“批准执行”，精确允许把 `tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts` 与 `tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts` 加入 F-0116 allowedFiles。
- 两个 smoke 仅更新为 raw source -> server preview -> revision-bound confirm 合同；未恢复浏览器 parser，未扩大产品、schema、dependency、database、provider、runtime、P2 或远端动作边界。
- 修正后 smoke：2 files / 5 tests passed。

## Final Verification

Result: pass

- 最终聚焦矩阵（含两个获批 smoke）：16 files / 240 tests passed，0 failed，单 worker。
- 最终 full unit：419 files / 2667 tests passed，0 failed；`Duration 922.87s`。
- hook/page 敏感状态与竞态针对性回归：2 files / 59 tests passed。
- `npm.cmd run lint`：exit 0，0 warning，0 error。
- `npm.cmd run typecheck`：exit 0。
- `npm.cmd run format:check`：exit 0，全部匹配 Prettier。
- `git diff --check`：exit 0。
- browser parser/授权近似扫描：`parseEmployeeImport|buildEmployeeImportPreview|summarizeEmployeeImportTargetAuth|headerIndexByName` 在 `src/features/admin/org-auth-redeem` 零命中。
- 工作树内直接 Turbopack build 会因根 `node_modules` junction 位于 project root 外而拒绝，属于隔离布局限制；未改配置或降级 bundler。把当前 tracked/unignored 文件复制到 disposable plain fixture `D:/tiku/.worktrees/f0116-build-fixture-final-20260718` 后，从 `D:/tiku` 运行原始 `npm.cmd run build -- .worktrees/f0116-build-fixture-final-20260718`：exit 0，Turbopack compiled、TypeScript 完成、96/96 static pages generated。

## Security and Scope Negative Evidence

Result: pass

- preview/错误 DTO 仅包含 masked phone、稳定 reason 与聚合授权/quota；不返回或记录完整 phone、password、raw source、内部自增 id、内部 auth 行、hash payload 或异常文本。
- stale、blocked、no-action 路径零 `claimCommand/processRow`；确认重新解析并读取当前事实，最终写入仍交给 F-0115 transaction/JIT guard。
- repository 以集合查询读取身份和授权/quota；500 行 query count 不随行数增长；未来 active/nonexpired 授权参与 seat reservation，与 F-0115 JIT 一致。
- 未修改 package/lockfile、schema/migration、env；未执行真实 DB、Provider、browser/runtime acceptance、P2、PR、force-push 或 deploy。RV-0018 保持 pending；本任务只声明 static closure。

## Governance Gate Evidence

Result: pass_after_validated_transition_checkpoint_sync

- `Test-P1RemediationSerialProgram.ps1 -Phase manual`：pass，`p1TransitionScopeMode: standard`。
- `Test-P0RemediationGlobalBaseline.ps1`：pass，35 P0 findings、143 P1/P2 impacts、0 dependency cycle。
- `Test-ModuleRunV2PreCommitHardening.ps1`：pass，35/35 changed files 全部命中 task allowlist，敏感证据与术语扫描通过。
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`：首次按预期 hard-block，因为尚未记录自身/预推送结果与 next candidate；补齐后重跑 pass，未把首次失败记作通过。
- `Test-ModuleRunV2PrePushReadiness.ps1`：首次正确拒绝 state `f466caa81` 与 master/origin `f6b14825f` 的 SHA drift。拓扑核对确认 `f6b14825f41a83b3f9dd3994ec9c1936876b12ff` 是已经通过 P1 `transition_only` 与 Module ancestor checkpoint 的单父 F-0116 设计治理提交；因此只把 repository checkpoint 精确同步到该已验证治理 SHA。重跑 pass，`p1TransitionScopeMode: standard`；普通 `in_progress` 产品 SHA 漂移仍 hard-block。
- nextModuleRunCandidate：`F-0117 redeem_code nullable-deadline deep revalidation and approval package`；仅提案，不在本任务物化或实现。因其可能需要 schema/migration，必须先做最新基线复核并取得 fresh approval。

## 品味合规自检 Checklist

- [x] API 路径为 kebab-case，JSON 字段为 camelCase，响应维持 `{ code, message, data }` 与 no-store。
- [x] 业务术语沿用 `employee`、`organization`、`authorization`、`quota`，未自造缩写或暴露自增主键。
- [x] 前端使用既有 Design Tokens/组件类，未写死新颜色或主题判断；复杂状态留在 hook/service。
- [x] 分层保持 route -> service -> repository；浏览器不解析业务 CSV/TSV，也不估算授权/quota。
- [x] null/list/时间等既有合同未被破坏；完整 phone/password/raw source 不进入响应、持久存储或 URL/history。
- [x] 未新增依赖、schema、migration、DB/provider/runtime 权限；F-0115 原子/JIT 守卫未降级。
