# Advanced Edition AI Generation Design

## Purpose

本文档沉淀 2026-06-05 本轮脑力风暴中已经确认的产品与架构决策，用于指导后续标准版/高级版、AI 出题、AI 组卷、企业学习运营后台、授权升级和额度治理的详细设计与实现拆分。

本文是设计决策记录，不是实现批准。后续如涉及数据库 schema、迁移、API、服务、UI、依赖、环境变量、AI provider、部署或真实企业数据，必须另起任务方案并按项目门禁审批。

## Conversation Preconditions

本轮讨论开始前，已经确认以下推进前提：

- 当前项目适合在受控方式下继续推进新功能，但不适合直接大范围开写。
- 后续应先设计、再拆任务、再实现；设计需要与已有需求、ADR、术语表、API contract 和现有代码分层衔接。
- 已完成一次项目完整备份，采用“排除可重建目录 + 备份数据库 + 备份 env”的方案。
- 备份目录为项目外部路径 `D:\tiku-backups\20260605-084718`。
- 备份中包含 workspace 副本、Git bundle、数据库 dump、`.env.local`、Git 状态文件、manifest 和恢复指南。
- 备份已经复查并通过验收，但备份不等于可以无门禁开发；后续仍应遵守分支、验证、证据和审批要求。
- 本文只记录产品与架构设计决策，不移动、读取或修改备份内容。

## Iteration And Git Governance

本轮讨论确认可以使用 Git 管理项目迭代，并用不同分支控制风险：

- `master` 作为已验证基线，不直接承载未完成新功能开发。
- 后续部署线可以从现有已验证实现单独拉出，例如 `release/staging-deploy` 或后续按项目实际约定命名的 release 分支。
- 新模块开发使用短生命周期功能分支，例如 `codex/...`、`feat/...`、`fix/...`。
- 部署线不混入未完成新功能；新功能线不影响已验证基线的后续部署。
- 每个功能或设计任务都应有任务方案、验证 evidence 和可审查变更。
- 未获得明确批准前，不 push、不部署、不合入生产或预览环境。

该治理方式可行，且与项目现有半自动化推进纪律一致。它的目标是让“现有实现可继续部署”和“新模块继续迭代”并行存在，而不是把标准版和高级版拆成长期分叉代码。

## Design Governance

本轮讨论确认高级版和 AI 能力需要先做细致设计，不能直接进入实现。

设计维护方式：

- 采用脑力风暴方式逐个问题讨论。
- 每轮已确认结论都写入决策记录。
- 未确认的问题进入 follow-up decision queue。
- 每次整理后执行自检，检查遗漏、矛盾、越界和命名不一致。
- 后续实现前再拆成更小的设计文档、API contract、数据 contract 和任务方案。

设计衔接要求：

- 与已有标准版能力衔接，而不是重写现有系统。
- 与当前正式内容域、练习、模拟考试、报告、错题本保持边界。
- 与 `authorization`、`redeem_code`、`org_auth`、`personal_auth` 等已有授权概念保持术语一致。
- 与 ADR-002 的服务分层保持一致。
- 与 ADR-004/ADR-005 的环境隔离和 release boundary 保持一致。
- 与企业组织层级、员工学习统计和正式题库内容管理建立清晰边界。

## Existing Architecture Fit

本设计继续遵守现有 Tiku 架构边界：

- 单代码库、单 Next.js/TypeScript 单体，不拆成标准版/高级版两套代码。
- 按 ADR-002 的 `route handlers / server actions -> service -> repository -> model` 分层落地。
- REST API 继续使用 `/api/v1/`、kebab-case 复数资源路径、camelCase JSON 字段和 `{ code, message, data, pagination? }` 响应结构。
- 数据库命名继续使用 glossary 中的术语和 snake_case 字段。
- AI/RAG、授权、审计、日志、额度、组织层级判断应由 service 层统一封装；前端菜单隐藏不是安全边界。
- dev/staging/prod 继续严格隔离；本文不授权 staging/prod/cloud/provider 操作。

## Edition Model

### Confirmed Decisions

- 高级版能力按企业/用户授权开通，不按部署实例开通。
- 生成 `redeem_code` 时，可以明确指定 `edition` 为 `standard` 或 `advanced`。
- 给企业开通 `org_auth` 时，可以明确指定 `edition` 为 `standard` 或 `advanced`。
- 标准版和高级版用于运营定价区分。
- 标准版可以升级为高级版。
- 升级只补齐高级版能力，不改变原授权有效期。
- 延长高级版时间属于续费或新购，不属于升级。
- 授权版本字段使用 `edition`，首期枚举为 `standard | advanced`。
- `advanced` 包含 `standard` 全部能力。
- AI 出题、AI 组卷、企业训练内容管理首期属于 `advanced`。
- 企业学习运营后台基础统计能力属于标准版企业授权，但总运营后台可以对某个企业是否开放企业后台设置开关。
- 不在首期引入 capability 列表。能力判断由服务层集中封装，避免每个页面或 API 自己拼规则。

### Design Implication

首期可以把 `edition` 作为产品授权的主轴，把“是否开放企业后台”作为企业层面的独立运营开关。这样可以同时满足：

- 标准版企业可购买基础企业学习统计后台；
- 高级版企业在标准版基础上增加企业 AI 出题、AI 组卷和企业训练内容管理；
- 个人用户和员工也可以通过授权获得高级版 AI 学习能力；
- 后续如果出现更细粒度能力包，再从统一 service 层扩展，不急于在首期做 capability 系统。

## Authorization Upgrade

### Confirmed Decisions

- 升级采用“保留原授权 + 新增升级记录”，不覆盖原授权。
- 升级记录命名采用 `auth_upgrade`，语义为标准版授权升级高级版记录。
- 个人标准版升级高级版首期通过 `edition_upgrade` 类型的升级卡密处理。
- 个人升级成功后创建 `auth_upgrade`，不创建新的 `personal_auth`。
- 个人升级后的有效期继承被升级 `personal_auth.expires_at`。
- 企业标准版升级高级版首期由平台运营后台对整条 `org_auth` 人工升级。
- 企业员工不能使用个人卡密升级企业授权。
- 企业管理员首期只展示“联系平台升级”。
- 升级记录首期不绑定订单/支付，只记录运营备注、外部引用、操作人和审计。
- 升级到期后按有效授权重新计算：`auth_upgrade` 到期但原 `standard` 仍有效，则回落 `standard`；另有有效 `advanced` 授权，则保持 `advanced`。

### DTO Guidance

对外展示授权时需要区分原始版本和有效版本：

- `edition`：原始授权版本，例如 `standard`。
- `effectiveEdition`：综合授权、升级记录和有效期后计算出的当前有效版本，例如 `advanced`。
- `upgradeStatus`：例如 `none | active | expired`。
- `upgradeExpiresAt`：升级有效期；无升级时返回 `null`。
- `isUpgraded`：可选便捷字段，首期可由前端根据 `edition` 和 `effectiveEdition` 推导。

service 层鉴权和前端展示都应以 `effectiveEdition` 为准，审计和运营追溯则同时保留 `edition` 与升级记录。

### Auth Upgrade Data Contract

`auth_upgrade` 采用“独立升级记录 + 不改原授权 + 动态计算 `effectiveEdition`”模型。本节为需求级数据契约，不是数据库迁移或实现批准。

`auth_upgrade` 建议记录以下内部字段；字段名按数据库/数据契约使用 `snake_case`，后续 API DTO 需要另行映射为 `camelCase`：

- `public_id`：升级记录对外追踪标识。
- `target_auth_type`：被升级授权类型，枚举为 `personal_auth | org_auth`。
- `target_auth_public_id`：被升级 `personal_auth` 或 `org_auth` 的公开标识。
- `from_edition`：升级前授权版本，首期固定为 `standard`。
- `to_edition`：升级后目标版本，首期固定为 `advanced`。
- `starts_at`：升级生效时间。
- `expires_at`：升级到期时间，继承被升级授权的 `expires_at`。
- `status`：升级记录状态，枚举为 `active | expired | revoked`。
- `source_type`：升级来源，枚举为 `edition_upgrade | ops_manual`。
- `redeem_code_public_id`：个人升级卡密来源；企业人工升级时为 `null`。
- `external_reference`：运营侧外部引用，例如线下审批单号；无则为 `null`。
- `ops_note`：运营备注；无则为 `null`。
- `created_by_type`：创建操作者类型，例如 `student_user | ops_admin | system`。
- `created_by_public_id`：创建操作者公开标识；系统自动创建时可为 `null`。
- `created_audit_log_public_id`：创建升级记录对应的 `audit_log` 标识。
- `revoked_at`：人工回退或撤销时间；未撤销时为 `null`。
- `revoked_by_type`：撤销操作者类型；未撤销时为 `null`。
- `revoked_by_public_id`：撤销操作者公开标识；未撤销时为 `null`。
- `revoked_audit_log_public_id`：撤销动作对应的 `audit_log` 标识；未撤销时为 `null`。
- `revocation_reason`：撤销原因；未撤销时为 `null`。
- `created_at`：创建时间。
- `updated_at`：最后更新时间。

状态规则：

- `active`：`starts_at <= now < expires_at` 且未撤销。
- `expired`：`expires_at <= now`，可由时间计算得到；后续实现可选择持久化或查询时计算，但对外语义必须一致。
- `revoked`：平台运营人工回退或撤销后进入该状态；撤销不得物理删除升级记录。

唯一性与幂等规则：

- 同一 `target_auth_type + target_auth_public_id + to_edition` 在同一有效窗口内只能存在一条未撤销的有效升级记录。
- 重复提交同一 `edition_upgrade` 卡密不得创建多条 `auth_upgrade`。
- 同一 `redeem_code_public_id` 成功兑换后只能绑定一条 `auth_upgrade`。
- 如果目标授权已经是有效 `advanced`，不得再为同一授权创建无意义的 `standard -> advanced` 升级记录。

审计关系：

- 创建、撤销、到期回落的关键判断都必须可审计。
- 个人升级不得在日志、evidence 或审计展示中记录明文 `redeem_code`，只能记录卡密公开标识或安全摘要。
- 企业人工升级必须记录平台运营操作者、运营备注或外部引用，并写入 `audit_log`。
- 撤销升级只改变 `auth_upgrade` 状态和撤销字段，不修改原 `personal_auth` 或 `org_auth`。

`effectiveEdition` 计算规则：

- 只有目标授权本身仍有效，且存在未撤销、未过期的 `auth_upgrade` 时，才可将 `standard` 计算为 `advanced`。
- `auth_upgrade` 到期或撤销后，若原授权仍有效且没有其他有效 `advanced` 授权，则回落为 `standard`。
- 另有独立有效 `advanced` 授权时，`effectiveEdition` 仍保持 `advanced`，但不能把该结果反写覆盖原 `standard` 授权。

### Edition Upgrade Redeem Code Relationship

`edition_upgrade` 定稿为 `redeem_code` 的一种类型，而不是独立卡密体系。本节为需求级数据关系说明，不是数据库迁移或实现批准。

关系规则：

- `redeem_code` 继续作为所有卡密的统一治理实体。
- `edition_upgrade` 通过 `redeem_code_type` 或等价类型字段表达，语义为“标准版授权升级高级版的卡密”。
- 普通开通授权卡密和升级卡密共享卡密生成、发放、过期、防重复兑换、兑换审计和安全展示规则。
- `edition_upgrade` 卡密兑换成功后不创建新的 `personal_auth`，只创建一条 `auth_upgrade`。
- `edition_upgrade` 卡密首期仅用于个人标准版升级高级版，不用于企业授权升级。
- 企业员工不得使用个人 `edition_upgrade` 卡密升级企业 `org_auth`。
- 企业 `org_auth` 升级首期仍由平台运营后台人工处理，并通过 `auth_upgrade.source_type = ops_manual` 记录。
- `edition_upgrade` 卡密必须绑定可升级范围，至少包括 `profession`、`level` 和目标 `to_edition = advanced`。
- 兑换时必须找到同一用户、同一 `profession + level` 下仍有效的 `standard` `personal_auth`，否则兑换失败，不创建 `auth_upgrade`。
- 如果用户已经通过有效 `personal_auth` 或有效 `auth_upgrade` 获得同一 `profession + level` 的 `advanced`，不得重复消耗 `edition_upgrade` 卡密。
- 兑换成功后，`auth_upgrade.redeem_code_public_id` 记录来源卡密公开标识；日志、evidence 和审计展示不得记录明文卡密。

卡密类型边界：

- `edition_upgrade` 只负责触发升级，不代表新的授权主体。
- 升级事实以 `auth_upgrade` 为准。
- 有效版本以 service 层计算出的 `effectiveEdition` 为准。
- 卡密兑换记录、`auth_upgrade` 和 `audit_log` 三者需要能互相追溯，但不得通过外部 URL 暴露自增主键。

### Organization Manual Upgrade Operation

企业人工升级首期采用“运营人工升级 + 外部审批引用 + 审计 + 可撤销”的轻量审批记录模型。本节为需求级运营交互说明，不是后台实现或权限模型变更批准。

操作入口：

- 仅平台运营管理员可在平台运营后台发起企业 `org_auth` 升级。
- 企业管理员首期不能自助升级，只展示“联系平台升级”。
- 企业员工不能使用个人 `edition_upgrade` 卡密升级企业 `org_auth`。

升级前校验：

- 目标 `org_auth` 必须存在且仍有效。
- 目标 `org_auth.edition` 必须为 `standard`，且当前没有同一 `org_auth` 未撤销、未过期的 `advanced` `auth_upgrade`。
- 平台运营管理员必须能看到目标 `organization` 与目标 `org_auth` 的授权范围。
- 升级动作必须二次确认，确认内容至少包括企业名称、`profession`、`level`、当前 `edition`、目标 `edition`、原授权到期时间和升级到期时间。

必填运营记录：

- `external_reference`：外部审批、合同、工单或人工确认记录编号。
- `ops_note`：升级原因或运营备注。
- `created_by_type = ops_admin`。
- `created_by_public_id`：平台运营管理员公开标识。
- `created_audit_log_public_id`：创建动作对应的 `audit_log` 标识。

升级结果：

- 创建 `auth_upgrade`，其中 `target_auth_type = org_auth`，`source_type = ops_manual`，`from_edition = standard`，`to_edition = advanced`。
- `auth_upgrade.expires_at` 继承被升级 `org_auth.expires_at`。
- 不修改原 `org_auth.edition`，不创建新的 `org_auth`。
- 企业有效版本由 service 层通过 `effectiveEdition` 计算。

回退与撤销：

- 平台运营管理员可撤销企业人工升级，但必须填写 `revocation_reason`。
- 撤销只更新 `auth_upgrade.status = revoked` 以及 `revoked_at`、`revoked_by_type`、`revoked_by_public_id`、`revoked_audit_log_public_id`、`revocation_reason`。
- 撤销不得物理删除 `auth_upgrade`，也不得修改原 `org_auth`。
- 撤销后如果没有其他有效 `advanced` 授权或升级记录，企业 `effectiveEdition` 回落为 `standard`。
- 已经因企业高级版产生的历史 AI 任务、额度消耗、审计和统计不回滚；撤销只影响后续高级能力访问。

首期暂缓：

- 不做完整双人审批流。
- 不做企业管理员自助申请升级。
- 不做自动支付、订单或合同系统绑定。
- 不做升级后的自动消息触达，相关提示和通知规则留待后续决策。

### Upgrade Prompt And Notification

标准版升级高级版的用户端提示、企业端提示和运营通知定稿为“可见但不可用 + 明确升级入口 + 运营后台可追踪通知”模型。本节为需求级提示与通知 contract，不是 UI、消息系统或运营后台实现批准。

个人用户提示：

- 标准版个人用户可以看到 AI 出题和 AI 组卷入口，但入口应明确标记为高级版能力。
- 用户点击高级能力时，不执行 AI 生成任务，只展示需要 `advanced` 的标准提示。
- 提示中提供 `edition_upgrade` 卡密兑换入口。
- 兑换成功后，service 层重新计算 `effectiveEdition`，用户可使用高级能力。
- 兑换失败时必须区分卡密无效、卡密过期、已兑换、无可升级 `personal_auth`、授权范围不匹配和已拥有同范围 `advanced`。

企业管理员提示：

- 标准版企业管理员可以看到企业 AI 出题、企业 AI 组卷、企业训练内容管理和企业 AI 额度概览入口，但入口应明确标记为高级版能力。
- 企业管理员点击高级能力时，不创建 AI 任务，不消耗额度，只展示“联系平台升级”提示。
- 企业管理员首期不能使用个人 `edition_upgrade` 卡密升级企业 `org_auth`。
- 提示应展示企业当前 `edition`、`effectiveEdition`、授权范围和联系方式入口，但不得暴露内部自增主键。

平台运营后台追踪：

- 平台运营后台可记录个人或企业升级咨询/通知状态。
- 运营记录建议至少包含咨询来源、用户或企业公开标识、授权范围、当前 `edition`、目标 `edition`、联系状态、运营备注、外部引用和 `audit_log`。
- 企业升级实际生效仍通过 `auth_upgrade.source_type = ops_manual` 记录，不通过提示本身自动升级。
- 个人升级实际生效仍通过 `edition_upgrade` 类型 `redeem_code` 兑换后创建 `auth_upgrade`。

错误响应边界：

- 标准版访问高级 API 时必须返回标准 `{ code, message, data }` 响应。
- `message` 可提示需要高级版，但 `data` 不得包含敏感授权内部字段、明文卡密或支付信息。
- 前端隐藏菜单不是安全边界，service 层必须校验 `effectiveEdition`。

首期暂缓：

- 自动短信、邮件或站内信触达。
- 在线支付升级。
- 企业管理员自助提交升级申请审批流。
- 标准版免费试用额度。
- 自动试用转付费。

## Authorization Union And Privacy

### Confirmed Decisions

- 个人授权与企业授权按 `profession + level` 取并集，并取最高 `edition`。
- 数据归属、管理权限、统计归属必须分离，不能因为授权并集而混淆。
- 员工同时拥有个人高级授权和企业高级授权时，默认个人学习入口使用个人额度。
- 企业学习入口或用户明确选择“使用企业授权”时，才使用企业授权和企业额度。
- 系统不自动切换授权来源，避免隐私和计费争议。

### Design Implication

授权计算至少需要输出：

- 当前可访问的 `profession`、`level`、`subject` 范围；
- `effectiveEdition`；
- `authorizationSource`，例如 `personal_auth | org_auth`；
- 数据 owner，例如 `personal | organization | platform`；
- 额度 owner，例如 `quotaOwnerType` 与 `quotaOwnerPublicId`。

### Authorization Context API Contract

个人授权与企业授权并集计算定稿为“返回授权上下文列表”模型。本节为需求级 API contract，不是 route handler 或 service 实现批准。

API 语义：

- 授权查询 API 不只返回一个扁平 `effectiveEdition`，而是返回当前用户可用的授权上下文列表。
- 每个授权上下文代表一次可被用户明确选择的授权来源、数据归属和额度归属。
- service 层负责计算并集、有效期、升级记录、组织可见范围和默认上下文；前端不得自行拼接授权规则。
- API JSON 字段必须使用 `camelCase`；内部数据库字段仍按项目规范使用 `snake_case`。

建议响应结构：

```json
{
  "code": 0,
  "message": "ok",
  "data": {
    "defaultContextPublicId": "ctx_personal_xxx",
    "currentContextPublicId": "ctx_personal_xxx",
    "contexts": [
      {
        "contextPublicId": "ctx_personal_xxx",
        "authorizationSource": "personal_auth",
        "authorizationPublicId": "pa_xxx",
        "ownerType": "personal",
        "ownerPublicId": "user_xxx",
        "organizationPublicId": null,
        "profession": "monopoly",
        "level": "level_3",
        "subjects": ["theory", "skill"],
        "edition": "standard",
        "effectiveEdition": "advanced",
        "upgradeStatus": "active",
        "expiresAt": "2026-12-31T23:59:59Z",
        "quotaOwnerType": "personal",
        "quotaOwnerPublicId": "user_xxx",
        "isDefault": true,
        "isSwitchable": true
      },
      {
        "contextPublicId": "ctx_org_xxx",
        "authorizationSource": "org_auth",
        "authorizationPublicId": "oa_xxx",
        "ownerType": "organization",
        "ownerPublicId": "org_xxx",
        "organizationPublicId": "org_xxx",
        "profession": "monopoly",
        "level": "level_3",
        "subjects": ["theory", "skill"],
        "edition": "advanced",
        "effectiveEdition": "advanced",
        "upgradeStatus": "none",
        "expiresAt": "2026-12-31T23:59:59Z",
        "quotaOwnerType": "organization",
        "quotaOwnerPublicId": "org_xxx",
        "isDefault": false,
        "isSwitchable": true
      }
    ]
  }
}
```

字段语义：

- `contextPublicId`：授权上下文公开标识，用于前端选择当前使用的授权上下文；不得使用自增主键。
- `authorizationSource`：授权来源，枚举为 `personal_auth | org_auth`。
- `authorizationPublicId`：来源授权公开标识。
- `ownerType`：数据归属，枚举为 `personal | organization | platform`。
- `ownerPublicId`：数据归属主体公开标识。
- `organizationPublicId`：企业授权所属组织；个人授权为 `null`。
- `profession`、`level`、`subjects`：该上下文可访问的业务范围。
- `edition`：原始授权版本。
- `effectiveEdition`：综合原授权、`auth_upgrade` 和有效期后的有效版本。
- `upgradeStatus`：升级状态，枚举为 `none | active | expired | revoked`。
- `expiresAt`：当前上下文有效期；无到期时间时必须返回 `null`。
- `quotaOwnerType`：额度归属类型，枚举为 `personal | organization | platform`。
- `quotaOwnerPublicId`：额度归属主体公开标识。
- `isDefault`：是否为默认上下文。
- `isSwitchable`：是否允许用户在当前入口切换到该上下文。

默认上下文规则：

- 个人学习入口默认选择个人授权上下文。
- 员工同时拥有个人高级授权和企业高级授权时，个人学习入口默认使用个人授权和个人额度。
- 企业学习入口或用户明确选择企业授权上下文时，才使用企业授权和企业额度。
- 系统不得为了获得更高 `effectiveEdition` 或更多额度而自动切换授权上下文。

隐私与统计边界：

- 使用个人授权上下文产生的 AI 学习内容、统计和额度消耗归个人。
- 员工使用企业授权上下文生成个人 AI 学习内容时，内容仍归个人，但企业可见统计级摘要和额度消耗。
- 企业管理员只能在企业后台查看本组织及下级组织范围内的企业授权上下文统计，不得查看员工与企业无关的个人授权学习内容。

## User And Content Role Segmentation

### Confirmed Decisions

高级版能力按身份分层：

- 个人用户：个人学习型 AI 出题/AI 组卷。
- 企业员工：个人学习型 AI 出题/AI 组卷；如果使用企业授权，则消耗企业额度但内容仍归个人。
- 企业管理员：企业训练型 AI 出题/AI 组卷、企业训练内容管理、企业 AI 额度概览。
- 平台内容老师：正式题库/试卷的 AI 生成草稿、审核、编辑、采纳。
- 平台运营管理员：授权、企业后台开关、企业管理员账号、升级、额度和审计管理。

不同身份生成的内容必须落在不同数据域，不能直接写入正式题库或正式学习记录。

## Content Domains

### Confirmed Decisions

项目后续至少划分三个内容域：

1. 平台正式内容域
   - 现有 `question`、`paper`、`paper_question`、`practice`、`mock_exam`、`exam_report`、`mistake_book` 等。
   - 面向正式题库、正式练习、正式模拟考试和正式报告。

2. 企业训练内容域
   - 建议引入 `org_training`、`org_training_question`、`org_training_attempt`、`org_training_answer_record`、`org_training_report`。
   - 面向企业管理员发布给本企业或下级组织的训练内容。

3. 个人 AI 学习内容域
   - 建议围绕 `ai_generation_task`、`ai_generated_question`、`ai_generated_paper`、`ai_generated_paper_question`、`ai_generated_practice` 建模。
   - 面向个人或员工自主生成、自主练习、自主复盘。

### Design Implication

三个内容域可以复用底层能力：

- AI provider 适配；
- RAG 检索；
- Prompt 模板；
- 题型解析；
- 富文本渲染；
- 授权计算；
- 额度扣减；
- 审计日志；
- `ai_call_log`。

但三个内容域不能共享正式记录表，也不能把非正式 AI 内容直接混入正式 `question`、`paper`、`practice`、`mock_exam`、`exam_report` 或 `mistake_book`。

### Statistics Separation

统计体系也必须平行隔离：

- 个人/员工 AI 学习统计不并入正式学习统计。
- 个人/员工 AI 学习练习不并入正式 `practice`。
- 个人/员工 AI 学习组卷不并入正式 `mock_exam`。
- 个人/员工 AI 学习报告不并入正式 `exam_report`。
- 个人/员工 AI 学习错题不直接进入正式 `mistake_book`。
- 企业训练统计不并入正式学习统计，但可以在企业后台作为独立指标域展示。
- 企业训练成绩可以进入企业组织排行，但必须标识为企业训练排行，不与正式模拟考试排行混合。

这样做的目的，是让 AI 自主学习、企业训练和平台正式学习三类数据可以复用底层能力，但不会互相污染口径、报告、错题和排行榜。

## AI Generated Content Governance

### Confirmed Decisions

- AI 生成不得直接污染正式 `question`、`paper`、`paper_question`。
- AI 生成内容先进入独立生成域。
- 个人/员工学习型生成内容无需人工审核，但仅本人可见，并明确标记 AI 生成。
- 企业训练型生成内容需要企业管理员确认后，才可发布给本企业或可见下级组织。
- 平台正式内容必须由内容老师审核、编辑、采纳后，才能进入正式草稿。
- 平台正式草稿仍不能自动发布，必须继续走现有强校验和发布流程。
- 平台内容老师 AI 组卷首期基于已有正式题库智能组卷，不即时生成新题混入组卷。
- AI 新题必须先审核采纳为正式 `question` 后，才能参与正式组卷。
- 企业训练内容首期不支持系统内一键提交或采纳为平台正式题库/试卷；如需采纳，走线下人工流程。

### Platform Content Adoption Flow

平台内容老师采纳 AI 生成题/卷的编辑和校验界面定稿为“AI 草稿池 → 内容老师编辑校验 → 采纳为正式草稿 → 继续走正式发布流程”模型。本节为需求级采纳流程 contract，不是 API、数据库 schema、页面或发布实现批准。

AI 草稿池：

- 平台内容老师生成的 AI 题目和 AI 组卷结果先进入平台内容 AI 草稿池。
- AI 草稿池内容不等于正式 `question` 或正式 `paper`。
- AI 草稿池内容不得被学员端正式练习或正式模拟考试直接使用。
- AI 草稿池必须保留生成任务、`model_config` snapshot、`prompt_template` version、`citation` snapshot、`evidence_status` 和 `ai_call_log` 追溯关系。

编辑范围：

- 内容老师可编辑题干、材料、选项、标准答案、解析、评分点、知识点、标签、题型、分值和引用信息。
- 内容老师可删除不合格题目。
- 内容老师可将 AI 组卷结果拆分、调整题目顺序、调整大题结构和分值。
- 内容老师不得伪造引用；引用不足时必须保留 `evidence_status = weak | none` 或补充有效引用。

采纳前校验：

- 必须执行 AI 生成题型 schema 校验。
- 必须执行正式内容强校验。
- 必须校验 `profession`、`level`、`subject`、`knowledge_node`、`question_type`、`standard_answer`、`analysis` 和分值规则。
- 正式 `paper` 草稿必须校验 `paper_section`、题量、总分、题型分布和题目引用关系。
- 引用越权、题型不合法、答案不一致、分值不一致或必填字段缺失时不得采纳。

采纳结果：

- AI 题目通过编辑和校验后，可采纳为正式 `question` 草稿。
- AI 组卷结果通过编辑和校验后，可采纳为正式 `paper` 草稿。
- 采纳为正式草稿后，仍不能自动发布。
- 正式草稿必须继续走现有正式内容发布流程和强校验。
- 采纳动作必须记录内容老师、采纳时间、来源 AI 草稿、校验结果和 `audit_log`。

边界：

- 个人/员工 AI 学习内容不能通过该界面采纳为平台正式内容。
- 企业训练内容首期不能通过该界面一键采纳为平台正式内容。
- 平台内容老师 AI 组卷首期基于已有正式 `question` 组卷时，可直接生成正式 `paper` 草稿候选，但仍必须经过编辑校验后采纳。
- AI 新题必须先采纳为正式 `question` 草稿并完成正式发布后，才能参与正式组卷。

首期暂缓：

- AI 草稿自动发布。
- 企业训练一键提交给平台内容老师审核。
- 多人协同审核工作流。
- 采纳结果的自动质量评分。
- AI 草稿与正式题库的批量自动合并。

### Organization Training Minimum Loop

企业训练首期最小可用闭环定稿为“草稿生成/编辑 → 发布 → 员工作答 → 统计/排行 → 下架”模型。本节为需求级业务闭环 contract，不是 API、数据库 schema、页面或任务实现批准。

训练草稿：

- 企业管理员可手动创建企业训练草稿。
- 高级版企业管理员可通过 AI 出题或 AI 组卷生成企业训练草稿。
- 企业训练草稿归属 `organization`，并受企业管理员可见组织范围限制。
- 企业训练草稿不得直接进入平台正式 `question`、`paper` 或正式 `practice`。
- 企业训练草稿保留期仍按既有决策：未发布草稿保留 90 天。

编辑确认：

- 企业管理员必须确认训练标题、说明、题目列表、题型、分值、答案和解析摘要后才能发布。
- AI 生成内容必须通过题型 schema 校验后才能进入可发布训练草稿。
- RAG 依据不足但结构合法的训练内容可发布，但必须保留 `evidence_status` 标记。
- 企业管理员发布前可删除不合格题目或重新生成，但重新生成按额度规则处理。

发布范围：

- 企业训练可发布给本 `organization` 及企业管理员可见下级组织。
- 发布时必须记录发布组织范围快照，避免后续组织结构变化重新解释历史训练。
- 发布后员工可在学员端企业训练入口看到可见训练。
- 发布后的企业训练内容由企业管理员发布后长期保留；下架不等于删除历史记录。
- 2026-06-06 已确认：企业训练首期不设置强制截止时间；停止新增作答以企业管理员手动下架为准。
- 首期不提供到期自动停止新增作答、截止提醒、逾期标记、补考或自动下架。

发布后变更：

- 2026-06-06 已确认：企业训练发布后，训练内容不可直接编辑。
- 已发布企业训练只允许下架、复制为新草稿、重新发布新版本。
- 新版本发布后必须形成独立训练版本边界，不得覆盖旧版本的内容、组织范围快照、`answer_record`、统计摘要或 `audit_log`。
- 企业管理员需要修改题目、分值、答案、解析、标题、说明或可见范围时，必须复制为新草稿后再发布。
- 下架旧版本不影响历史作答、统计、审计和额度流水。

员工作答：

- 员工只能作答其所属组织范围内可见的企业训练。
- 员工作答记录独立于正式 `practice` 和正式 `mock_exam`。
- 企业训练作答记录必须写入作答时组织快照。
- 企业训练成绩不得进入正式 `exam_report` 或正式 `mistake_book`。
- 2026-06-06 已确认：首期每名员工每个企业训练版本只允许一次正式提交。
- 正式提交前可以保存草稿作答；正式提交后，该训练版本的员工结果进入只读状态。
- 企业训练统计、完成率、排行和得分摘要只基于正式提交记录计算。
- 首期不提供补考、重交、取最高分或取最后一次提交；如需重新训练，企业管理员应发布新训练版本。

统计与排行：

- 企业后台展示企业训练完成率、平均分、参与人数、未完成人数和成绩趋势。
- 企业后台支持员工企业训练排行。
- 企业后台支持下级组织企业训练排行。
- 企业训练排行必须明确标识为企业训练排行，不得与正式模拟考试排行混合。
- 统计口径按作答时组织快照归属。

下架：

- 企业管理员可下架已发布企业训练。
- 下架后员工不再新增作答，但历史作答、统计、审计和额度流水保留。
- 2026-06-06 已确认：企业训练下架后，员工仍可查看自己的历史结果摘要，但不能重新进入题目详情、答案解析或新增作答。
- 历史结果摘要只展示训练名称、版本摘要、提交时间、得分、完成状态和必要反馈摘要，不展示下架内容的完整题目、答案、解析或敏感原文。
- 下架必须记录操作人、时间、原因和 `audit_log`。
- 下架不触发额度返还；如需补偿，走 `manual_adjustment` 额度流水。

首期暂缓：

- 企业训练报名、通知、截止提醒和补考。
- 企业训练可选截止时间、强制截止时间、到期自动下架和逾期治理。
- 多轮训练、训练计划、证书和导出。
- 企业训练一键采纳到平台正式题库。
- 企业训练跨企业共享。
- 企业管理员自定义复杂评分规则。

## RAG And Evidence Boundary

### Confirmed Decisions

- AI 生成依据/RAG 范围受授权范围限制。
- 个人/员工只能使用当前有效授权资源。
- 企业管理员只能使用本企业有效授权范围内资源。
- 平台内容老师只能使用平台允许资源。
- 生成任务需要记录 `evidence_status`、`citation` 快照和 `ai_call_log`。
- 不得伪造引用。
- RAG 依据不足但仍生成结果时，必须标记弱证据或无证据，并在额度规则中视为已生成。

## Question Type Scope

### Confirmed Decisions

AI 出题最终目标支持全部现有题型：

- `single_choice`
- `multi_choice`
- `true_false`
- `fill_blank`
- `short_answer`
- `case_analysis`
- `calculation`

首期实现：

- `single_choice`
- `multi_choice`
- `true_false`
- `short_answer`

后续批次：

- `fill_blank`
- `case_analysis`
- `calculation`

### Design Implication

首期不应为了支持复杂题型而拖慢整体落地。应先把题型生成、校验、证据、额度、任务状态和审核流程打通，再扩展复杂题型。

### AI Generated Question Schema And Validation

AI 生成内容的具体题型 JSON schema 和校验规则定稿为“按 `question_type` 分 schema + 统一外层结构 + 生成后强校验”模型。本节为需求级 schema contract，不是 API、数据库 schema、validator 或 prompt 实现批准。

统一外层结构：

```json
{
  "questionType": "single_choice",
  "stem": "题干文本",
  "material": null,
  "questionOptions": [
    {
      "optionKey": "A",
      "content": "选项内容",
      "isCorrect": true
    }
  ],
  "standardAnswer": "A",
  "analysis": "解析文本",
  "scoringPoints": [],
  "knowledgeNodePublicIds": ["kn_xxx"],
  "evidenceStatus": "sufficient",
  "citations": [
    {
      "citationPublicId": "citation_xxx",
      "title": "引用标题",
      "sourceType": "knowledge_base",
      "chunkPublicId": "chunk_xxx"
    }
  ]
}
```

命名说明：

- 上述 JSON 字段按 API/DTO 约定使用 `camelCase`。
- 若后续落到数据库字段，必须转换为 `snake_case`，例如 `question_type`、`standard_answer`、`evidence_status`。
- 不得使用 `option` 命名生成题目选项，统一使用 `question_option` 语义；API 字段使用 `questionOptions`。

通用校验规则：

- `questionType` 必须属于首期允许题型：`single_choice | multi_choice | true_false | short_answer`。
- `stem` 必须非空。
- `knowledgeNodePublicIds` 必须在授权范围内可见。
- `evidenceStatus` 必须为 `sufficient | weak | none`。
- `citations` 不得伪造；无可用引用时返回 `[]`，并将 `evidenceStatus` 标记为 `weak` 或 `none`。
- `analysis` 可为空但必须返回 key；无解析时返回 `null`。
- `material` 无材料时返回 `null`，不得用空字符串代替。
- 生成结果必须先进入 AI 生成域，强校验通过后才允许展示或进入后续审核/练习流程。
- 校验失败不得写入正式 `question`、`paper`、`practice`、`mock_exam`、`exam_report` 或 `mistake_book`。

`single_choice` 校验规则：

- `questionOptions` 至少 4 个选项。
- 每个选项必须有稳定 `optionKey` 和非空 `content`。
- 必须且只能有 1 个 `isCorrect = true` 的选项。
- `standardAnswer` 必须等于唯一正确选项的 `optionKey`。

`multi_choice` 校验规则：

- `questionOptions` 至少 4 个选项。
- 至少 2 个选项必须为 `isCorrect = true`。
- `standardAnswer` 必须包含全部正确选项的 `optionKey`，并且不得包含错误选项。
- 选项顺序和答案顺序必须稳定，便于后续审核和练习展示。

`true_false` 校验规则：

- `questionOptions` 可省略或固定映射为“正确/错误”展示；首期数据 contract 以 `standardAnswer` 为准。
- `standardAnswer` 必须为布尔语义值，API 可设计为 `true | false` 或等价枚举，但同一 contract 内必须统一。
- `analysis` 应解释判断依据；无解析时返回 `null`。

`short_answer` 校验规则：

- `questionOptions` 必须为 `[]`。
- `standardAnswer` 必须非空。
- `scoringPoints` 必须至少 1 条。
- 每个 `scoring_point` 语义应包含评分描述和分值或权重；具体字段后续在实现 contract 中细化。
- AI 自动评分或人工评分不得仅依赖模型自由文本，必须基于 `standardAnswer` 和 `scoringPoints`。

校验失败处理：

- 结构不合法、字段缺失、答案不一致、引用越权或题型不支持时，任务不得进入可用生成结果。
- 可重试的结构漂移可按原 `ai_generation_task` 重试规则处理。
- 达到重试上限仍失败时，任务标记为 `failed`，释放预占额度，并记录失败原因。
- 如果生成了弱证据或无证据但结构合法的结果，可展示给用户，但必须显示 `evidenceStatus`，并按成功生成扣减额度。

首期暂缓：

- `fill_blank`、`case_analysis`、`calculation` 的完整 schema。
- 复杂材料题组 `question_group` 的 AI 生成 schema。
- 自动采纳到平台正式题库。
- 由企业训练内容一键采纳到平台正式题库。

## AI Paper Generation Scope

### Confirmed Decisions

AI 组卷首期采用规则约束型组卷。

首期支持的约束包括：

- `profession`
- `level`
- `subject`
- `question_type` 数量
- `total_score`
- `knowledge_node` 覆盖

首期暂缓：

- 按薄弱点自动组卷；
- 按历年真题分布拟合；
- 企业员工群体薄弱点组卷。

### Layered Paper Generation

AI 组卷按身份落到不同数据域：

- 平台内容老师：生成正式 `paper` 草稿。
- 企业管理员：生成 `org_training`。
- 个人用户/企业员工：生成 `ai_generated_practice`。

底层组卷引擎可以复用，但数据表、发布流程、统计口径和可见范围不同。

## Retention Policy

### Confirmed Decisions

- 个人/员工 AI 学习型生成内容首期保留 90 天。
- 企业训练内容由企业管理员发布后长期保留。
- 企业训练未发布草稿保留 90 天。
- 平台正式内容草稿按现有内容管理规则保留，不自动删除。
- 到期后隐藏内容，但保留任务摘要、`ai_call_log`、审计和成本统计。
- 到期隐藏不等于自动硬删除。
- 个人/员工 AI 内容 90 天内可再次练习、收藏。
- 收藏不延长保留期。
- 个人/员工 AI 内容不得直接进入 `mistake_book`。

### Expired Content Governance

数据保留到期后的隐藏、恢复、硬删除审批和合规策略定稿为“到期隐藏 + 运营后台治理入口 + 恢复需原因 + 硬删除需审批 + 定期清理先生成待处理列表”模型。本节为需求级治理 contract，不是删除任务、运营后台页面或数据清理实现批准。

到期隐藏：

- 到期后内容状态进入 `expired_hidden`。
- `expired_hidden` 内容在个人用户、企业员工和企业管理员普通入口不可见。
- 到期隐藏不等于硬删除。
- 到期隐藏后仍保留任务摘要、`ai_call_log` 摘要、额度流水、`audit_log`、成本统计和必要归属信息。

运营后台治理入口：

- 平台运营后台需要提供到期隐藏治理入口。
- 治理入口可查看已隐藏内容的公开标识、内容类型、归属主体、归属组织、到期时间、隐藏原因、任务摘要和审计摘要。
- 治理入口不得展示 prompt、AI 原始输入输出、员工主观题原文、明文 `redeem_code`、secret、token 或 provider payload。
- 治理入口应支持筛选个人 AI 学习内容、企业训练未发布草稿、平台 AI 草稿和其他后续纳入保留策略的内容。

取消隐藏/恢复：

- 平台运营管理员可对仍在恢复窗口内的 `expired_hidden` 内容执行取消隐藏。
- 取消隐藏必须填写恢复原因。
- 取消隐藏必须记录操作人、时间、对象范围、恢复原因和 `audit_log`。
- 恢复后内容仍受原归属、授权、组织可见范围和保留策略约束。
- 恢复不得绕过 `effectiveEdition`、组织范围或内容域边界。

硬删除审批：

- 首期不提供普通运营一键硬删除。
- 硬删除必须先生成审批记录或待处理单，确认对象范围、影响摘要和删除原因。
- 审批记录至少包含申请人、审批人、执行人、对象范围、影响记录数、原因、时间和 evidence。
- 硬删除执行后不得删除 `audit_log`、额度流水、成本统计和必要任务摘要。
- 有争议、正在审核、正在申诉、仍需企业统计或仍有关联额度争议的内容不得自动硬删除。

定期清理：

- 平台运营后台可提供定期清理策略入口。
- 首期定期清理只生成待清理候选列表和影响摘要，不自动硬删除敏感内容。
- 清理候选列表应展示内容类型、到期时间、归属、影响范围、是否存在争议标记和建议动作。
- 正式内容草稿按现有内容管理规则处理，不纳入 AI 到期自动清理。
- 定期清理策略变更必须记录 `audit_log`。

首期暂缓：

- 自动硬删除敏感内容。
- 企业管理员自助恢复或删除员工历史 AI 内容。
- 用户自助硬删除 AI 生成内容。
- 复杂法务审批流。
- 对已硬删除内容做完整内容恢复。

### Log And Evidence Redaction

日志与 evidence 中的 prompt、原始答案、模型输出脱敏规则定稿为“默认脱敏摘要 + 受控快照例外 + evidence 禁止原文”模型。本节为需求级证据卫生 contract，不是日志系统、快照存储或权限实现批准。

默认禁止记录原文：

- `audit_log` 不记录 prompt 原文。
- `audit_log` 不记录员工或用户原始答案全文。
- `audit_log` 不记录模型完整输出。
- 普通运营日志不记录 provider 原始 payload。
- evidence 不记录 prompt 原文、原始答案、模型完整输出、provider payload、Authorization header、API key、secret、token、密码、数据库 URL 或明文 `redeem_code`。

允许记录的摘要信息：

- 任务公开标识；
- 用户、企业、管理员或内容老师公开标识；
- `authorizationSource`、`quotaOwnerType` 和额度归属公开标识；
- `question_type`、题目数量、生成类型和内容域；
- 输入长度、输出长度、token 统计摘要和成本统计摘要；
- prompt 模板标识和版本；
- `model_provider`、`model_config` 公开配置标识或版本；
- `evidence_status`；
- `citation` 公开标识和数量；
- 错误分类、失败原因分类、重试次数和任务状态；
- 脱敏摘要、哈希或安全摘要。

受控快照例外：

- 如果排查问题必须保留 prompt、原始答案或模型输出原文，只能进入受控快照。
- 受控快照必须限制访问权限、记录访问审计、设置保留期，并与普通 evidence 隔离。
- 受控快照不得出现在 Git、Markdown evidence、终端输出、PR 描述或普通运营日志中。
- 受控快照读取、导出、恢复或硬删除必须写入 `audit_log`。

evidence 规则：

- evidence 只记录验证命令、结果、摘要和脱敏后的关键锚点。
- evidence 中如需证明模型调用链路，只能记录任务公开标识、状态、脱敏错误分类、token/成本摘要和 `evidence_status`。
- evidence 不得包含真实客户/客户类私密数据、完整试卷、完整教材、OCR 全文、原始学生答案或模型原文输出。
- plaintext `redeem_code` 永远不得写入 evidence。

脱敏与摘要规则：

- prompt 使用模板标识、版本和变量名称摘要表示，不记录变量原文。
- 原始答案使用长度、题型、哈希和评分摘要表示，不记录答案全文。
- 模型输出使用结构校验结果、字段完整性、错误分类和哈希表示，不记录完整输出。
- provider payload 使用 provider 名称、模型配置版本、状态码、错误分类和 token 摘要表示。
- 引用来源只记录 `citation`、`chunk` 或资源公开标识及标题摘要，不记录大段原文。

首期暂缓：

- 面向普通运营人员的原文查看入口。
- 自动导出受控快照。
- 在 evidence 中保存模型对话全文。
- 将受控快照接入外部日志平台。

## Quota And Cost Control

### Confirmed Decisions

- AI 生成必须有额度与成本控制。
- 个人用户需要每日/月度额度。
- 企业需要企业总额度和员工个人额度。
- 平台后台需要额度和频率限制。
- 成功生成才最终扣减额度。
- 失败、取消且未产出可用结果时，不扣或释放预占额度。
- 已生成后用户丢弃，仍扣额度。
- RAG 依据不足但生成结果，仍扣额度，并标记弱证据或无证据。

### Quota Unit And Configuration

AI 额度单位定稿为“抽象整数额度点 + 后台可配置消耗规则”。本节为需求级额度 contract，不是数据库、后台配置或计费实现批准。

额度单位：

- 用户侧展示统一使用“AI 额度”或等价业务名称。
- 内部额度值使用非负整数点数，不直接暴露为 token、人民币或模型调用次数。
- `model_provider` 实际 token 消耗、模型成本和 provider 账单只用于内部成本统计、`ai_call_log` 和运营审计，不作为用户侧扣减单位。
- 不同 provider、模型、RAG 命中和题型导致的成本差异，由后台配置的消耗规则吸收，而不是让用户理解 token 明细。

后台配置原则：

- 初始额度、周期重置额度、购买额度包、赠送额度包、单次行为消耗、企业员工个人上限、企业总额度和平台后台额度都应支持后台配置。
- 实现时可以提供默认配置，但默认值也应来自配置项或配置表，不应散落在代码常量中。
- 配置变更只影响变更后的新任务；已生成任务和已写入的额度流水不回算。
- 配置变更必须写入 `audit_log`，并能追溯操作人、变更前值、变更后值和生效时间。

行为消耗原则：

- AI 出题按题目数量、`question_type` 和生成质量要求扣减额度点。
- AI 组卷按题目数量、约束复杂度和是否需要新增生成题扣减额度点。
- 企业训练内容生成扣企业额度。
- 员工使用企业授权上下文生成个人 AI 学习内容，同时受企业总额度和员工个人额度约束。
- 平台内容老师生成正式草稿扣平台后台额度。
- 失败、取消且无可用结果时释放预占额度；生成成功后用户丢弃仍扣额度。

首期暂缓：

- 不向用户展示 token 明细或 provider 原始成本。
- 不按人民币实时计价扣费。
- 不做跨 provider 自动换算展示。
- 不允许前端自行计算额度消耗，额度预估和最终扣减都由 service 层统一计算。

### Quota Defaults And Consumption Table

初始额度与行为消耗表定稿为“后台可配置默认表”模型。本节为需求级配置 contract，不是具体默认数值、后台实现或商业定价批准。

配置对象：

- 个人高级版每日额度；
- 个人高级版月度额度；
- 企业高级版企业总额度；
- 企业高级版员工个人每日额度；
- 企业高级版员工个人月度额度；
- 平台内容老师后台额度；
- 平台运营后台频率限制；
- 单类 AI 行为的预估消耗和最终扣减规则。

默认表原则：

- 系统可以内置一份首期默认配置，但默认配置必须可由平台运营后台调整。
- 默认配置变更只影响新任务，不回算历史任务和历史额度流水。
- 额度预估和最终扣减必须记录所使用的配置版本或配置快照。
- 同一行为的消耗规则应能按 `question_type`、题目数量、组卷规模、RAG 使用情况和内容归属区分。
- 配置表只定义额度点数，不直接暴露 provider token、模型成本或人民币成本。

默认消耗分档建议：

- 生成 `single_choice`、`true_false`：低消耗，按题数累计。
- 生成 `multi_choice`：中低消耗，按题数累计。
- 生成 `short_answer`：中消耗，按题数累计。
- AI 组卷仅使用已有正式 `question`：低消耗，按组卷任务或题量规模扣减。
- AI 组卷并生成个人练习内容：按题目数量和 `question_type` 累计。
- 企业训练内容生成：按题目数量、`question_type` 和训练规模累计。
- 平台内容老师生成正式草稿：按题目数量、`question_type` 和审核草稿规模累计。
- RAG 证据不足但生成成功：正常扣减，并记录 `evidence_status`。
- 失败、取消且未产出可用结果：不扣或释放预占额度。

仍需后续定稿：

- 各类额度包的具体默认点数；
- 每种 `question_type` 的默认消耗点数；
- AI 组卷、企业训练和平台正式草稿的具体默认消耗公式；

### Quota Package And Ledger Rules

AI 额度包的购买、赠送、周期重置、过期和超限规则定稿为“分来源额度包 + 额度流水 + 运营登记式购买/赠送 + 首期不接在线支付”模型。本节为需求级权益账本 contract，不是支付、订单、发票、退款或在线交易实现批准。

总体原则：

- AI 额度系统首期定位为权益账本，不是收银系统。
- 首期不接微信支付、支付宝、银行卡、在线订单、支付回调、退款回调或自动对账。
- 购买额度包由平台运营在后台人工登记发放。
- 购买、赠送、周期重置、人工调整、扣减、释放、过期都必须写额度流水。
- 所有额度包和额度流水都必须可追溯到额度归属对象、操作来源、配置快照和 `audit_log`。

额度来源类型：

- `periodic_reset`：周期重置额度。
- `purchase_grant`：线下购买或外部付款后由平台运营登记发放的额度。
- `bonus_grant`：平台赠送额度。
- `manual_adjustment`：人工补偿、纠错或特殊运营调整。
- `consume`：成功生成后的额度扣减。
- `release`：失败、取消且未产出可用结果后的预占额度释放。
- `expire`：额度包到期失效。

运营登记式购买：

- 平台运营管理员登记 `purchase_grant` 时必须填写 `external_reference` 和 `ops_note`。
- `external_reference` 可记录合同号、收款单号、审批单号、工单号或其他外部付款/审批依据。
- 系统只记录外部引用和额度权益，不处理实际收款、退款、发票、税务或支付渠道对账。
- 登记成功后生成额度包和额度流水，并写入 `audit_log`。
- 额度包归属必须明确为个人、企业或平台后台，不得只记录模糊余额。

赠送与人工调整：

- `bonus_grant` 必须填写赠送原因、额度点数、有效期和操作人。
- `manual_adjustment` 必须填写调整原因、调整方向、额度点数、有效期或影响范围。
- 人工补偿和纠错不得直接覆盖历史流水，只能追加新的反向或修正流水。
- 所有赠送和人工调整都必须写入 `audit_log`。

周期重置：

- 个人每日/月度额度、企业员工个人每日/月度额度、企业总额度和平台后台额度可按后台配置周期重置。
- 周期重置生成 `periodic_reset` 流水。
- 周期重置不删除历史购买、赠送或人工调整流水。
- 周期重置的生效时间、额度点数和配置版本必须可追溯。

扣减、释放与过期：

- 额度扣减优先消耗最快到期的可用额度包。
- 同一到期时间下，可按来源优先级和创建时间稳定排序；具体优先级后续可在实现 contract 中细化。
- 成功生成后写 `consume` 流水。
- 失败、取消且未产出可用结果时写 `release` 流水或释放预占额度。
- 到期额度写 `expire` 流水；过期额度不得继续用于扣减。
- 已消耗额度不因额度包后续到期而回滚。

超限规则：

- 额度不足时不自动透支。
- 个人额度不足时，个人 AI 生成请求返回标准错误响应。
- 员工使用企业授权上下文时，员工个人额度或企业总额度任一不足都应阻断生成。
- 企业管理员生成企业训练内容时，企业额度不足应阻断生成。
- 平台内容老师生成正式草稿时，平台后台额度或频率限制不足应阻断生成。
- 超限错误必须使用标准 `{ code, message, data }` 响应结构，并给出可展示的额度不足原因。

支付与退款边界：

- 首期不建立系统内支付订单。
- 首期不做在线退款闭环。
- 若线下购买需要撤销，平台运营只能通过撤销未消耗额度包或追加 `manual_adjustment` 反向流水处理，并记录原因和 `audit_log`。
- 已经消耗的额度原则上不自动回滚；如需补偿，走 `manual_adjustment`。
- 后续如接入在线支付系统，支付订单只能作为额度发放依据之一，不得替代额度流水和审计记录。

仍需后续定稿：

- 各类额度包的具体默认点数；
- 每种 `question_type` 的默认消耗点数；
- AI 组卷、企业训练和平台正式草稿的具体默认消耗公式；
- 额度包来源优先级的最终实现细则；
- 超限错误码和 API response 具体字段。

### Quota Ownership

额度扣减归属：

- 个人用户生成个人内容，扣个人额度。
- 员工使用企业高级授权生成个人学习内容，扣企业员工个人额度和企业总额度，内容仍归个人。
- 员工使用个人高级授权生成个人学习内容，扣个人额度。
- 企业管理员生成企业训练内容，扣企业额度。
- 内容老师生成正式草稿，扣平台后台额度。

任务需要记录：

- `quotaOwnerType`
- `quotaOwnerPublicId`
- `authorizationSource`

命名说明：上面是 API/DTO 层的 camelCase 表达。若后续落到数据库字段，必须按项目规范使用 snake_case，例如 `quota_owner_type`、`quota_owner_public_id`、`authorization_source`。

## AI Generation Task Model

### Confirmed Decisions

AI 生成任务必须异步化，以应对考试集中时间段带来的高峰。

建议任务状态：

- `pending`
- `running`
- `generated`
- `failed`
- `cancelled`
- `expired_hidden`

首期前端提供任务状态页/任务列表，可通过刷新按钮查看状态；不强制实时推送。

首期需要支持：

- 用户级并发控制；
- 企业级并发控制；
- 全局并发控制；
- 幂等键；
- 防重复提交；
- 额度预检查；
- 成功扣额度；
- 失败释放额度；
- 失败记录；
- 重试限制。

首期不强制引入 Redis/BullMQ，可先用数据库任务表和简化 worker，但字段要为后续队列化预留。

### Worker Runtime And Recovery

AI 生成任务 worker 首期运行方式定稿为“数据库任务表 + 轻量 worker + 可恢复扫描 + 不强依赖 Redis/BullMQ”。本节为需求级运行 contract，不是 worker 实现、依赖引入或部署批准。

任务提交：

- 用户、企业管理员或内容老师提交 AI 出题/AI 组卷请求时，只创建 `ai_generation_task`。
- 提交接口不等待模型生成完成。
- 创建任务时完成权限校验、`effectiveEdition` 校验、额度预检查、幂等键校验和输入参数校验。
- 任务创建成功后返回任务公开标识和初始状态。

worker 领取：

- 轻量 worker 从数据库任务表领取 `pending` 任务。
- 领取任务时必须使用可防并发重复领取的机制。
- 领取成功后将任务状态更新为 `running`，并记录开始时间、领取者标识或 worker 标识。
- worker 必须遵守用户级、企业级和全局级并发限制。

执行与状态：

- 任务成功生成后进入 `generated`。
- 系统错误、provider 临时错误、网络错误、限流或 RAG 临时失败可进入可重试失败状态。
- 输入不合法、权限不足、授权无效、`edition` 不满足、额度不足、越权和参数不合法不可重试。
- 成功生成后才最终扣减额度。
- 失败、取消且未产出可用结果时释放预占额度。

恢复策略：

- worker 启动时或定时扫描超时 `running` 任务。
- 超时 `running` 任务如未超过重试上限，可按原任务进入重试流程。
- 超过重试上限或判定不可恢复时，任务标记为 `failed`，并记录失败原因。
- provider 限流或不可用时，不影响正式练习、正式模拟考试等标准版核心路径。
- 任务状态变更、失败原因、重试次数、额度释放和最终扣减都必须可审计。

首期运行边界：

- 不强制引入 Redis/BullMQ。
- 不强制实时推送任务状态。
- 不依赖前端页面保持打开。
- 不通过同步长请求等待模型输出。
- 不做跨进程复杂优先级队列；只保留后续队列化所需字段和状态。

后续升级触发条件：

- 用户量、企业量或任务量增长导致数据库轮询 worker 无法稳定满足排队时间目标。
- 高峰期任务积压明显影响 AI 生成体验。
- 需要更复杂的优先级、延迟任务、分布式并发控制或任务监控能力。
- provider 调用规模需要更精细的限流、熔断和重试编排。
- 达到以上规模后，再评估引入 Redis/BullMQ 或其他队列基础设施；该升级必须另起依赖审批和实现任务。

### Peak Exam Window Handling

考试前和集中考试周期内，学员练习与 AI 生成请求可能在短时间内显著集中。首期应按以下原则设计：

- AI 出题和 AI 组卷请求不走同步长阻塞流程，提交后返回 `ai_generation_task`。
- 前端展示任务状态、排队中、生成中、失败、已生成等状态。
- 用户离开页面后仍可在任务列表中找回生成结果。
- 用户级、企业级、全局级并发限制同时生效，防止个别用户或企业占满生成能力。
- provider 限流或不可用时，任务进入失败或可重试状态，不影响正式练习、正式模拟考试等标准版核心路径。
- 高峰期可以延长排队时间，但不能让请求无限等待；需要明确失败、重试和用户提示。
- 企业管理员后台需要看到企业 AI 额度和任务消耗概览，但首期不要求实时监控大屏。

这意味着高峰承载能力优先通过“异步任务 + 队列化预留 + 并发闸门 + 清晰状态反馈”解决，而不是首期直接引入重型队列基础设施。

### Peak Capacity And Degradation Strategy

高峰期并发容量指标、压测方案和降级策略定稿为“目标指标 + 本地/预览压测方案 + 分级降级”模型。本节为需求级容量 contract，不是压测执行、staging/prod/provider 调用或部署批准。

目标指标：

- AI 生成任务必须异步排队，不允许阻塞正式练习和正式模拟考试请求。
- 首期需要定义并可配置用户级、企业级和全局级 AI 任务并发上限。
- 首期需要定义可接受排队时间目标，例如普通时段和高峰时段分开配置；具体数值后续在实现任务中定稿。
- 首期需要定义任务成功率、失败率、重试率、超时率和 provider 限流率观察指标。
- 企业管理员后台可查看企业 AI 额度和任务消耗概览，但首期不要求实时监控大屏。
- 平台运营后台需要能看到全局 AI 任务积压、失败和限流摘要。

压测方案：

- dev 环境优先使用模拟 provider 压测任务创建、任务领取、状态流转、额度预检查和失败恢复。
- staging 压测必须在另行获得 staging/resource/provider 人工批准后执行。
- 未获批准前，不连接真实 provider 做高并发压测。
- 压测应覆盖个人用户、企业员工、企业管理员和平台内容老师四类任务来源。
- 压测应覆盖 `pending` 积压、`running` 超时、provider 限流、任务失败、重试、取消和额度释放。
- 压测证据不得记录 prompt、原始答案、模型原始输出、provider payload、密钥或生产数据。

降级策略：

- 第一级：限制单用户并发，提示用户任务已排队。
- 第二级：限制单企业并发，防止单一企业占满 AI 生成能力。
- 第三级：限制全局 AI 任务创建，允许已有任务继续处理。
- 第四级：暂停新建高级 AI 生成任务，只保留任务状态查询和已生成结果查看。
- 第五级：provider 不可用或持续限流时，将可重试任务按规则重试，将超限任务标记失败或等待重试窗口。
- 所有降级都不得影响正式练习、正式模拟考试、正式考试报告和错题本等标准版核心路径。

用户提示：

- 排队时提示任务已进入队列，并允许用户离开页面后在任务列表找回结果。
- 高峰限流时提示当前 AI 生成繁忙，并说明可稍后重试。
- 额度不足、授权不足、`edition` 不满足和组织越权不得伪装成高峰限流。
- 所有错误响应必须保持 `{ code, message, data }` 标准结构。

升级触发：

- 如果高峰排队时间长期超过目标；
- 如果数据库轮询 worker 无法稳定处理任务积压；
- 如果 provider 限流需要更精细的熔断、延迟队列和优先级；
- 如果企业客户对 AI 生成时效提出明确 SLA；
- 则后续应另起任务评估 Redis/BullMQ 或其他队列基础设施，并按依赖审批门禁处理。

### Cancellation

- `pending` 可取消，不扣额度。
- `running` 首期不保证中断模型调用，可标记 `cancel_requested`。
- `generated` 不可取消，只能丢弃。

### Retry

可重试：

- 系统错误；
- provider 临时错误；
- 网络错误；
- 限流；
- RAG 临时失败。

不可重试：

- 输入不合法；
- 权限不足；
- 授权无效；
- `edition` 不满足；
- 额度不足；
- 越权；
- 参数不合法。

重试策略：

- 最多 3 次；
- 复用原任务；
- 成功后才扣最终额度。

### Snapshot Requirement

生成任务必须保存快照：

- `model_config` snapshot；
- `prompt_template` version；
- input snapshot；
- RAG `citation` snapshot；
- `edition` / effective authorization snapshot；
- generation constraint snapshot。

## Actor And Owner Model

### Confirmed Decisions

`ai_generation_task` 需要区分发起者和归属者。

建议记录：

- `actor_type`
- `actor_public_id`
- `organization_public_id`
- `user_public_id`
- `admin_public_id`
- `org_admin_public_id`
- `owner_type`
- `owner_public_id`

`actor_type` 可包括：

- `student_user`
- `employee_user`
- `org_admin`
- `content_admin`
- `ops_admin`
- `system`

`owner_type` 可包括：

- `personal`
- `organization`
- `platform`

actor 是谁发起，owner 是内容和统计归谁，两者不能混淆。

## Organization Portal Positioning

### Confirmed Decisions

企业后台定位为“企业学习运营后台”，不只是 AI 功能入口。

标准版企业授权可获得基础统计能力，但需平台运营后台打开企业后台开关。

高级版企业授权在标准版基础上增加：

- 企业 AI 出题；
- 企业 AI 组卷；
- 企业训练内容管理；
- 企业 AI 额度概览。

企业后台首期 desktop-first，移动端只保证基础可访问。

企业后台建议独立入口：

- `/org/login`
- `/org`

不与 `/ops` 或 `/content` 混用。

## Organization Portal Analytics

### Confirmed Decisions

企业管理层关注的核心付费价值包括：

- 员工使用系统情况；
- 练习时间；
- 练习时长；
- 练习数量；
- 模拟考试成绩；
- 企业训练成绩；
- 各类排行榜；
- 下级组织整体表现；
- 下级组织排行。

企业后台支持三级信息颗粒度：

- 企业总览；
- 员工列表；
- 员工详情。

企业总览展示：

- 活跃人数；
- 练习次数；
- 模拟考试次数；
- 企业训练完成情况；
- 平均分；
- 完成率；
- 趋势；
- 排行；
- 下级组织对比。

### Organization Portal Homepage Metrics

企业后台首页指标口径定稿为“三指标域首页”模型。本节为需求级指标 contract，不是 API 或 UI 实现批准。

指标域：

- 正式学习统计；
- AI 自主学习统计；
- 企业训练统计。

时间范围：

- 默认时间范围为近 30 天。
- 首期支持切换近 7 天、近 30 天、近 90 天。
- 所有首页指标、趋势和排行榜必须使用同一已选择时间范围。
- 时间范围使用业务事件发生时间计算，例如正式练习/正式模拟考试按作答或提交时间，AI 生成按任务生成完成时间，企业训练按作答或提交时间。

组织范围：

- 企业管理员只能查看其绑定 `organization` 及下级组织。
- 首页汇总默认包含本组织及所有可见下级组织。
- 下级组织对比和排行榜只展示当前组织的直接下级组织；继续下钻后再展示下一层。
- 组织统计默认按作答时组织快照归属，避免员工调动后历史数据被重新解释。

正式学习统计：

- 活跃员工数；
- 正式练习次数；
- 正式模拟考试次数；
- 平均分；
- 完成率；
- 最近学习时间；
- 成绩趋势；
- 正式学习排行。

AI 自主学习统计：

- AI 出题任务数；
- AI 组卷任务数；
- 已生成任务数；
- 失败任务数；
- 额度消耗；
- 弱证据或无证据生成占比；
- AI 自主学习完成/得分摘要；
- AI 自主学习排行。

企业训练统计：

- 企业训练发布数；
- 企业训练参与人数；
- 企业训练完成率；
- 企业训练平均分；
- 未完成员工数；
- 下架训练数；
- 企业训练成绩趋势；
- 企业训练排行。

排行榜规则：

- 排行榜必须明确标注排行类型，不得混合正式模拟考试排行、AI 自主学习排行和企业训练排行。
- 正式学习排行首期按同一时间范围内正式模拟考试平均分排序；平均分相同则按正式模拟考试完成次数降序，再按最近提交时间倒序。
- AI 自主学习排行首期按同一时间范围内 AI 自主学习完成次数排序；次数相同则按平均得分降序，再按最近完成时间倒序。
- 企业训练排行首期按同一时间范围内企业训练完成率排序；完成率相同则按平均分降序，再按最近完成时间倒序。
- 下级组织排行使用组织聚合指标；员工排行使用员工个人聚合指标，二者不得混用。

首期暂缓：

- 企业管理员自定义看板；
- 自定义排序字段；
- 自定义时间范围；
- 跨指标域综合总分排行；
- 企业后台数据导出。
- 2026-06-06 已确认：企业管理员首期不提供员工统计数据导出，只提供后台在线查看摘要。
- 首期不提供组织级汇总导出、员工级摘要导出、导出字段白名单、导出文件生成、导出下载、导出审计或导出文件流转治理。

员工列表展示：

- 员工基础信息；
- 所属组织；
- 最近学习时间；
- 练习数量；
- 模拟考试数量；
- 最近成绩；
- 平均成绩；
- 企业训练完成情况；
- 排名。

员工详情展示：

- 授权情况；
- 学习概览；
- 时间线；
- 练习记录摘要；
- 模拟考试记录摘要；
- 企业训练记录摘要；
- 成绩趋势；
- 统计摘要。

### Privacy Boundary

企业后台首期可查看员工统计和报告摘要。

企业后台首期不建议查看：

- 员工主观题原文；
- 员工企业训练逐题作答明细；
- 客观题逐题对错；
- AI 评分详细理由全文；
- AI 原始输入输出；
- prompt；
- 与企业无关的个人授权学习内容。

员工使用企业额度生成个人 AI 学习内容时，企业可见统计级信息：

- 生成次数；
- 类型；
- 时间；
- 额度消耗；
- 任务状态；
- 完成/得分摘要。

企业不可见完整生成内容、原文、原始输出和 prompt。

员工企业额度 AI 学习任务明细可见性：

- 2026-06-06 已确认：企业管理员首期不可查看员工使用企业额度进行个人 AI 学习的单个任务详情。
- 企业管理员只可查看统计摘要和额度消耗摘要，例如生成次数、任务类型汇总、成功/失败数量、额度消耗汇总、完成/得分摘要和 `evidence_status` 汇总。
- 首期不开放单个任务列表摘要、任务公开标识、具体生成时间线、用户输入摘要、生成内容摘要、prompt、AI 原始输入输出、完整生成题目或完整生成 `paper`。
- 如后续需要开放任务列表摘要，必须新增产品与隐私边界决策，不得从当前统计摘要规则推导。

### Employee Detail Field Visibility

员工详情页字段可见性定稿为“统计摘要可见，敏感内容不可见，个人无关内容完全不可见”模型。本节为需求级可见性 contract，不是 API 或 UI 实现批准。

可见字段：

- 员工公开标识；
- 员工姓名或企业内展示名；
- 手机号脱敏展示；
- 所属 `organization`；
- 当前组织层级；
- 员工状态；
- 企业授权摘要；
- 最近学习时间；
- 正式练习次数；
- 正式模拟考试次数；
- 企业训练参与次数；
- 企业训练完成率；
- 最近成绩摘要；
- 平均成绩；
- 成绩趋势；
- 正式学习排行摘要；
- 企业训练排行摘要；
- 学习时间线摘要；
- 正式练习记录摘要；
- 正式模拟考试记录摘要；
- 企业训练记录摘要。

需要脱敏或摘要化的字段：

- 手机号只展示脱敏格式，不展示完整手机号。
- 员工姓名如后续存在企业隐私要求，可切换为企业内展示名或脱敏名。
- 正式练习记录只展示题量、完成时间、得分摘要和涉及 `profession`、`level`、`subject`，不展示题目原文和答案原文。
- 正式模拟考试记录只展示提交时间、得分、用时、排名摘要和报告摘要，不展示主观题答案原文。
- 2026-06-06 已确认：企业管理员首期不可查看员工正式学习题目级或答案级明细。
- 正式 `practice`、`mock_exam`、`exam_report` 和 `mistake_book` 在企业后台只展示统计摘要和记录摘要，不展示题目原文、选项原文、标准答案、员工答案、逐题对错、解析全文、错题详情或主观题原文。
- 如后续需要开放正式 `mock_exam` 报告摘要之外的诊断明细，必须新增产品与隐私边界决策。
- 企业训练记录只展示训练名称、状态、提交时间、得分、完成率和摘要，不展示未授权查看的作答原文。
- 2026-06-06 已确认：企业管理员首期不可查看员工企业训练逐题作答明细。
- 企业训练记录摘要只允许展示训练级和员工级统计摘要，例如训练名称、版本摘要、提交时间、得分、完成状态、完成率、排行摘要和趋势摘要。
- 首期不开放客观题逐题对错、主观题原文、完整题目、答案解析、完整作答明细或敏感原文。
- 如后续需要开放客观题逐题对错，必须新增产品与隐私边界决策，不得从当前摘要可见规则推导。
- AI 自主学习记录只展示任务类型、任务状态、时间、额度消耗、完成/得分摘要和 `evidence_status` 摘要。

不可见字段：

- 员工主观题原文；
- 员工正式学习题目级或答案级明细；
- 正式 `practice`、`mock_exam`、`exam_report` 和 `mistake_book` 的题目原文、选项原文、标准答案、员工答案、逐题对错、解析全文和错题详情；
- 员工企业训练逐题作答明细；
- 客观题逐题对错；
- 完整题目、答案解析和完整作答明细；
- 员工标准答案外的个人作答全文；
- AI 评分详细理由全文；
- AI 原始输入；
- AI 原始输出；
- prompt；
- `citation` 原文快照；
- 与企业无关的个人授权学习内容；
- 使用个人授权和个人额度产生的个人 AI 学习内容；
- 明文 `redeem_code`；
- 内部自增主键；
- 认证密钥、session、token 或任何 secret。

企业额度下 AI 自主学习可见边界：

- 员工使用企业授权上下文和企业额度生成个人 AI 学习内容时，内容仍归个人。
- 企业后台可见统计级摘要：生成次数、任务类型、任务状态、生成时间、额度消耗、完成/得分摘要和 `evidence_status` 摘要。
- 企业后台不可见单个任务详情、单个任务列表摘要、任务公开标识、具体生成时间线、用户输入原文、用户输入摘要、完整生成题目、完整生成 `paper`、模型输出原文、生成内容摘要、prompt 和引用原文。

权限与组织边界：

- 企业管理员只能查看其绑定 `organization` 及下级组织员工详情。
- 员工历史记录按作答时组织快照归属展示，避免员工调动后历史数据被重新解释。
- 企业后台关闭后，不再允许企业管理员查看员工详情，但不影响员工学员端和已有学习记录。

首期暂缓：

- 企业管理员自定义员工字段可见性；
- 员工授权企业查看更多原文内容的授权流程；
- 员工详情数据导出；
- 员工统计数据导出；
- 企业管理员查看 AI 评分全文或 prompt 的例外审批流程。

## Organization Hierarchy

### Confirmed Decisions

企业后台必须纳入组织层级统计。

组织层级至少支持：

- 省公司；
- 地市公司；
- 县区公司；
- 基层或更细组织节点。

管理员只能查看本组织及下级组织。

需要支持：

- 组织总览；
- 下级单位排行；
- 下级单位对比；
- 组织钻取；
- 员工列表；
- 员工详情。

组织统计默认按作答时组织快照归属，避免员工调动后历史数据被重新解释。

### Organization Snapshot At Answer Time

作答时组织快照字段与迁移策略定稿为“作答记录写入组织快照 + 历史数据不回算 + 缺失快照按只读补全”的模型。本节为需求级数据 contract，不是数据库迁移或实现批准。

适用范围：

- 正式练习统计；
- 正式模拟考试统计；
- 企业训练统计；
- 使用企业授权上下文和企业额度产生的 AI 自主学习统计。

快照写入时机：

- 员工提交正式练习、正式模拟考试、企业训练或 AI 自主学习结果时，记录当时的组织归属快照。
- 快照以提交/完成时刻为准，不以后续员工组织调动重算。
- 如果一次任务存在开始时间和提交时间，首期按提交时间组织归属写入快照。

建议快照字段：

- `organization_public_id`：作答时所属组织公开标识。
- `organization_name_snapshot`：作答时所属组织名称快照。
- `org_tier`：作答时所属组织层级，例如 `province | city | district` 或更细层级。
- `parent_organization_public_id`：作答时直接上级组织公开标识；无上级时为 `null`。
- `ancestor_organization_public_ids`：作答时上级组织公开标识列表，用于组织钻取和下级汇总。
- `organization_path_snapshot`：作答时组织路径名称快照，用于报表展示。
- `employee_public_id`：员工公开标识。
- `employee_name_snapshot`：作答时员工展示名快照。
- `snapshot_captured_at`：快照写入时间。

统计规则：

- 企业后台历史统计、趋势、排行和下级组织对比默认使用快照归属。
- 员工调动后，调动前作答仍归属原组织快照，调动后作答归属新组织快照。
- 企业管理员查看员工详情时，只能看到其权限范围内按快照归属允许查看的记录。
- 组织聚合统计使用 `ancestor_organization_public_ids` 判断是否属于当前组织及下级组织。

迁移与补全策略：

- 后续实现任务如发现既有历史记录缺失组织快照，必须先制定独立迁移方案和 evidence。
- 可确定员工作答时组织归属的历史记录，允许按可审计规则补写快照。
- 无法可靠确定作答时组织归属的历史记录，不得按当前组织强行猜测。
- 无法补全的历史记录可标记为 `unknown` 或归入“组织快照缺失”统计桶，但不得混入任一具体组织排行。
- 补全过程必须记录规则、范围、影响记录数和审计证据。

首期暂缓：

- 不做历史组织变更事件流回放。
- 不做跨企业组织合并后的历史重归属。
- 不做员工手工申诉调整历史组织快照。
- 不做企业管理员自行修改组织快照。

### Analytics Domain Separation

企业后台指标域分开：

- 正式学习统计；
- AI 自主学习统计；
- 企业训练统计。

企业组织统计可以包含企业额度下的员工个人 AI 学习统计，但必须分开展示。

企业训练成绩进入企业组织排行，但作为企业训练排行独立展示。

## Organization Admin Accounts

### Confirmed Decisions

企业管理员账号首期简单处理：

- 由平台运营后台创建和管理；
- 手机号 + 密码登录；
- 绑定单个 `organization`；
- 只能查看该组织及下级组织；
- 每个 `organization` 默认最多 3 个企业管理员；
- 平台运营可调整管理员上限；
- 企业后台是否开放由总运营开关控制；
- 支持新增、停用/启用、重置密码、最近登录、审计、管理员上限、开关。

首期暂缓：

- 企业自助创建管理员；
- 企业管理员自助找回密码；
- 多组织绑定；
- 细粒度权限角色；
- 企业管理员邀请链路。

### Organization Switch

企业后台开关首期放在 `organization` 上：

- `is_org_portal_enabled`
- `org_admin_limit`

关闭企业后台不影响：

- 员工学员端；
- 企业授权；
- 员工已有学习记录。

关闭或开启企业后台必须记录审计。

## Organization Admin Session And API Boundary

### Confirmed Decisions

企业后台 API 使用独立 `org_admin` session resolver。

不复用：

- 学员 token；
- 平台管理员权限；
- 内容老师权限。

session 至少解析：

- `orgAdminPublicId`
- `organizationPublicId`
- `visibleOrganizationPublicIds`
- `orgTier`

service 层必须强校验：

- 组织范围；
- `edition`;
- `effectiveEdition`;
- 高级能力；
- 企业后台开关；
- 授权有效期。

标准版访问高级 API 时返回标准错误响应，例如：

```json
{
  "code": 403001,
  "message": "Advanced edition is required.",
  "data": null
}
```

错误边界需要区分：

- 未登录；
- 无授权；
- 授权过期；
- `edition` 不满足；
- 组织越权；
- 企业后台未开放；
- 额度不足；
- 任务不存在或不可见。

## Standard And Advanced Version Boundary

### Standard Edition

标准版首期包含当前已实现模块，并可面向企业开放基础学习运营后台：

- 学员端正式练习；
- 学员端正式模拟考试；
- 正式考试报告和错题相关能力；
- 当前平台内容/运营能力；
- 企业基础学习统计后台，前提是平台打开企业后台开关。

### Advanced Edition

高级版在标准版基础上增加：

- 个人/员工 AI 出题；
- 个人/员工 AI 组卷；
- 企业 AI 出题；
- 企业 AI 组卷；
- 企业训练内容管理；
- 企业 AI 额度概览；
- 平台内容老师 AI 生成草稿能力。

## Explicit Non-Goals For First Release

首期暂缓：

- capability 列表系统；
- 企业私有知识库/资料上传；
- 企业后台数据导出；
- 企业训练一键采纳到平台正式题库；
- 按薄弱点自动组卷；
- 按历年真题分布拟合；
- 企业员工群体薄弱点组卷；
- 企业管理员自助创建/邀请/找回密码；
- 多组织绑定和细粒度权限；
- Redis/BullMQ 强依赖；
- 实时任务推送；
- 复杂题型首期全量支持。

## Follow-Up Decision Queue

本轮 follow-up decision queue 已全部定稿。后续如出现新的产品、运营、合规或实现问题，应新增 follow-up decision queue，而不是复用已定稿条目。

## Implementation Sequence Recommendation

建议后续不要直接开写 AI 出题或企业后台，而是按以下顺序拆分：

1. 写 edition/授权升级/有效授权计算的架构设计和数据 contract。
2. 写 AI 生成任务域设计，包括任务状态、actor/owner、quota、snapshot、retention、error contract。
3. 写企业学习运营后台信息架构和 API contract。
4. 写企业训练内容域设计。
5. 写个人 AI 学习内容域设计。
6. 写平台内容老师 AI 采纳流程设计。
7. 逐个设计落地为可验证任务，每个任务独立分支、独立 evidence。

## First Draft Self-Review Basis

首轮整理完成后，需要从头执行两轮完整自检。

自检目标：

- 不遗漏本轮已确认的关键决策；
- 不把未确认事项写成既定结论；
- 不与既有命名规范、ADR、REST contract、数据隔离和证据规则冲突；
- 不为后续实现引入隐性依赖或越权假设；
- 明确标准版/高级版、个人/企业/平台、正式内容/企业训练/个人 AI 学习之间的边界。

本文档自检结果记录在 evidence 中，关键修正会直接回写本文档。

Marker: two-pass self-review required.
