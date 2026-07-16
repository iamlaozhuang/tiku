# P1 RC-02 卡密权益预览与显式确认整改方案

日期：2026-07-16

任务：`p1-remediation-rc-02-redeem-entitlement-preview-2026-07-16`

分支：`codex/p1-rc02-redeem-entitlement-preview`

工作树：`D:/tiku/.worktrees/p1-rc02-redeem-entitlement-preview`

## 目标

即时深复检并修复 F-0132：学员必须先看到服务端校验后的卡密类型、专业、等级、结果版本、期限与升级候选目标，完成必要的显式目标选择后，才能发起不可逆兑换。确认时必须在同一数据库事务内重新验证预览版本、卡密当前状态与目标资格，防止预览与消费之间的状态漂移。

## 已读取规范与权威来源

- `AGENTS.md`、品味十诫、术语表与全部 ADR；重点 ADR-002、ADR-004、ADR-006、ADR-007。
- 标准需求索引、`modules/01-user-auth.md`、`stories/epic-01-user-auth.md`。
- 高级版索引、`edition-aware-authorization-requirements.md`、授权上下文模块与 edition-aware acceptance matrix。
- 2026-07-02 卡密版本/明文决策、role/auth/ops decision package、ops authorization UI/UX contract、current-thread reconciliation ledger 与 UI/UX gap baseline。
- 2026-07-07 full-role source entry、全角色基线、batch 0、batch 4、本地设计板物化与四项审查，以及仓库外脱敏设计板。
- P1 finding ledger、post-P0 map、P1-RC-02 候选根因、F-0132 原始只读审计记录与 RV-0021 入口。

## 第一性原理与 JIT 结论

卡密兑换的线性化点是“unused 卡密被条件更新为 used”。由于该动作不可撤销，用户确认的对象不能只是自己刚输入的 8 位字符串，而必须是服务端在当前用户上下文中解释出的权益快照。正确闭环必须满足：

1. preview 只读，不消费卡密；URL、日志与响应均不回显明文或哈希。
2. preview 由服务端解释三类 `redeem_code_type`；升级卡还要计算当前用户的有效标准版候选和已高级状态。
3. confirm 携带不可伪造为其他业务语义的 `previewVersion` 以及显式目标；事务重新读取当前事实并拒绝漂移。
4. 真正消费仍以条件更新和唯一约束收敛；同一用户在响应丢失后重试应恢复已提交结果，其他用户只能得到不泄露归属的冲突。

当前实现不满足上述第 1 至第 3 项：`StudentRedeemCodePage` 首次点击只设置 `reviewedRedeemCode`，没有 preview 请求；确认区只回显明文和泛化说明；API 只有 `/redeem`，合同没有类型、版本、期限、候选目标或预览版本。P0 F-0004 已收敛消费时的三类型写语义和同码条件更新，但不能替代消费前知情确认。因此 F-0132 仍为 confirmed，需要产品源码修复。

根因范围从候选 `organization_employee_quota_lifecycle` 收窄为共享 learner `redeem_code` preview/confirm contract；不连带修复 F-0133 授权历史、F-0140 多张不同升级卡并发、F-0141 全局授权上下文选择或其他 P2。

## 实现方案

1. 增加 `POST /api/v1/redeem-codes/preview`。使用 POST 避免明文卡密进入 URL/query 日志；响应只含安全权益元数据、`previewVersion` 与 public-id 目标摘要。
2. 增加纯领域 preview 快照模型。版本摘要覆盖卡密 public id、类型、范围、时长、截止时间、更新时间及排序后的候选目标，不包含明文、哈希或 numeric id。
3. repository 增加当前用户升级候选读取与事务内快照重建。confirm 在事务内重新读取卡密和候选集合，比较 `previewVersion`，验证目标、已高级状态、期限和 unused 状态后才条件消费并写 `personal_auth` 或 `auth_upgrade`。
4. 复用卡密本身的唯一消费身份实现自然幂等：若同一用户的首次确认已提交但响应丢失，重试读取该卡密已形成的授权结果并返回同一成功结果；若由其他用户消费，只返回通用已使用冲突。冻结 schema 下不新增无持久化意义的伪 idempotency key。
5. preview 使用有容量上限、按用户计数且不以卡密为 key 的进程内限流器。它降低单实例枚举风险，但不声称跨实例强限流；该运行时残余继续由 RV-0021 承担。
6. UI 将本地二次点击替换为 preview loading/error/ready 状态，展示卡种、专业、等级、结果版本、时长、截止时间；多目标用显式单选，只有 preview 仍匹配当前输入且目标就绪时才能确认。

## TDD 与对抗式验证

### RED

- 先新增失败测试，证明当前代码没有 preview 路由/合同，UI 首次点击不请求服务端，多目标无法选择，confirm 不携带版本和目标。
- service/repository 测试覆盖过期、已使用、无目标、多目标、已高级、类型/范围/期限/候选集合变化、错误目标、同用户响应丢失重试、跨用户争用与并发单消费。

### GREEN

- 只实现上述最小 preview/confirm 闭环；不新增 schema、migration、依赖或外部服务。
- 继续使用既有 design tokens、标准 API envelope、camelCase DTO 与 public id。

### Round 1

主审从不可逆消费线性化点逆向盘点 UI → route → service → repository → schema 约束，攻击明文泄漏、预览枚举、stale preview、目标替换、已高级、截止时间跨越、相同/不同用户并发与响应丢失。

### Round 2

transition-only 守卫通过后，允许独立只读 Subagent 复核完整 diff 与测试，重点寻找：只在事务外重验、previewVersion 未覆盖候选集合、目标 public id 越权、同用户 replay 被误判为他人、限流 key 包含明文、UI 编辑输入后仍可确认、错误状态泄漏内部事实。Subagent 不得写文件、执行 DB/runtime/browser、读取 secret 或修改审计仓库。

## 允许文件

以 `task-queue.yaml` 当前任务 `allowedFiles` 为唯一清单，覆盖本任务 state/queue/plan/evidence/audit、preview API、learner redeem UI、authorization contract/mapper/model/validator/service/repository 及聚焦单元测试。

## 禁止范围

- schema、migration、seed、依赖、lockfile、env/secret、真实 DB、Provider、browser/e2e/runtime acceptance。
- P2 实现、其他 P1 finding、PR、force push、部署及只读审计仓库修改。
- 卡密明文、哈希、账号、内部 id、原始 DB 行进入 evidence、audit、日志或提交文档。

## 风险与停止条件

- 若事务内正确重验必须新增 schema/migration，停止并请求单独批准，不以进程内缓存伪装持久化一致性。
- preview 是卡密存在性 oracle；必须同时具备学员 session、通用错误、无明文响应和有界限流。跨实例强限流保留为 runtime 残余，不作生产声明。
- `previewVersion` 只证明当前静态快照；确认仍必须以事务内事实和条件更新为权威，不能把 hash 当授权凭证。
- 若发现 P0 F-0004 的消费原子性本身回归，停止当前局部方案并重新冻结更大修复范围。

## 完成条件

- F-0132 的 server preview、显式升级目标与 transaction revalidation 由两轮对抗复核通过。
- 过期/已用/类型变化/多目标/已高级/错误目标/并发/响应丢失均有自动化证据。
- 聚焦测试、完整 unit、lint、typecheck、format、build、P0/P1/Module 门禁全部通过。
- evidence 明确保留 RV-0021 与单实例限流残余；独立提交、ff-only 合入、普通 push、清理后再进入下一 JIT finding。
