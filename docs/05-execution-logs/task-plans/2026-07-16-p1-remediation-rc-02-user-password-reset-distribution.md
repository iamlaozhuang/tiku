# P1 RC-02 用户密码重置一次性分发整改方案

日期：2026-07-16

任务：`p1-remediation-rc-02-user-password-reset-distribution-2026-07-16`

分支：`codex/p1-rc02-user-password-reset-distribution`

工作树：`D:/tiku/.worktrees/p1-rc02-user-password-reset-distribution`

## 目标

即时深复检并修复 F-0108：平台运营或超级管理员重置学员员工密码时，密码必须由服务端生成，客户端不能选择或保留长期凭据；成功响应只在 `no-store` 的一次性分发窗口中返回当前密码，并继续撤销目标用户会话和写入脱敏审计。

## 已读取规范与权威来源

- `AGENTS.md`、品味十诫、术语表及全部 ADR；重点 ADR-002、ADR-004、ADR-006、ADR-007。
- 标准需求索引、用户认证模块/故事、高级版索引、授权需求及相关员工/运营模块。
- 2026-07-02 role/auth/training/ops decision package 的 D05、CT-REQ-046、CT-REQ-054，以及现行 UI/UX 基线。
- P1 finding ledger、post-P0 map、P1-RC-02 候选根因、F-0108 原始只读审计记录与 RV-0016 入口。
- 当前 production UI、validator、runtime service、repository、合同、测试，以及管理员账号密码重置的一次性分发类比实现。

## 第一性原理与 JIT 结论

密码重置的安全边界不是“管理员能否成功写入一个密码”，而是“管理员是否能选定并持续知道用户的长期认证秘密”。当前用户重置弹窗要求运营手工输入 `newPassword`，服务端直接 hash 该值，成功响应不提供一次性分发结果；因此运营可预先保留长期凭据，F-0108 仍为 `confirmed`。

正确最小闭环必须满足：

1. 用户密码由服务端使用现有高熵生成器产生，客户端请求体不能选择最终凭据。
2. 只有成功响应的标准 envelope `data` 可携带明文，且响应设置 `Cache-Control: no-store`；错误、日志与审计不得携带明文。
3. UI 不再采集密码，只在内存显示最近一次成功结果，支持显式关闭；新重置覆盖旧结果，刷新自然清除。
4. 现有 `operations` / `super_admin` 权限边界、目标身份验证、session 撤销和脱敏审计保持不变。

D05 明确首版不强制首次登录修改密码，因此本任务不引入该行为。F-0030 的密码写入与 session 撤销原子性是独立 finding，本任务不得借机扩域。

## 实现方案

1. 先写 RED 测试，固定客户端密码不可控、成功响应 `no-store`、一次性结果 DTO、会话撤销/审计脱敏和 UI 无密码输入。
2. 将既有管理员账号密码生成依赖泛化为用户和管理员账号共享的 `createOneTimePassword`，保持默认密码强度与可注入测试能力。
3. 用户重置 runtime 不再解析 `newPassword`；服务端生成密码后调用既有 repository 重置并撤销 session，成功返回现有 `AdminUserPasswordResetResultDto`。
4. 删除失去用途的用户密码重置输入 validator；不修改 schema、repository 持久化语义或外部接口依赖。
5. UI 将确认弹窗改为无密码输入的风险确认，成功后仅渲染当前一次性密码区域；关闭、新成功和页面刷新均不保留旧秘密。

## TDD 与对抗式验证

### RED

- service 测试证明当前请求仍接受运营自选密码、响应无一次性数据且缺少 `no-store`。
- UI source/行为测试证明当前仍存在密码输入和 `{ newPassword }` 请求体，且没有用户一次性分发窗口。
- 回归测试固定管理员账号密码重置、权限拒绝、用户不存在、session 撤销与审计脱敏。

### GREEN

- 只实现 F-0108 的服务端生成和一次性显示闭环；不新增 schema、migration、依赖、reset token、邮件/短信或首次登录强制改密。
- 继续使用标准 API envelope、camelCase DTO、public id、Design Tokens 与现有密码 hash/repository 入口。

### Round 1

主审逐层攻击 UI → runtime service → repository：客户端 body 注入、失败响应泄密、Cache-Control 缺失、旧秘密残留、并发成功覆盖、session 未撤销、审计 metadata 含密码、角色边界扩大及管理员账号重置回归。

### Round 2

在实现与完整门禁通过后执行独立只读审查，重点寻找 operator-controlled credential、secret 出现在 toast/log/audit、UI 同时保留多个秘密、错误路径返回 secret、首次登录强制行为或 F-0030 扩域。审查不得写文件、执行真实 DB/runtime/browser、读取 secret 或修改只读审计仓库。

## 允许文件

以 `task-queue.yaml` 当前任务 `allowedFiles` 为唯一清单，覆盖五份治理文件、用户重置 UI/runtime/合同/validator 及六个聚焦测试文件。

## 禁止范围

- schema、migration、seed、依赖、lockfile、env/secret、真实 DB、Provider、browser/e2e/runtime acceptance。
- reset token、邮件/短信、首次登录强制改密、F-0030 原子性重构、P2、其他 P1 finding、PR、force push 与部署。
- 真实密码、账号、内部 id 或原始 DB 行进入 evidence、audit、日志或提交文档。

## 风险与停止条件

- 若正确关闭必须改 schema、引入 reset token/外部分发服务或修复 F-0030 原子性，立即停止并请求独立任务授权。
- 一次性分发是 UI/响应可见性语义，不宣称密码只能被网络层读取一次；`no-store`、内存状态、刷新清除与脱敏审计是当前静态边界。
- 若现有 repository 在用户不存在或撤销失败时会产生部分密码写入，记录为 F-0030 证据，不在 F-0108 中扩域。

## 完成条件

- F-0108 的服务端生成、客户端不可控、`no-store` 一次性分发、session 撤销与审计脱敏由两轮对抗复核通过。
- 聚焦测试、完整 unit、lint、typecheck、format、build、P0/P1/Module 门禁全部通过。
- evidence 明确保留 F-0030 与 RV-0016；独立提交、ff-only 合入、普通 push、清理后才进入下一 JIT finding。
