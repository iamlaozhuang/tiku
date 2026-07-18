# Employee Import Command Recovery Design

日期：2026-07-16

状态：三段设计已获用户批准；等待书面规格复核。本文不批准产品实现、迁移执行或真实数据库操作。

任务：`p1-remediation-rc-02-employee-creation-atomicity-2026-07-16`（F-0115）

## 1. 决策摘要

F-0115 的旧“双事务”根因已被 P0 关闭：当前新建员工在同一个 repository transaction 中写入
`auth_user`、`auth_account`、`user`、`employee` 和 quota reservation。剩余根因是批量第 N 行出现未知结果、
业务提交后审计失败、HTTP 响应丢失以及随机初始密码只存在于响应内存，导致调用方无法判定哪些行已提交，
也无法安全恢复一次性凭据。

采用持久命令与逐行 outcome，并将随机初始密码恢复定义为“换新”，而不是找回旧明文：

- 新增 `employee_import_command` 和 `employee_import_row`，持久化幂等身份、逐行终态和公开结果引用。
- 单个创建按一行 `single_create` 命令处理；批量导入按最多 500 行 `batch_import` 命令处理。两条入口共享同一恢复协议。
- 缺省密码创建时只提交不可知的随机占位凭据哈希；凭据分发动作再原子换新并只返回本次明文。
- 分发响应丢失后，运营查询当前版本并显式换新；旧密码随新版本提交立即失效。
- 不保存或加密保存手机号、姓名、输入密码、生成密码、原始文件或完整请求正文。
- 创建、绑定、quota、row outcome 和相应审计在同一事务中共同提交。
- `requireCurrentAuthorization: true` 是创建与绑定两条 quota reservation 路径的硬条件。

不采用以下方案：

1. 加密保存原始明文密码：扩大密钥、轮换、解密权限和泄漏面，不符合最小秘密原则。
2. 确定性派生密码：降低密码安全性，并把幂等键变成凭据恢复材料。
3. 捕获未知异常并记为 rejected：提交确认丢失时会把已成功行误判为失败。
4. 两阶段员工激活：产品语义和迁移范围更大；本轮可由占位凭据加受控换新满足同一安全属性。

## 2. 权威需求与边界

本设计落实以下当前需求：

- 员工写操作仅由 `ops_admin` / `super_admin` 执行；组织管理员首期只读员工名单、状态和授权摘要。
- 单建与导入都先显式选择目标 `organization`。
- 导入行只包含 phone、name 和可选 `initialPassword`；不得包含 `profession`、`level`、`edition`、
  `orgAuthScopePublicId` 或员工级授权白名单。
- 已有个人学员账号可绑定为员工，但不得覆盖原密码、个人授权或学习记录。
- 后台管理员账号域与学员/员工账号域不得复用手机号。
- 新建或启用员工必须在数据库事务中占用当前有效 `org_auth` quota；无当前授权或额度不足时不得提交员工。
- 缺省初始密码仅在分发窗口显示；普通列表、详情、日志、审计、证据和截图不得出现明文。
- API 使用 `/api/v1/`、kebab-case 路径、camelCase JSON、公开标识和 `{ code, message, data }` 外层。

来源包括：

- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md` 的 D04、D05
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md` 的
  `CT-REQ-009`、`CT-REQ-011`、`CT-REQ-043`、`CT-REQ-051`、`CT-REQ-054`
- `docs/01-requirements/traceability/2026-07-12-phone-visibility-and-prelaunch-ai-paper-history-decision.md`
- ADR-002 与 ADR-007

本轮非目标：

- 不实现企业管理员自助导入。
- 不新增依赖、环境变量、外部分发服务、Provider、PR、部署或 P2。
- 不执行 `drizzle-kit migrate`，不连接真实 PostgreSQL，不执行 21 项运行时验收。
- 不改变 `.xlsx` 解析能力；命令 API 接收已解析的最多 500 行。文件解析继续由既有预览边界负责。
- 不把本设计宣称为 RV-0018 的真实 PostgreSQL rollback、锁竞争或 commit-ack 验收。

## 3. 不变量

实现必须同时满足：

1. 对每一行，身份、账号、员工、quota、outcome 和成功审计共同提交或共同回滚。
2. `pending` 只表示没有权威终态；未知异常不得写成确定业务拒绝。
3. 相同幂等范围和相同规范化请求恢复同一命令；不同请求 hard-conflict。
4. 命令查询永不返回凭据明文；凭据明文只来自一次成功的换新事务响应。
5. 每次换新提高单调凭据版本；较旧响应和较旧确认不能生效。
6. 分发确认后，批次恢复入口永久关闭；后续密码处理走普通显式重置。
7. 员工已出现活跃 session、账号状态变化或凭据被普通重置后，批量换新整批失败关闭，不覆盖新状态。
8. 客户端状态只帮助定位和展示；数据库命令、row outcome、凭据版本和账号哈希才是权威事实。

## 4. 组件边界

### 4.1 Command service

负责 transport-independent 的编排：

- 验证命令 kind、目标组织、UUID v4 幂等键、行数和行输入。
- 生成规范化请求 HMAC，不记录原始值。
- 建立或恢复命令，顺序处理仍为 `pending` 的行。
- 把确定业务失败映射为稳定 rejection reason，把未知基础设施错误继续抛出。
- 聚合公开 DTO；不直接访问 Drizzle，不生成审计旁路写入。

### 4.2 Command repository

唯一拥有数据库事务和锁：

- 创建命令与行壳、幂等冲突检测、命令/行锁定和终态读取。
- 复用当前员工创建/绑定事务原语，把 row outcome 与业务副作用纳入同一事务。
- 在创建和绑定路径调用 `reserveEmployeeOrgAuthQuota(..., { requireCurrentAuthorization: true })`。
- 在同一事务插入脱敏 `audit_log`；审计写失败使对应状态与业务写共同回滚。
- 查询时用集合查询/聚合查询返回 rows 和 counts，不在关联读取中制造 N+1。

逐行顺序执行是最多 500 个独立写命令的产品语义，不是关联数据 N+1 读取。每行独立事务用于保留前序成功并使
未知行可恢复；查询和结果组装仍必须批量完成。

### 4.3 Credential distribution service/repository

- 服务在数据库锁外生成随机明文并以受限并发计算哈希，避免长时间持锁。
- repository 在一个事务中锁定 command、generated rows、employee、user、`auth_user` 和 `auth_account`，
  并按确定的 `auth_user` 顺序取得与登录创建 session 相同的
  `pg_advisory_xact_lock(hashtext(authUserId))`；随后复核状态、凭据基线、活跃 session 和 expected revision。
- 所有目标凭据、session 撤销、row 凭据基线、command revision、issue 标识与审计全成或全败。
- repository 只把本次事务收到的明文随结果返回，不把它写入数据库、审计或日志。

### 4.4 Routes and UI

- Route Handler 只做认证、transport 校验、service 调用、错误映射和标准响应。
- 现有 `/api/v1/employees` POST 与 `/api/v1/employees/import` POST 保留为薄兼容适配器，并委托同一 command service；
  两者同样强制 `Idempotency-Key`，返回 command-oriented DTO，不再自行追加员工审计，也不再返回同步生成密码数组。
- 运营 UI 使用独立 hook/service 管理命令状态和 revision；分发展示组件不拥有业务状态。
- 现有大型 `AdminOrgAuthRedeemPage` 只保留页面组合，命令恢复逻辑不得继续堆入该文件。

## 5. 数据模型

### 5.1 `employee_import_command`

| 字段                             | 约束与含义                                         |
| -------------------------------- | -------------------------------------------------- |
| `id`                             | BIGINT identity 主键；不对外暴露。                 |
| `public_id`                      | 唯一公开标识。                                     |
| `actor_admin_id`                 | 发起 `admin`，非空外键。                           |
| `organization_id`                | 目标 `organization`，非空外键。                    |
| `command_kind`                   | `single_create` 或 `batch_import`。                |
| `idempotency_scope_hash`         | 发起人、组织与原始幂等键的域分离 HMAC；唯一。      |
| `request_hash`                   | 规范化完整请求的 HMAC。                            |
| `row_count`                      | 1 至 500；`single_create` 必须为 1。               |
| `employee_import_status`         | `processing` 或 `completed`。                      |
| `credential_distribution_status` | `pending`、`not_required`、`open` 或 `confirmed`。 |
| `credential_revision`            | 从 0 开始的单调整数。                              |
| `current_issue_public_id`        | 当前有效分发 manifest 标识；首次分发前为 null。    |
| `completed_at`                   | 所有行终态时间，否则 null。                        |
| `distribution_confirmed_at`      | 当前 manifest 确认时间，否则 null。                |
| `created_at` / `updated_at`      | 带时区时间戳。                                     |

`idempotency_scope_hash` 使用原始 UUID v4 幂等键作为 HMAC key，消息包含固定版本域、actor public id 和
organization public id；`request_hash` 使用同一 key 对规范化请求计算 HMAC-SHA-256。原始幂等键不落库、不进日志，
也不需要新增环境 secret。规范化请求包含 command kind、目标组织和有序 rows，因此改行序、手机号、姓名或
`initialPassword` 都会产生冲突。哈希格式带固定版本前缀，后续算法升级不得静默重解释旧命令。

### 5.2 `employee_import_row`

| 字段                         | 约束与含义                                                          |
| ---------------------------- | ------------------------------------------------------------------- |
| `id`                         | BIGINT identity 主键。                                              |
| `public_id`                  | 唯一公开 row 标识。                                                 |
| `employee_import_command_id` | 所属命令外键。                                                      |
| `row_number`                 | 原输入行号；同一命令内唯一。                                        |
| `row_request_hash`           | 该行规范化输入 HMAC。                                               |
| `employee_import_row_status` | `pending`、`succeeded` 或 `rejected`。                              |
| `outcome_kind`               | 成功时为 `created` 或 `bound`，否则 null。                          |
| `rejection_reason`           | 拒绝时为稳定脱敏错误码，否则 null。                                 |
| `warning_reason`             | 例如 `initial_password_not_applied_to_existing_user`，否则 null。   |
| `credential_mode`            | 成功时为 `generated`、`provided` 或 `existing_account`，否则 null。 |
| `employee_id`                | 成功结果内部外键；API 通过 join 映射公开标识。                      |
| `credential_updated_at`      | generated 凭据最后一次受控写入基线；其他模式为 null。               |
| `created_at` / `updated_at`  | 带时区时间戳。                                                      |

数据库 check constraints 保证三种 row 状态与 outcome、rejection、employee、credential 字段一致。两张表都不保存
phone、name、`initialPassword`、原始请求或原始文件。成功结果通过 employee/user join 得到公开标识和脱敏展示；
拒绝结果只能用 row number 对应操作者仍持有的原始预览。

## 6. 状态机与数据流

### 6.1 提交或恢复

`POST /api/v1/employee-import-commands`

请求携带 `Idempotency-Key`，body 使用 camelCase：

- `commandKind`
- `organizationPublicId`
- 有序 `rows[{ phone, name, initialPassword }]`

流程：

1. 认证 `ops_admin` / `super_admin`，校验 command 外层和 1 至 500 行限制。
2. 在一个事务中按 `idempotency_scope_hash` 创建 command、rows 和 started audit；唯一冲突后读取既有命令。
3. 相同 `request_hash` 恢复；不同 hash 返回 `409 idempotency_request_mismatch`，且零业务写。
4. 已 rejected/succeeded 的行直接复用。对 pending 行先在锁外准备 provided 或随机占位凭据哈希，再进入行事务。
5. 行事务锁定 command 和 row，重新验证 row hash、手机号身份、目标组织和员工状态：
   - 新手机号：创建 auth/user/employee，并提交 provided 哈希或不可知占位哈希。
   - 已有未绑定学员：绑定 employee，不改原凭据；若输入了密码，返回显式 warning。
   - 确定冲突或校验失败：只提交 rejected outcome 与脱敏原因。
6. 创建/绑定成功必须在同一事务完成当前 `org_auth` quota reservation、row outcome 和成功 audit。
7. 最后一行成为终态时，同一事务把 command 置为 completed：存在 generated success 时 distribution 为 open，
   否则为 not_required，并写 completed audit。

POST 响应只返回命令、counts 和逐行公开结果，不返回生成密码。该 POST 可以用相同 key 和完整 payload 自动重试；
响应丢失、进程中断或 driver 在 commit acknowledgment 后抛错时，重放从持久终态继续。若事务实际回滚，row 仍为
pending；若实际提交，重放读到 succeeded/rejected。

### 6.2 查询

`GET /api/v1/employee-import-commands/{publicId}`

- 仅原发起人或 `super_admin` 可读取。
- 返回 command status、distribution status、revision、counts 和 rows。
- 每行返回 row number、status、outcome、warning/rejection 和公开 employee 标识；nullable key 显式返回 null。
- 不返回完整手机号、原始姓名、输入密码、生成密码、请求 hash 或幂等 hash。
- 所有响应带 `Cache-Control: no-store`。

### 6.3 换新分发

`POST /api/v1/employee-import-commands/{publicId}/issue-credentials`

body 包含 `expectedCredentialRevision`。动作只允许原发起人或 `super_admin` 对 completed + open 命令执行，且只处理
succeeded + generated rows。

1. 在锁外为全部目标生成新的随机初始密码及哈希；明文只保留在本次调用内存。
2. 事务锁定 command 和全部目标身份，按确定的 `auth_user` 顺序取得登录路径共用的 transaction advisory locks，再验证
   expected revision。相同锁把“登录复核密码并创建 session”与“检查 session 并换新凭据”串行化；哈希碰撞只增加串行，
   不改变授权语义。
3. 复核 employee 仍为 active、仍绑定原目标组织、`auth_account.updated_at` 与 row 的凭据基线一致。
4. 任一目标存在未过期 session、账号/组织/凭据已变化或目标缺失时，整批返回 409，零密码更新。
5. 原子更新全部密码哈希、撤销全部目标 session、更新每行凭据基线，把 revision 加一并生成新的
   `current_issue_public_id`，同时写脱敏 audit。
6. 成功响应返回 manifest：`issuePublicId`、`credentialRevision` 以及 rows 的 row public id、row number、employee public id、
   masked phone、name 和本次 `initialPassword`。

该动作禁止客户端自动重试。未知响应后先 GET：若 revision 未变化可重新发起；若已变化，运营必须显式点击“换新分发”，
以最新 expected revision 创建下一版。并发相同 expected revision 只能有一个成功，其他请求返回
`409 credential_revision_stale`。UI 只接受大于当前已见 revision 的 manifest，迟到旧响应立即丢弃。

### 6.4 确认分发

`POST /api/v1/employee-import-commands/{publicId}/confirm-distribution`

只允许原发起人或 `super_admin` 执行。body 包含当前 `issuePublicId` 和 `expectedCredentialRevision`。事务验证当前
manifest、凭据基线和 revision 后，把 distribution 置为 confirmed 并写 audit。相同 manifest/revision 的确认重放返回既有
成功；旧 manifest 返回 409。confirmed 后 issue 永久返回 `409 credential_distribution_closed`。后续密码处置只能走
普通显式密码重置。

## 7. 错误与审计语义

Transport 始终返回标准 envelope。业务分类：

- 403：身份或角色不允许。
- 404：命令不存在或 actor 不可见。
- 409：请求 hash 不同、revision 过期、manifest 过期、分发已关闭、活跃 session、账号/组织/凭据状态变化。
- 422：外层输入、行数或字段契约无效。
- 503：未知数据库/基础设施结果；message 脱敏，data 为 null。

确定的行级 rejection 包括 invalid row、organization missing、cross-domain phone conflict、cross-organization conflict、
disabled account 和 current authorization/quota insufficient。未知异常不创建 rejection。

审计规则：

- command started/completed、成功 create/bind、credential issued、distribution confirmed 都由 repository 在对应事务内写入。
- `audit_log.public_id` 在状态转换事务内生成并受唯一约束保护；锁定后的单次状态转换防止重放重复审计。
- metadata 只记录 command public id、counts、row number、action、revision 和脱敏 reason，不记录手机号、姓名、密码、
  HMAC、原始请求或文件内容。
- route 级旧 `appendEmployeeAuditLog` 不再包围 command 调用，避免业务提交后审计失败和重复日志。

## 8. UI 行为

- 继续使用目标组织先选、文件/表格预览、新建/绑定/跳过/阻断、quota 影响和确认流程。
- submit 前生成 UUID v4 幂等键；相同页面会话保留 key 和原始解析结果以便安全重放，但不把密码或行正文写入
  localStorage、sessionStorage、URL、日志或埋点。客户端副本不是权威事实。
- POST 可以同 key 自动重试；issue 不得自动重试。
- 命令 public id 可进入当前页面 URL 查询参数，便于刷新后查询已提交状态。若仍有 pending 行，操作者必须重新提供
  相同原始输入才能恢复；服务端用 HMAC 拒绝任何变化。
- 分发窗口显示当前 revision、复制动作和“已完成分发”确认；离开组件立即清除明文内存。
- command 完成且无需恢复，或操作者明确放弃未完成 command 时，立即清除原始解析结果、幂等键和其中的 provided
  `initialPassword`；页面卸载也执行同一内存清理。放弃只清理客户端副本，不改变数据库权威状态。
- 页面实现 loading、empty、error、conflict、processing、open 和 confirmed 状态；按钮保留项目既有交互反馈和 token。
- 既有 `generatedInitialPasswords` 同步响应字段废止，任何普通 list/detail/GET 都不再返回凭据。

## 9. 测试设计

### 9.1 Schema and contract

- 两张表、字段、外键、唯一索引、check constraints 和 snake_case 命名。
- 命令/row DTO 只使用 camelCase 与 public id，所有 nullable key 存在。
- schema 与生成迁移源文件不得包含明文 phone/name/password/request payload 列。
- API 统一 envelope、no-store、权限和兼容适配器委托。

### 9.2 Command service/repository

- 同 actor、organization 与 key 构成的幂等范围内，同请求恢复；手机号、姓名、密码、kind 或行序变化返回 409。
- actor 或 organization 变化会按域分离 HMAC 派生独立幂等范围，不属于既有 command 的 request mismatch。
- 并发创建同一幂等命令只产生一个 command 和一组 rows。
- 事务各副作用点注入失败时，auth/user/employee/quota/outcome/audit 全部回滚。
- 创建和绑定均断言 `requireCurrentAuthorization: true`；无覆盖当前授权不得提交 employee。
- 第 N 行确定拒绝保留前序成功并完成后续行。
- 第 N 行 unknown throw 保留前序终态、当前 pending；重放继续。
- 模拟 commit 已完成但 acknowledgment 丢失：重放读到终态，不重复账号、quota 或 audit。
- audit 写入失败使同一行或状态转换回滚。
- 已有 learner 绑定不改密码；提供 initialPassword 时返回明确 warning。

### 9.3 Credential distribution

- 首次 issue 从 placeholder 换新；数据库、audit、logs、GET 中无明文。
- issue 响应丢失后显式下一版换新，旧密码失效。
- 两个相同 expected revision 并发请求只有一个成功。
- 登录创建 session 与 issue 使用同一 advisory lock；无 session 检查和密码换新之间不得穿入新的登录 session，批量多锁按
  确定顺序获取以避免死锁。
- 旧 revision、旧 manifest、confirmed、active session、disabled/unbound/transferred employee、普通密码重置后的
  credential baseline mismatch 全部整批 409 且零更新。
- 成功换新与 session 撤销、row baseline、command revision、issue id、audit 全成或全败。
- 确认响应丢失后相同 manifest 可恢复；确认后批次 issue 关闭。
- UI 丢弃迟到旧 revision，不自动重试 issue，不持久化 plaintext。

### 9.4 Regression and adversarial review

聚焦测试至少覆盖 employee account service/repository、employee import runtime/route、组织授权 quota、用户运营 contract、
页面命令状态和 schema。随后执行任务队列声明的完整 unit、lint、typecheck、format、build、P0/P1/Module gates 和
`git diff --check`。

两轮对抗复核：

1. 需求、事务、quota、账号域与兼容路径完整性。
2. unknown-result、secret 生命周期、concurrency、旧响应、审计失败和权限/脱敏攻击面。

静态 fake 可证明编排与事务归属，但不能证明 PostgreSQL 在真实断连、锁竞争和 commit acknowledgment 丢失下的行为。
账号登录/session 建立与批量换新的 advisory lock 竞争、多账号锁顺序，以及 `auth_account.updated_at` 乐观基线在真实数据库
中的 CAS 行为也不能由静态 fake 证明。这些继续登记在 RV-0018，不以本轮静态绿灯冒充运行时关闭。

## 10. Migration、交付与治理

- 实施计划必须先把现有 task plan 的 no-schema stop condition 更新为本次用户批准的独立恢复设计范围。
- schema 变更使用 Drizzle schema 和 `drizzle-kit generate` 生成可审查迁移；禁止手写业务 SQL 和 `drizzle-kit push`。
- 本 Goal 只验证迁移源文件，不执行 migrate，不连接真实数据库。
- 不改 package.json、lockfile、env、Provider 或部署配置。
- 依用户批准的单次例外，本规格在隔离分支保持暂存但未提交，不合入、不推送；完成自审和用户书面复核后才调用
  `writing-plans`，最终折叠进 F-0115 单一产品提交。
- 实施前仍需对具体计划取得明确批准；计划必须按 TDD 先 RED 后最小实现。
- 最终历史保持一个 F-0115 可审查产品提交，并另有 ready 治理提交；当前暂存规格在合入前折叠进产品提交。
- ancestor checkpoint 仅适用于已通过 `transition_only` 的 `6bde2f2a` 治理提交。规格、实现、ready 或任何其他
  `in_progress` SHA 漂移都不得获得该例外，必须继续 hard-block，直到各自满足精确 checkpoint/closeout 门禁。

## 11. 完成判据

只有以下条件全部有新鲜证据时，F-0115 才能做静态关闭：

1. 单建和批量都委托持久 command 协议。
2. create/bind/current `org_auth` quota/outcome/audit 同事务。
3. unknown result 可通过重放恢复，不产生错误 rejection、重复账号或重复 quota。
4. generated credential 只以 placeholder + versioned rotate 方式分发，响应丢失可安全换新。
5. 查询、日志、审计、证据、普通 UI 和持久存储均无密码明文。
6. 版本、session、账号状态、普通 reset 和并发冲突全部 fail closed。
7. 聚焦与完整静态门禁、两轮对抗复核、证据、独立提交、ff-only 合入、授权 push 和隔离清理完成。
8. RV-0018 继续明确标注为未执行的真实数据库验收，不作越界声明。
