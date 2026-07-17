# P1 RC-02 员工解绑成员生命周期整改方案

日期：2026-07-16

任务：`p1-remediation-rc-02-employee-unbind-lifecycle-2026-07-16`

分支：`codex/p1-rc02-employee-unbind-lifecycle`

工作树：`D:/tiku/.worktrees/p1-rc02-employee-unbind-lifecycle`

## 目标

即时深复检并修复 F-0114：解绑后保留 `employee` 行只作为历史身份，不得继续投影为当前组织成员；用户必须可受控再入职；旧组织未提交企业训练必须停止，且与解绑并发的保存/提交不能在解绑后重新写回 `in_progress`。

## 已读取规范与权威来源

- `AGENTS.md`、术语表、品味十诫及全部 ADR；重点 ADR-002 与 ADR-007。
- 标准需求索引、`modules/01-user-auth.md`、`stories/epic-01-user-auth.md` 的 US-01-12。
- 高级版索引、edition-aware authorization、企业训练、组织统计、运营授权与额度相关 module/story。
- 2026-07-02 decision package D05/D15/D29、CT-REQ-043/054、运营授权、企业训练与组织统计 UI/UX 合同。
- P1 finding ledger、post-P0 map、P1-RC-02 根因簇、F-0114 原始只读审计证据与 RV-0018 至 RV-0021 入口。
- 当前解绑、再绑定、quota、session、组织门户、运营用户详情、企业训练 repository 与对应测试。

## 第一性原理与 JIT 结论

当前成员关系的权威状态不是“是否存在历史 `employee` 行”，而是 `user.user_type = employee` 与当前组织绑定、quota reservation 的一致组合。解绑必须保留用户、历史答题和组织快照，因此不能把删除 `employee` 行作为最小修复。

post-P0 已关闭原失效路径的主要部分：解绑在同一事务内释放 quota、切换为 `personal`、撤销 session 并把旧组织 `in_progress` 训练改为 `read_only`；手机号查询把非 employee 的残留行映射为未绑定；再绑定会复用该行并更新组织、重新占用 quota。

F-0114 仍为 `confirmed_residual`：

1. 组织门户总数/状态汇总仍直接统计全部 `employee` 行，而预览只统计 `user_type = employee`，解绑用户继续造成总数与名单分叉。
2. session 与运营用户列表/详情仍可把 `personal` 用户的历史 employee/organization 行投影为当前绑定。
3. 企业训练 save/submit 在 lineage 校验后另开事务写入；它未与解绑使用同一 employee identity lock，也未在写事务中重验当前成员关系，存在解绑完成后旧请求重新创建/更新 `in_progress` 的 TOCTOU 路径。

## 实现方案

1. 先写 RED：固定组织门户 summary 必须筛当前 employee、personal session/运营详情不得返回历史绑定、训练写事务必须先锁 employee identity 并重验当前组织成员。
2. 统一当前成员投影：`user_type !== employee` 时 session 与运营当前绑定字段返回 `null`；组织门户 summary 与 preview 使用相同当前成员谓词。
3. 保持 P0 既有解绑/再绑定事务语义，补自动化测试锁定 retained employee row 的受控复用、quota/session/read-only 行为。
4. 企业训练 draft save 与 submit 在 answer lock 前取得与解绑相同的 employee identity lock，并在同一事务重验 employee id/public id、organization id、active employee user；失败返回 conflict，不写入。
5. 不引入 membership schema、历史表、migration 或数据库执行；`user_type` 继续作为首版显式当前成员状态。

## TDD 与对抗式验证

### RED

- 组织门户 summary SQL 缺少 `user_type = employee`。
- personal session/运营详情仍暴露 stale employee/organization public id。
- 企业训练 answer transaction 未调用 shared employee identity lock，且没有事务内 current-membership recheck。

### GREEN

- 仅修正当前成员读模型与训练写入串行边界；不改变历史快照、已提交训练、个人授权、quota 模型或角色权限。
- 保持标准 API envelope、public id、camelCase DTO、service/repository 分层及现有审计脱敏。

### Round 1

攻击 unbind/rebind、session 重建、运营列表/详情、门户总数/预览、训练 draft/submit 的顺序与并发交错；检查重复解绑、跨组织解绑、quota 不足、disabled user、已提交训练和个人授权回归。

### Round 2

实现与完整门禁通过后执行独立只读审查。重点寻找只修 UI 计数但仍泄露当前组织上下文、锁顺序死锁、TOCTOU 重开训练、误删历史 employee/answer、跨 finding/schema 扩域。审查不得写文件、执行真实 DB/runtime/browser、读取 secret 或修改只读审计仓库。

## 禁止范围与停止条件

- 禁止 schema、migration、seed、依赖、lockfile、env/secret、真实 DB、Provider、browser/e2e/runtime acceptance、P2、PR、force push 与部署。
- 禁止物理删除 `employee`、删除历史答题/报告/训练、改变授权并集或组织管理员写权限。
- 若关闭必须引入 membership 历史表、执行数据库迁移或合并其他 finding，立即停止并请求独立授权。

## 完成条件

- F-0114 的当前成员投影、可再入职、门户一致性、session/运营绑定清理及训练写入串行由两轮对抗复核通过。
- 聚焦测试、完整 unit、lint、typecheck、format、build、P0/P1/Module 门禁全部通过。
- evidence 保留 RV-0018 至 RV-0021；独立提交、ff-only 合入、普通 push、清理后才进入下一 JIT finding。
