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

以下事项尚未完全定稿，后续应继续逐项讨论：

- `auth_upgrade` 的完整字段、状态枚举、唯一约束和审计关系。
- `edition_upgrade` 卡密与普通 `redeem_code` 的数据模型关系。
- 企业人工升级的运营后台交互、审批记录和回退规则。
- 个人授权与企业授权并集计算的 API contract。
- 企业后台首页指标口径、排行榜排序规则和时间范围。
- 员工详情页哪些字段可见、哪些字段需脱敏。
- 作答时组织快照的字段与迁移策略。
- AI 额度包的购买、赠送、重置、过期和超限规则。
- AI 生成任务 worker 的首期运行方式和失败恢复策略。
- AI 生成内容的具体题型 JSON schema 和校验规则。
- 企业训练首期最小可用闭环：发布、作答、统计、排行、下架。
- 平台内容老师采纳 AI 生成题/卷的编辑和校验界面。
- 标准版升级高级版的用户端提示、企业端提示和运营通知。
- 高峰期并发容量指标、压测方案和降级策略。
- 数据保留到期后的隐藏、恢复、硬删除审批和合规策略。
- 日志与 evidence 中的 prompt、原始答案、模型输出脱敏规则。

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
