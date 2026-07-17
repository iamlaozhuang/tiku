# P1 RC-02 卡密权益预览与显式确认证据

日期：2026-07-16

任务：`p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已完成标准与高级版需求、现行 traceability、full-role UI/UX 基线、本地脱敏设计板、F-0132 原始审计、当前 UI/API/service/repository/schema 约束及现有兑换测试的读取。来源时间序一致：2026-07-02 与 2026-07-07 基线均要求 server preview + confirm，多目标显式选择；P0 F-0004 只改变消费语义，不关闭预览缺口。

## Requirement Mapping Result

- `01-user-auth.md` 与 `epic-01-user-auth.md` 固定三类卡密、不可撤销消费、原子兑换与多目标显式选择。
- ADR-002 要求 route 仅适配，解释与确认规则属于 service，数据库读取与条件消费属于 repository。
- ADR-007 固定 source `edition`、`auth_upgrade` 与动态 `effectiveEdition`，升级卡不能新建 `personal_auth`，已高级不得再次消费。
- learner UI/UX 基线要求 preview-then-confirm，并在确认前展示标准开通、高级开通或既有标准授权升级的差异。
- plaintext 卡密例外只适用于合格运营 UI；学员 preview 响应、evidence、audit、日志与提交文档均不得携带明文或 hash。

## JIT Revalidation Result

Result: pass

F-0132 Verdict: `confirmed`

- 当前首次提交只执行 `setReviewedRedeemCode`，没有任何 preview 请求。
- 当前确认区只回显输入卡密和泛化说明；合同没有 `redeemCodeType`、结果版本、期限、目标或 `previewVersion`。
- `/api/v1/redeem-codes/redeem` 直接执行不可逆消费；客户端不能为多条标准授权选择升级目标。
- 现有 repository 会在多目标时拒绝消费并保持原子性，但“到消费时才报错”不等于消费前权益预览。

## Scope Freeze

Result: pass

范围只覆盖 F-0132 的 learner server preview、显式升级目标、previewVersion、事务内 confirm 重验、同用户响应丢失恢复、单实例有界 preview 限流及对应合同/service/repository/UI 单元测试。不实现 F-0133、F-0140、F-0141、P2、schema/migration、依赖、真实数据库或 runtime/browser acceptance。

## Transition Evidence

Result: pass

- 前序 F-0131 已以 `08aee5a3c0ea3285d5063089663203953e4dfa7c` 完成提交、ff-only 合入、origin/master 同步与隔离资源清理。
- local master、origin/master 与实时远端均以该 SHA 为当前 transition ancestor；只允许在 P1 transition-only 守卫通过后使用 ancestor checkpoint。
- 只读审计仓库保持 `a84224fa12ec85b28e6acd945deba2afa28c6c02`，不得修改。
- JIT 深复检确认 F-0132 仍成立：当前 UI 首击只写 React 状态，服务端无 preview API/DTO，确认请求只有 `{ code }`，多升级目标没有客户端选择合同。
- P0 F-0004 已守住三类卡密消费与同码条件更新，但没有提供消费前权益快照；本任务不重复修改已成立的不变量。
- 本 transition 只修改 state、queue、plan、evidence、audit；产品源码和测试仍为零 diff。
- P2、21 项 runtime backlog、RV-0021、schema/migration、数据库、依赖、Provider、browser/e2e、PR、force push 与部署边界保持不变。
- transition commit 为 `5a5d9ac9c66f00991c17c3af7410958199d02a79`；P1 `transition_only`、P0 baseline 与 Module ancestor checkpoint 守卫通过后才开始产品源码和测试修改。
- ancestor checkpoint 仅用于上述已通过 transition-only 的治理提交；本任务后续任意 `in_progress` SHA 漂移仍由标准 P1/Module 守卫 hard-block。
- 用户批准的独立 scope-correction 治理热修以 `5fd1effdfca709fd126ded3776e40bb17566bf52` 经真实 pre-commit/pre-push hooks 提交并推送；其 queue delta 仅增加 phase-11 测试 allowlist，P1/Module transition-only smoke 与祖先 checkpoint 门禁通过，未绕过 hook。
- 产品分支已 ff-only 前进到该热修并恢复 23 个产品实现、测试与任务证据文件；上述一次性 transition-only 路径不授权任何其他 `in_progress` SHA 漂移。

## Validation Results

Result: pass

- TDD RED 首次证明 service 不存在 `previewRedeemCode`、UI 首击仍为本地状态、限流器与确认 validator 缺失、runtime 无 preview handler、transaction source guard 缺失；随后每项按 RED → GREEN 实现。
- UI 对抗 RED 又依次复现升级期限误导、兑换中输入/单选未锁定、三类卡标签不明确，以及 used/stale 终态未使预览失效；均在最终版本修复并由回归测试固定。
- 最终聚焦回归：8 个文件、51 个测试通过，包含 validator、限流、service、route、phase 8、phase 11、phase 21 transaction/source guard 与 learner UI。
- 完整 unit 首轮为 404 个文件、2434 个测试通过，另有 1 个与本任务无关的 `student-mock-exam-report-ui` 超时；该用例隔离复跑 1/1 通过。治理热修合入并恢复产品分支后，再次完整新鲜复跑为 405 个文件、2435 个测试全部通过，Vitest 耗时 867.55 秒。
- 最终代码状态下 `npm.cmd run lint` 通过且 0 warning/error，`npm.cmd run typecheck` 与 `npm.cmd run format:check` 通过；`git diff --check` 在提交前门禁继续单独执行。
- 提交前 `git diff --check` 通过；P1 manual 以 `standard` 模式通过，计数保持 P1=125、P2=18、runtime=21；P0 baseline 通过，finding=35、impact=143、runtime=21、cluster=8、cycle=0，审计仓 SHA 保持 `a84224fa12ec85b28e6acd945deba2afa28c6c02`。
- 治理热修合入后，Module pre-commit hardening 以 task scope 新鲜扫描 23 个文件并通过；全部文件命中 allowlist，敏感信息与术语扫描无 finding。Module closeout/pre-push 仍须在提交和 fresh-master build 后执行，不在此处预先标记。
- Git pre-commit 的 P1 Program 守卫曾按设计 hard-block：`phase-11-redeem-code-batch-management-loop.test.ts` 必须随 repository/route 合同更新才能保持全量回归，但原 transition commit 的 `allowedFiles` 漏列该文件；同时修改 queue 与实现会触发 `P1_PROGRAM_SCOPE_SELF_MODIFICATION_WITH_IMPLEMENTATION_CHANGE`。该阻断已由上述经批准、独立提交、含 smoke test 的治理热修精确解除；产品提交不再修改 queue，其他 `in_progress` 漂移继续 hard-block。
- 隔离 worktree 的 `npm.cmd run build` 因 Turbopack 拒绝解析 worktree 根目录外 `D:/tiku/node_modules` 中的 Next 而失败；临时验证 Junction 已删除，package/lockfile 均恢复且无 diff。ff-only 合入后必须在具有物理 `node_modules` 的真实 `master` 运行标准 build，失败即停止 push/closeout。
- 未执行真实 PostgreSQL、数据库 mutation、Provider、browser/e2e/runtime acceptance、P2、PR、force push 或部署；F-0140 与 RV-0021 保持未关闭。

## Round 1

Result: pass

- 主审从不可逆 consume 线性化点逐层核对 UI → route → service → repository，固定 preview 只读、confirm 单事务重验、明确目标及同用户提交事实恢复。
- 事务审查确认 user lock 先于 code lock，当前 candidate/upgrade 事实随后在同事务读取并加锁；版本重建、目标校验和所有领域拒绝均先于 conditional consume。
- source guard 固定 confirm 函数、锁顺序、preview 重建/版本比较先于 consume，以及 service 不得恢复为 transaction 外 `findRedeemCodeByCode` 预检。
- 审查中发现 recovery 查询约束不足与 queue 目标术语不一致；前者补充 `source_type = redeem_code`、`target_edition = advanced`，后者统一为 `targetPersonalAuthPublicId`。

## Round 2

Result: pass

- 独立事务/并发只读复核最终结论 `APPROVE`：锁顺序、版本事实覆盖、消费前拒绝、同用户 recovery、跨用户隐私与多目标选择均成立；无剩余 P1 blocking。
- 独立 UI/安全/测试复核首轮提出 3 个阻断：兑换中单选未禁用、终态错误未使预览失效、卡类型展示不够明确。三项均先补失败测试再修复，最终复核结论 `APPROVE`。
- `previewVersion` 明确为内容版本而非认证凭证；授权仍完全依赖 session、事务内当前事实、目标资格、条件消费及数据库唯一约束。
- non-blocking：进程内限流不提供跨实例配额，静态 source guard 不替代真实 PostgreSQL isolation/锁等待/连接中断/多实例响应丢失验收；继续保留 RV-0021。不同升级卡并发升级同一授权继续属于 F-0140。

## Closeout Command Evidence

- `$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; corepack pnpm@10.15.1 exec vitest run src/server/validators/redeem-code.test.ts src/server/services/redeem-code-preview-rate-limiter.test.ts src/server/services/redeem-code-authorization-service.test.ts src/server/services/redeem-code-route.test.ts tests/unit/phase-8-student-authorization-redeem-runtime.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-21-admin-redeem-code-concurrency.test.ts tests/unit/student-profile-redeem-ui.test.ts --maxWorkers=1`
- `$env:PATH='D:\tiku\node_modules\.bin;' + $env:PATH; npm.cmd run test:unit -- --maxWorkers=1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16 -SkipRemoteAheadCheck`
- `git diff --check`

## Fresh-Master Closeout Gate

ff-only 合入后必须在真实 `master` 运行标准 Turbopack build、聚焦回归、lint、typecheck、format、P0/P1/Module 门禁并通过，之后才允许普通 push。该后置门禁未被本 evidence 预先标记为完成。

Cost Calibration Gate remains blocked。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不并行物化下一产品任务。

nextModuleRunCandidate: `P1-RC-02 employee password reset one-time distribution JIT revalidation (F-0108)`；仅指向冻结 ledger 中同簇剩余候选，不预先冻结实现范围或声明结论。
