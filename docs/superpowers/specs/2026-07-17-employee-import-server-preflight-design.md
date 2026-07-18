# Employee Import Server Preflight Design

日期：2026-07-17

状态：方案 A 已获用户批准，等待书面规格复核

任务：`p1-remediation-rc-02-employee-import-preflight-2026-07-17`

## 目标

关闭 F-0116 的两个当前残留：员工页缺少单个创建入口；批量导入仍由浏览器承担解析和聚合近似预览，无法在确认前得到与最终写入一致的服务端逐行事实。

本设计复用 F-0115 已落地的原子导入命令、逐行终态、幂等恢复与一次性密码分发，不重建事务或 secret recovery 体系。

## 当前事实

- `employee-import-command` 已支持 `single_create | batch_import`、最多 500 行、逐行 `created | bound | rejected`、revision-bound 密码分发和 no-store API。
- 员工页只有“批量导入员工”，没有单建入口。
- `AdminOrgAuthRedeemPage.tsx` 在浏览器解析 CSV/TSV、重建 `rows`，并用已加载的 `orgAuths` 聚合估算授权与 quota；这不是逐行服务端 preflight。
- 当前 command submit 直接执行写入，不存在 review-before-confirm 的 preview revision。

## 方案

### 1. 单一服务端语义所有者

新增共享的服务端 import source parser。浏览器只读取并原样发送 `content`、`sourceFormat` 与目标 `organizationPublicId`，不得拆行、重排字段或重写 CSV/TSV 语义。

parser 必须处理 UTF-8 BOM、CSV/TSV、quoted comma、escaped quote、quoted CR/LF；必须拒绝未闭合引号、quote 后非法字符、重复/缺失必需表头、额外未知列、空数据和 501 行。模板只允许 `phone`、`name`、可选 `initialPassword`。

### 2. 统一 preflight

单建与批量导入都进入同一 preflight service：

- 单建把目标组织、phone、name、可选 initialPassword 映射为一行规范化输入；
- 批量导入由服务端 parser 生成规范化行；
- repository 用集合读取而非逐行 N+1，计算每行 `new | bind | skip | block`；
- 返回 rowNumber、maskedPhone、name、outcome、redactedReason、credentialMode、inheritedAuthorizationSummary、quotaImpact，以及整体 counts；
- 响应不得返回完整手机号、密码、内部自增 id、原始 source 或授权内部行。

`skip` 只表示无需写入的确定性结果，例如同一目标组织已有有效 employee 绑定；账号禁用、跨账号域、跨组织、组织/授权不存在、quota 不足、重复或非法行均为 `block`，原因使用稳定枚举和用户可读脱敏文案。

### 3. preview revision 与确认

preflight 返回不具授权能力的 opaque `previewRevision`。它由规范化输入与当前逐行 preflight 事实的稳定 canonical digest 形成；revision 不是鉴权凭证，最终权限和事务检查仍由服务端执行。

确认请求重新提交原始 source（或单建字段）和 `expectedPreviewRevision`。服务端必须重新解析、重新 preflight：

- revision 不同：返回 `409`、最新安全 preview，零写入；
- 存在 block：返回 `422`，零写入；
- revision 一致且无 block：把规范化行交给现有 F-0115 command service；
- preflight 后到事务提交前发生变化：现有原子 repository 继续做 JIT 锁与校验，形成安全的逐行部分终态，不把 stale preview 当作写入授权。

同一 preview revision 可在确认调用丢失时结合现有 idempotency key 恢复同一 command，不新增持久 preview 表或 schema。

### 4. UI 信息架构

员工区保留一个主任务区域，提供两个明确动作：`单个创建员工` 与 `批量导入员工`。

- 单建 drawer：目标组织、手机号、姓名、可选初始密码，先 preflight 后确认。
- 批量 drawer：选择组织、下载模板、上传/粘贴原始内容、请求服务端 preview、逐行结果、确认导入。
- preview 必须显示 new/bind/skip/block 数量、逐行脱敏状态、继承授权与 quota 影响；disabled confirm 同屏说明原因。
- 写入完成后继续复用 `EmployeeImportCommandPanel` 展示逐行终态和一次性密码分发。
- loading、empty、error、stale、quota blocked 与 permission denied 使用现有 Token 和状态语义，不新增硬编码视觉值。

### 5. API 与错误合同

- `POST /api/v1/employee-import-commands/preview`：返回标准 `{ code, message, data }` 与 `Cache-Control: no-store`。
- `POST /api/v1/employee-import-commands`：批量确认增加 `expectedPreviewRevision` 与原始 source；单建确认同样要求 preview revision。
- `409`：preview stale 或现有 idempotency conflict；错误码必须可区分。
- `422`：输入/解析错误或当前 preview 包含 block。
- `401/403`：现有 session/role 边界；仅 `ops_admin | super_admin`。
- `503`：安全可恢复的不可用结果，不暴露异常或原始内容。

### 6. 对抗测试

RED 必须证明：

1. 页面存在可达单建入口，且单建/批量都必须先 preflight。
2. 浏览器发送原始 source，不包含业务 parser 或重写后的 rows。
3. quoted comma、escaped quote、quoted newline、CRLF、BOM、TSV 行号保持一致。
4. 500 行通过、501 行拒绝；未知/重复/禁止授权表头 fail-closed。
5. new/bind/skip/block、账号域冲突、跨组织、disabled、重复 phone、授权/quota 不足逐行脱敏。
6. preview 后账号、组织、授权或 quota 变化返回 409 且零写入。
7. preflight 后竞争仍由 F-0115 事务层安全拒绝或形成可解释部分结果。
8. GET/preview/confirm 不泄露完整手机号、initialPassword、raw source、内部 id；明文只在现有成功分发窗口出现。
9. 非 `ops_admin | super_admin`、错误 target、错误 revision、重放和响应丢失均 fail-closed 或可恢复。

## 非目标与停止条件

- 不新增/修改 schema、migration、依赖或 env；不执行真实数据库、Provider、browser/e2e、P2、PR、force push 或部署。
- 不实现 `.xlsx` 二进制解析；本任务继续使用已批准的 CSV/TSV 等效 tabular input 与模板。
- 不改变 F-0115 command 的原子性、幂等和一次性分发语义。
- 若 preview correctness 必须依赖持久 preview 表、migration、外部缓存或真实 DB 验收，立即停止并请求独立批准。
- RV-0018 继续 pending；本任务只声明 static level closure。

## 规格复核门禁

本文件提交后必须由用户书面复核。复核通过后才允许调用 `superpowers:writing-plans` 编制实现计划并开始产品 RED；未经复核不得写产品代码。
