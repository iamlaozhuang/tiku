# P1 RC-02 员工创建原子性整改方案

日期：2026-07-16

任务：`p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`

分支：`codex/p1-rc02-employee-creation-atomicity`

工作树：`D:/tiku/.worktrees/p1-rc02-employee-creation-atomicity`

## 目标

即时深复检 F-0115 在 P0 与后续 F-0108/F-0114 基线上的真实残留：员工 `auth_user`、`auth_account`、`user`、`employee` 与 quota reservation 必须形成单一可回滚提交；批量异常、未知响应和重试不得留下孤儿凭据、重复账号或无法安全分发的一次性初始密码。

用户已于 2026-07-16 依次批准持久 command/outcome、placeholder + versioned rotate 恢复设计、三段设计、书面规格，以及“规格暂存但未单独提交并最终折叠进 F-0115 单一产品提交”的例外。批准规格见 `docs/superpowers/specs/2026-07-16-employee-import-command-recovery-design.md`；详细实施计划见 `docs/superpowers/plans/2026-07-16-employee-import-command-recovery.md`。

## 必读规范与权威来源

- `AGENTS.md`、术语表、品味十诫与全部 ADR，重点 ADR-002、ADR-007。
- 标准/高级版需求索引、edition-aware authorization、管理员运营、员工授权与额度、批量导入及一次性密码需求。
- `modules/06-admin-ops.md`、相关 story、cross-cutting transaction/idempotency requirements、D05/D29 与 CT-REQ-043/054。
- F-0115 ledger、post-P0 map、P1-RC-02 根因簇、P0/F-0108/F-0114 最新 evidence 与 RV-0018 入口。
- 当前 employee account service、组织授权 runtime/repository、批量导入 UI/route 与对应测试。

## 第一性原理与 JIT 顺序

“接口返回成功”不是账号创建原子性的权威事实；权威事实是所有身份、成员、quota、row outcome 与成功审计是否在同一外层事务中共同提交。生成凭据不再随创建同步返回：创建只写不可知 placeholder 哈希，分发动作原子换新并以单调 revision 返回本次明文。

本任务不得按旧代码证据整包重开。transition 推送后已证明 P0 把凭据创建并入 employee repository transaction；新鲜 residual 是 create/bind 未强制当前授权，以及批量未知结果、审计后置失败和一次性 secret 无恢复锚点。用户已批准新增 `employee_import_command`、`employee_import_row` 和 Drizzle 生成迁移源文件，但仍禁止迁移执行与真实数据库操作。

## 治理前置门禁

当前 task queue 仍保留旧 no-schema stop condition、schema/drizzle blocked patterns 和旧 allowlist；现有守卫只为已批准的 F-0132 提供一次性 scope-correction 路径。不得复用或泛化该例外。

产品实现开始前必须另行取得用户对“F-0115 精确 scope-correction 治理热修”的书面批准，并在独立短分支中完成精确、单次、含 P1/Module smoke 的 transition-only 提交。该治理提交只能物化本次已批准的 fresh approval、F-0115 queue 范围、守卫和 smoke；必须固定 base、branch、task、file set 与 queue delta。只有它自身通过 P1 `transition_only` 后才可使用 ancestor checkpoint；其他 `in_progress` SHA 漂移继续 hard-block。

门禁状态：pass。治理提交 `66a9f526d68c2647a5843da1a9d9c2fe0933cc93` 已按固定 base、单 parent、精确 10 文件通过 P1/Module smoke 与真实 `transition_only` pre-push；其他 `in_progress` SHA 漂移仍 hard-block。

## TDD 与实现边界

1. 先建立 post-P0 baseline 与 RED，证明可复现 residual；无 RED 不修改产品代码。
2. 治理前置门禁通过后，最小修复只能触及详细实施计划列出的 command schema、generated migration source、employee transaction primitive、command/recovery service/repository/routes、兼容适配器、运营 UI 与聚焦 tests。
3. 保留 `ops_admin` / `super_admin` 写权限、组织范围、手机号身份冲突、quota 与审计脱敏语义。
4. schema 只能由 Drizzle schema + `drizzle-kit generate` 产生可审查源文件；禁止手写业务 SQL、`drizzle-kit push`、migrate、真实 DB、外部分发服务、依赖、Provider、browser/e2e、P2、PR、force push与部署。
5. 各实施任务按 TDD 建立 RED/最小 GREEN/聚焦回归，但不得产生中间产品提交；规格、实施计划、代码、测试和迁移源最终折叠为一个 F-0115 产品提交，随后另做 ready 治理提交。

## 两轮对抗审查

- Round 1：逐个副作用注入失败，验证回滚；攻击并发手机号、重复请求、批量中途异常、非 JSON/断链和一次性密码与提交结果不一致。
- Round 2：独立只读复核 transaction/savepoint ownership、HMAC 幂等、登录/session 共锁、revision/CAS、异常分类、secret 生命周期、范围与回归；不得写文件或执行真实 DB/runtime/browser。

## 完成条件

- 单建与批量均委托持久 command；identity/credential/membership/current `org_auth` quota/outcome/audit 同事务，unknown result 可安全重放。
- generated credential 仅通过 placeholder + versioned rotate 分发；GET、日志、审计、证据、普通 UI 和持久存储均无明文。
- 登录/session 与换新共用 advisory lock；revision、manifest、credential baseline、普通 reset、active session 和并发冲突全部 fail closed。
- F-0115 static residual 由新鲜证据关闭；RV-0018 的真实 PostgreSQL rollback、锁竞争和 commit-ack 验收保持 pending。
- 聚焦、完整 unit、lint、typecheck、format、build、P0/P1/Module 门禁通过。
- 独立实现提交、ready-for-closeout 提交、ff-only 合入、普通 push 与隔离资源清理完成后，才进入下一 JIT finding。
