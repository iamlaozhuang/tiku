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
- 初始 no-schema 边界下，未知结果恢复必须停止；该停点随后由用户批准的持久 command、placeholder + versioned rotate 规格及 F-0115 精确 scope-correction 取代。客户端缓存或派生密码仍不得冒充恢复事实。

## Transition Evidence

Result: pass

- 前序 F-0114 实现提交 `70bf9f8ab` 与 ready-for-closeout 提交 `8ee336aa4` 已 ff-only 合入 master。
- fresh-master 聚焦 6 文件 90/90、完整 unit 405 文件 2448/2448、lint、typecheck、format、build、P1/P0/Module 与真实 pre-push 均通过。
- local master、origin/master 与实时远端均为 `8ee336aa4f9a073b9456fc86bde641fc989f1123`；前序 worktree 与短分支已清理，既有 recovery stash 未触碰。
- 本 transition 只允许 state、queue、新 plan、新 evidence、新 audit 五份治理文件；产品源码与测试必须零 diff。
- 只有该治理提交通过 P1 `transition_only` 和 Module ancestor checkpoint 后才能开始 F-0115 产品复检；其他 `in_progress` SHA 漂移继续 hard-block。
- transition 提交 `6bde2f2aec3d71fa0ce138b26f64243861cace6f` 已 ff-only 合入并普通推送至 `origin/master`；真实 pre-push 输出 `p1TransitionScopeMode: transition_only`，Module 输出 `OK_PRE_PUSH_P1_TRANSITION_STATE_SHA_ANCESTOR master`。
- 推送后 local master、origin/master 与实时远端均精确为 `6bde2f2aec3d71fa0ce138b26f64243861cace6f`；既有 recovery stash 未触碰。

## JIT Revalidation Result

Result: pass

F-0115 Verdict: `approved_persistent_command_static_implementation_ready_for_final_review`

- 初始 no-schema 复检结论已被用户的 fresh scope-correction 批准取代：允许新增 `employee_import_command` / `employee_import_row` schema 与 Drizzle 迁移源，但仍禁止迁移执行和真实数据库操作。
- command 以 UUID v4 幂等键的域分离 HMAC 标识 actor/request/row；持久层不保存原始幂等键、请求体、手机号、姓名或明文密码。同键同请求恢复，同键异请求返回冲突。
- `claimCommand`、逐行 savepoint、identity/credential/membership/current `org_auth` quota、row outcome 与 audit 均归 command repository 事务所有；确定性行拒绝回滚 savepoint，未知异常不被伪装为 rejected。
- create/bind primitive 强制当前有效授权；集合更新均校验精确返回 ID 集合，缺失、额外或重复更新抛错并回滚。
- 初始凭据先写不可知 placeholder；显式 issue 在 session/advisory lock 下按 revision 原子换新，响应只返回本次明文；GET 不返回明文，confirm 关闭分发。
- legacy single create 与 batch import 均适配为可查询 command；client/hook 只持久化 command public id 和幂等键，late response、revision/issue mismatch、session actor 切换均 fail-closed。

## Scope Freeze

Result: pass

当前产品候选精确为 50 个 task-allowlisted 文件：5 份规格/计划/evidence/audit，3 份 Drizzle 迁移源/元数据，4 个 command API route，3 个 schema/index 文件，7 个前端 client/hook/panel/page 文件，19 个 contract/validator/crypto/repository/service/auth 文件，以及 9 个 `tests/unit` 聚焦文件。新增 phase-11 fake 适配通过独立治理热修加入 allowlist。

- 未修改 `project-state.yaml`、`task-queue.yaml`、依赖清单、lockfile、环境文件或 hook。
- 迁移源仅生成并静态验证：`drizzle/20260717141801_p1_rc_02_employee_import_command_recovery.sql`、`drizzle/meta/20260717141801_snapshot.json`、`drizzle/meta/_journal.json`；未执行 migration 或 database command。
- 未执行真实 DB、Provider、browser/e2e、P2、PR、force-push 或 deployment。

## Validation Results

Result: pass

- Task 5 repository 聚焦：3 文件、103/103 通过。
- phase-11 适配 RED：1/4 失败，route 返回 `422601`；最小 fake/type/idempotency 适配后 GREEN：4/4 通过。
- 最终对抗 RED：history state 覆盖、session/401/403/404 stale command anchor 与 `org_auth` cancel/quota 锁序共 3 文件出现 7 个预期失败；最小修复后 GREEN 为 3 文件、41/41 通过。
- Task 8 最终聚焦矩阵：21 文件、278/278 通过；其中原计划 20 文件全部通过，并增加已授权 phase-11 测试。
- 最终完整 unit 首轮：416 文件中 415 通过，2617/2618；唯一失败是任务外 mock-exam UI 异步恢复提示在全量负载下超过等待窗口。该文件隔离复跑 42/42 通过；标准 `npm.cmd run test:unit -- --maxWorkers=1` 完整复跑最终 416/416、2618/2618 通过，耗时 `980.22s`。
- 最终 `lint`、`typecheck`、`format:check`、`git diff --check` 通过。
- 初始 build 因 worktree `node_modules` Junction 指向 filesystem root 外而 panic；使用同一锁文件和本地 pnpm store 建立 worktree-local 依赖树后，Turbopack 编译、TypeScript、95 个静态页面生成和最终优化全部通过。
- 治理热修 `66a9f526d68c2647a5843da1a9d9c2fe0933cc93` 已以 `transition_only`、`exact_one_parent` 通过真实 pre-push 并推送；产品 worktree fast-forward 后 exact 50-file staged patch hash 保持不变。P1 manual/P0 global baseline pass，最终 Module pre-commit 对 50/50 scope、sensitive 与 terminology scan 全部通过；产品 commit hook/closeout/pre-push 仍待后续步骤。
- RV-0018 保持 pending；真实 PostgreSQL 锁竞争、commit acknowledgment 丢失、断连和迁移执行未验证，不据静态结果声称 runtime closure。

## Round 1

Result: pass

独立 repository/transaction/security 审查先发现 1 个 Important：`cancelOrgAuth` 未加入员工 current authorization/quota 的共同锁协议，存在取消与员工提交 TOCTOU。RED 后将 cancel 整体纳入 transaction，并在任何 `org_auth` update 前取得 `lockOrganizationScopeMutation`；create/bind/import 同样先取该 transaction advisory lock。复核为 APPROVE，0 Critical / 0 Important / 0 Minor。真实 PostgreSQL 双连接竞争仍属于 RV-0018，未冒充关闭。

## Round 2

Result: pass

独立 route/client/hook/UI 审查先发现 2 个 Important：history writer 覆盖 Next Router/恢复状态，以及 session/auth/visibility 变化后旧 command query 被新 actor 自动恢复。RED 后所有 writer 合并现有 state、只删除本功能 key；session change 与 401/403/404/明确关闭清除恢复位置并阻止新 token GET 旧 command。复核为 APPROVE，0 Critical / 0 Important / 0 Minor。

## 品味合规自检 Checklist

- [x] 1. 无默认字体、纯黑或紫蓝渐变；新增 UI 继续使用既有 design tokens。
- [x] 2. command UI 保留 loading/empty/error/conflict 状态。
- [x] 3. 新增/修改按钮保留 `active:scale-[0.98]` 反馈。
- [x] 4. `format:check` 通过，Tailwind 类名顺序合规。
- [x] 5. command 结果读取使用集合查询；无循环内 `select` N+1。
- [x] 6. schema 由 Drizzle schema 与 generate 产出迁移源；无业务层拼接 SQL、未 push/migrate。
- [x] 7. 四组 API route 始终返回标准 `{ code, message, data }` envelope 与 no-store。
- [x] 8. 未新增解释代码表面行为的垃圾注释。
- [x] 9. 命名遵循 glossary 与动词-名词规则，无新增无意义缩写。
- [x] 10. React/history state 通过复制与纯函数更新，未直接变更对象或数组内部属性。

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
