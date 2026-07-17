# P1 RC-02 用户密码重置一次性分发证据

日期：2026-07-16

任务：`p1-remediation-rc-02-user-password-reset-distribution-2026-07-16`

## Reading Evidence

status: complete

conflictsFound: false

targetSourceReviewed: true

targetTestsReviewed: true

analogousImplementationReviewed: true

已完成标准与高级版需求索引、员工/运营/授权需求、D05、CT-REQ-046、CT-REQ-054、相关 UI/UX 基线、F-0108 原始审计、当前 production UI/runtime/repository/合同与测试读取。现行要求一致：只有平台运营或超级管理员可重置员工账号；服务端生成凭据、撤销会话、提供一次性分发窗口；首版不强制首次登录改密。

## Requirement Mapping Result

- D05 固定平台运营/超级管理员执行用户密码重置、撤销有效 session 并提供一次性分发窗口，同时明确首版不强制首次登录改密。
- CT-REQ-046 要求生成一次性分发凭据并撤销 session；CT-REQ-054 禁止组织管理员获得员工重置权限。
- ADR-002 要求 route/runtime 负责应用编排、repository 负责持久化；客户端不得决定认证秘密。
- 现有 `AdminUserPasswordResetResultDto` 已提供 `oneTimePasswordPlainText`、`visibleOnce`、`expiresAt`、脱敏提示和 session 撤销状态，无需新合同或 schema。

## JIT Revalidation Result

Result: pass

F-0108 Verdict: `confirmed`

- 当前 UI 使用 `resetPasswordInput` 收集运营指定密码，并向用户重置接口发送 `{ newPassword }`。
- 当前 validator 要求 `newPassword`，runtime 将该值直接交给 repository hash；运营可选定并长期保留用户凭据。
- 成功响应为 `data: null`，没有一次性分发窗口，也没有 `Cache-Control: no-store`。
- 管理员账号重置已有服务端高熵生成、`no-store` 与内存一次性显示的相近实现，可在不引入依赖或 schema 的前提下复用模式。

## Patch Contract

- Root cause: 用户重置把认证秘密的选择权交给运营客户端，同时没有安全的一次性分发响应。
- Security property: 最终密码只由服务端生成；成功响应仅在 `no-store` 标准 envelope 的一次性窗口返回；session 撤销、权限与审计脱敏不回归。
- Exact touchpoints: `AdminOpsManagement.tsx`、`admin-flow-runtime.ts`、既有用户重置 DTO、删除失效 validator 及对应聚焦测试。
- Explicit exclusions: schema/migration/dependency、reset token、邮件/短信、首次登录强制改密、F-0030 原子性、真实 DB/runtime/browser、P2/PR/deploy。
- Required RED: 客户端密码不可控、成功 `no-store` + 一次性 DTO、审计无 secret、UI 无密码输入且只保留最新秘密。

## Scope Freeze

Result: pass

范围只覆盖 F-0108 的服务端生成用户密码、成功响应一次性分发、UI 去除密码输入、保留 session 撤销/权限/脱敏审计，以及管理员账号重置回归。不修改 repository 持久化语义，不合并 F-0030，不实现首登强制改密、外部分发或 runtime acceptance。

## Transition Evidence

Result: pass

- 前序 F-0132 的实现提交 `6af0fbb08bcab9373f3d1a9b8181f03f6364b02c` 与 ready-for-closeout 提交 `9683c2191628be162b8c6f09318fe15af24c1bd1` 已完成 ff-only 合入、fresh-master build/完整回归、origin/master 同步与隔离资源清理。
- local master、origin/master 与实时远端均为 `9683c2191628be162b8c6f09318fe15af24c1bd1`；F-0132 五项 closeout checkpoint 均为 pass。
- 只读审计仓库保持 `a84224fa12ec85b28e6acd945deba2afa28c6c02`，不得修改。
- 本 transition 只修改 state、queue、新 plan、新 evidence、新 audit；产品源码和测试保持零 diff。
- 只有该治理提交通过 P1 `transition_only` 与 Module ancestor checkpoint 后才能合入并开始产品修改；任何其他 `in_progress` SHA 漂移继续 hard-block。
- P2、RV-0016、schema/migration、数据库、依赖、Provider、browser/e2e、PR、force push 与部署边界保持不变。
- transition 提交 `c45b36a60aa91c3adb2917f0f829b121da93136c` 已 ff-only 合入并推送；真实 pre-push hook 输出 P1 `transition_only`，Module 仅接受 state `9683c219...` → origin `9683c219...` → master `c45b36a60...` 的合法祖先 checkpoint。local master、origin/master 与实时远端随后均为 `c45b36a60...`。

## Validation Results

Result: pass

- TDD RED 首次稳定复现两条缺口：成功响应缺少 `Cache-Control: no-store`，UI 仍渲染 `reset-password-new-password` 并发送运营选定密码。GREEN 后客户端 body 被完全忽略，repository 只收到服务端生成值。
- 默认生成器复用 `randomBytes(12).toString("base64url") + A1`，约 96 bit 随机熵；同一依赖同时服务用户与后台账号 reset，现有后台账号一次性密码测试保持通过。
- 用户成功响应使用既有 `AdminUserPasswordResetResultDto` 与标准 envelope，带 `no-store`、`visibleOnce: true`、`expiresAt: null`、脱敏提示及 `revoked_active_sessions`；not-found、权限拒绝和 runtime unavailable 均不返回 secret，且审计只写固定脱敏 metadata。
- UI 已移除密码输入和 reset request body；用户/后台账号共享一个仅内存 one-time state。打开新 reset 先清旧秘密，成功只覆盖当前秘密，显式 dismiss 与刷新清除。
- 首轮独立复核发现双击并发可导致旧响应覆盖当前密码，以及用户 reset 网络异常未捕获。修复后，同步 `useRef` 锁在首个 `await` 前取得，pending 期间确认、取消和所有新 reset 入口均被阻断，`finally` 释放并以 request sequence 拒绝失效响应；deferred 测试证明双击只发一个 POST，网络失败显示无 secret 的安全错误。
- 最终聚焦回归为 6 个文件、41 个测试全部通过，覆盖 server-generated 值、恶意 body 无效、success/not-found/unavailable、`no-store`、session revoke、权限/审计、无密码输入、无 request body、顺序最新替换、双击串行、网络失败及后台账号 reset 回归。
- 完整 unit 为 405 个文件、2439 个测试全部通过，Vitest 耗时 842.64 秒；`lint`、`typecheck`、`format:check` 与 `git diff --check` 通过。
- 最终 staged diff 的 P1 pre-commit 以 `standard` 模式通过，计数保持 P1=125、P2=18、runtime=21；P0 baseline 通过，finding=35、impact=143、runtime=21、cluster=8、cycle=0，审计仓 SHA 保持 `a84224fa12ec85b28e6acd945deba2afa28c6c02`。
- Module pre-commit hardening 扫描 10 个非删除文件并通过 allowlist、敏感信息和术语检查；`src/server/validators/user-password-reset.ts` 的删除由同一 staged diff 与 task allowlist 约束。Module closeout/pre-push 仍必须在提交、fresh-master build 和状态切换后执行，不在此处预先标记。
- 隔离 worktree 的 `npm.cmd run build` 仅因 Turbopack 拒绝解析工作树外 `D:/tiku/node_modules` 中的 Next 失败；未修改 Next 配置、package 或 lockfile。ff-only 合入后必须在具有物理 `node_modules` 的真实 master 重新执行标准 build，失败即停止 push。
- 本任务只保证同一 UI 实例内的 reset 串行，不声称跨标签页、跨客户端或数据库级原子性；密码写入后 revoke 返回 false/异常的部分成功继续属于 F-0030，真实环境行为继续属于 RV-0016。
- 未执行 schema/migration、数据库 mutation、Provider、browser/e2e/runtime acceptance、首次登录强制改密、外部分发、P2、PR、force push 或部署。

## Round 1

Result: pass

- 主审从认证秘密控制权逆向检查 UI → runtime → repository，确认请求体不能选择最终密码，生成器只在权限与 runtime readiness 通过后调用，未找到 secret 进入错误响应、toast、日志或审计的路径。
- 对抗测试固定 not-found 不撤销 session、不回显生成值；revoke runtime 缺失时在生成与密码写入前 fail closed；ops/super 权限边界和 content admin 拒绝保持。
- 首轮 UI 并发审查将重复确认和网络异常列为 blocking；均先补失败/延迟测试再实现同步重入锁、pending 禁用和安全异常收口。

## Round 2

Result: pass

- 两项独立只读复核最终均为 `APPROVE`。服务端复核确认约 96 bit 默认熵、成功/失败 `no-store` 与固定审计 metadata；UI 复核确认双击仅一个 POST、顺序替换只有最新秘密、网络失败释放锁且无 secret 残留。
- 单一 one-time state 同时覆盖用户与后台账号，避免跨类型同时保留两个秘密；生产 UI 不再包含密码输入、`newPassword` 或 reset body，secret 只进入一个 `<code>` 区域。
- 非阻塞边界：同步锁只覆盖当前 React 页面实例。跨客户端 reset 顺序、repository 密码写入与 session revoke 原子性不得包装为本 finding 的完成证据，继续由 F-0030/RV-0016 承担。

## Closeout Command Evidence

- `corepack pnpm@10.15.1 exec vitest run src/server/services/admin-flow-runtime.test.ts tests/unit/admin-ops-summary-first-ui.test.ts tests/unit/phase-11-auth-session-account-hardening.test.ts tests/unit/phase-20-ra-01-05-password-reset-ops-flow.test.ts tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts --maxWorkers=1`
- `npm.cmd run test:unit -- --maxWorkers=1`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run format:check`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P1RemediationSerialProgram.ps1 -Phase manual`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-P0RemediationGlobalBaseline.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1 -TaskId p1-remediation-rc-02-user-password-reset-distribution-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId p1-remediation-rc-02-user-password-reset-distribution-2026-07-16`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File ./scripts/agent-system/Test-ModuleRunV2PrePushReadiness.ps1 -TaskId p1-remediation-rc-02-user-password-reset-distribution-2026-07-16 -SkipRemoteAheadCheck`
- `git diff --check`

Cost Calibration Gate remains blocked。

threadRolloverGate: `continue_current_thread`。保持 WIP=1，不并行物化下一产品任务。

nextModuleRunCandidate: `P1-RC-02 employee unbind membership lifecycle JIT revalidation (F-0114)`；仅指向冻结 ledger 中同簇下一 pending 候选，不预先物化任务、冻结实现范围或声明结论。
