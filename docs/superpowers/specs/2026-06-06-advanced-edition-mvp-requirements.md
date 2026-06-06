# Advanced Edition MVP Requirements

## Purpose

本文档用于沉淀高级版新增能力的首期 MVP 需求规格，并作为后续验收、contract 拆分和实现任务拆分的主依据。

本文档不是实现批准。后续如涉及数据库 schema、迁移、API、服务、UI、依赖、环境变量、AI provider、staging、prod、部署、在线支付或真实企业数据，必须另起任务方案并按项目门禁审批。

## Source Of Truth

本阶段采用“原设计记录作为决策源，新 MVP 文档作为验收源”的治理模型。

决策源：

- `docs/superpowers/specs/2026-06-05-advanced-edition-ai-generation-design.md`
- 该设计记录沉淀标准版/高级版、AI 出题、AI 组卷、企业学习运营后台、企业训练、授权升级、AI 额度、异步任务、内容保留和日志脱敏等已定稿决策。
- 本文档不得重新解释或覆盖该设计记录中的已定稿决策。

验收源：

- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- 本文档把已定稿决策转成首期 MVP 的需求边界、衔接矩阵、角色数据边界和验收场景。
- 后续 contract、任务队列和实现计划应优先引用本文档的验收口径，同时回链到原设计记录中的决策依据。

写入规则：

- 已确认事项写入正文。
- 未确认事项写入 `Follow-Up Decision Queue`，不得写成既定需求。
- 本文档只描述需求与验收边界，不直接定义数据库迁移、API route handler、service 实现、UI 组件或 worker 实现。
- 命名必须遵守 `AGENTS.md` 和项目术语表，尤其使用 `authorization`、`auth`、`paper`、`redeem_code`、`mock_exam`，不得使用禁用或非项目术语。

## MVP Main Loop

首期主闭环定稿为：

`高级版个人用户 AI 出题/组卷 + 企业管理员创建企业训练 + 员工作答统计 + 运营后台授权/额度管理`

该主闭环用于约束首期范围：

- 高级版个人用户可以在个人学习场景使用 AI 出题和 AI 组卷。
- 企业管理员可以基于企业授权和企业额度创建企业训练内容。
- 企业员工可以作答企业训练，并形成企业训练统计。
- 平台运营管理员可以处理授权升级、额度发放/调整、额度流水和必要的运营治理。
- 正式题库、正式练习、正式模拟考试、考试报告、错题本继续保留原业务口径，不因 AI 或企业训练首期能力被直接污染。

## Non-Goals

首期明确不做：

- 不接入在线支付、支付回调、退款回调、自动对账或发票税务闭环。
- 不引入复杂队列基础设施作为首期硬依赖；AI 生成任务首期仍按数据库任务表、轻量 worker 和可恢复扫描模型推进。
- 不允许 AI 生成内容自动写入正式 `question`、`paper`、`practice`、`mock_exam`、`exam_report` 或 `mistake_book`。
- 不允许企业训练内容一键采纳为平台正式题库或正式试卷。
- 不把企业训练成绩直接并入正式 `exam_report` 或正式 `mistake_book`。
- 不允许企业管理员查看员工个人无关内容、prompt、AI 原始输入输出、员工主观题原文或明文 `redeem_code`。
- 不提供普通运营一键硬删除敏感内容。
- 不连接 staging、prod、cloud、真实 provider、外部支付或真实客户/客户类私密数据。

## Existing Module Integration Matrix

新增模块与既有正式模块的衔接采用“三态边界矩阵”：

- `读取`：新增模块可以在授权范围内读取既有正式数据或基础能力。
- `隔离`：新增模块产生的数据保持在独立内容域或统计域，不写入既有正式业务记录。
- `采纳`：只有经过明确审核、编辑、校验或运营动作后，才允许进入既有正式流程。

### Boundary Matrix

| Existing Module / Domain | AI 出题 | AI 组卷 | 企业训练内容管理 | 企业训练作答统计 | 运营后台授权/额度管理 |
| ------------------------ | ------- | ------- | ---------------- | ---------------- | --------------------- |
| `question`               | `读取`  | `读取`  | `读取`           | `隔离`           | `读取`                |
| `paper`                  | `读取`  | `读取`  | `读取`           | `隔离`           | `读取`                |
| `knowledge_node`         | `读取`  | `读取`  | `读取`           | `读取`           | `读取`                |
| `practice`               | `隔离`  | `隔离`  | `隔离`           | `隔离`           | `读取`                |
| `mock_exam`              | `隔离`  | `隔离`  | `隔离`           | `隔离`           | `读取`                |
| `exam_report`            | `隔离`  | `隔离`  | `隔离`           | `隔离`           | `读取`                |
| `mistake_book`           | `隔离`  | `隔离`  | `隔离`           | `隔离`           | `读取`                |
| `authorization`          | `读取`  | `读取`  | `读取`           | `读取`           | `采纳`                |
| `redeem_code`            | `隔离`  | `隔离`  | `隔离`           | `隔离`           | `采纳`                |
| `audit_log`              | `采纳`  | `采纳`  | `采纳`           | `采纳`           | `采纳`                |
| `ai_call_log`            | `采纳`  | `采纳`  | `采纳`           | `隔离`           | `读取`                |

### State Rules

`读取` 规则：

- AI 出题、AI 组卷和企业训练内容管理可以读取正式 `question`、`paper`、`knowledge_node` 和授权范围内的正式内容元数据。
- 读取必须受 `authorization`、`effectiveEdition`、`profession`、`level`、`subject`、组织范围和内容可见性约束。
- 读取正式内容不意味着可以修改正式内容。
- 读取结果不得暴露内部自增主键、明文 `redeem_code`、secret、token、prompt、AI 原始输入输出或 provider payload。

`隔离` 规则：

- 个人 AI 出题和 AI 组卷结果保持在个人 AI 学习内容域。
- 企业训练内容和企业训练作答记录保持在企业训练内容域与企业训练统计域。
- AI 或企业训练首期不得把生成内容、作答记录、得分、报告或错题直接写入正式 `practice`、`mock_exam`、`exam_report` 或 `mistake_book`。
- 企业训练作答统计不得混入正式模拟考试排行、正式考试报告或正式错题本。
- 员工使用企业授权上下文产生的个人 AI 学习内容仍归个人，企业后台只可见统计摘要和额度消耗摘要。

`采纳` 规则：

- 平台内容老师审核 AI 草稿后，可以将合格题目采纳为正式 `question` 草稿。
- 平台内容老师审核 AI 组卷结果后，可以将合格组卷结果采纳为正式 `paper` 草稿。
- 采纳后的正式草稿仍必须继续走现有正式内容校验和发布流程，不能自动发布。
- 采纳动作必须记录来源 AI 草稿、内容老师、校验结果、采纳时间和 `audit_log`。
- 企业训练内容首期不提供一键采纳为正式 `question` 或正式 `paper` 的系统内入口。
- 运营后台对 `authorization`、`redeem_code`、额度包、额度流水和到期治理的操作属于运营采纳动作，必须写入 `audit_log`。

### Acceptance Implications

- 首期验收时，AI 出题/AI 组卷可以证明其读取了正式题库或知识点范围，但不得在正式 `question`、`paper`、`practice`、`mock_exam`、`exam_report` 或 `mistake_book` 中产生未采纳记录。
- 企业训练作答完成后，企业后台可以展示企业训练统计，但正式 `exam_report` 和正式 `mistake_book` 不应出现企业训练结果。
- 平台内容老师采纳 AI 草稿后，正式内容域中只能出现“正式草稿”，且仍受正式发布流程约束。
- 运营后台授权/额度操作应能通过 `audit_log`、额度流水和安全摘要追溯，但不应暴露明文 `redeem_code` 或敏感原文。

## Role And Data Boundary Matrix

角色与数据边界矩阵采用五级访问层：

- `不可见`：入口、列表、详情、导出和日志摘要中均不得展示。
- `摘要可见`：只展示数量、状态、时间、得分、消耗、脱敏标识、`evidence_status` 等摘要，不展示原文。
- `可操作`：可在自身权限域内创建、编辑、发布、下架、作答或发起任务。
- `可采纳/治理`：可把草稿或运营动作推进到受控正式流程，或执行授权、额度、治理类操作；必须写 `audit_log`。
- `仅审计追溯`：不可作为普通业务内容查看，只能在合规、排障或审计场景通过脱敏摘要、公开标识或受控流程追溯。

### Role Matrix

| Data Domain / Capability                                       | 个人用户   | 企业员工   | 企业管理员 | 平台内容老师  | 平台运营管理员 |
| -------------------------------------------------------------- | ---------- | ---------- | ---------- | ------------- | -------------- |
| 个人 `personal_auth` 与个人 `authorization` 上下文             | `可操作`   | `可操作`   | `不可见`   | `不可见`      | `仅审计追溯`   |
| 企业 `org_auth` 与企业 `authorization` 上下文                  | `不可见`   | `摘要可见` | `摘要可见` | `不可见`      | `可采纳/治理`  |
| 个人 AI 出题/AI 组卷内容                                       | `可操作`   | `可操作`   | `摘要可见` | `不可见`      | `仅审计追溯`   |
| 企业训练内容                                                   | `不可见`   | `摘要可见` | `可操作`   | `不可见`      | `仅审计追溯`   |
| 企业训练作答与统计                                             | `不可见`   | `可操作`   | `摘要可见` | `不可见`      | `仅审计追溯`   |
| 正式 `question` / `paper` 草稿                                 | `不可见`   | `不可见`   | `不可见`   | `可采纳/治理` | `仅审计追溯`   |
| 正式 `practice` / `mock_exam` / `exam_report` / `mistake_book` | `可操作`   | `可操作`   | `摘要可见` | `不可见`      | `仅审计追溯`   |
| AI 草稿池与平台内容采纳                                        | `不可见`   | `不可见`   | `不可见`   | `可采纳/治理` | `仅审计追溯`   |
| AI 额度包、额度流水和消耗摘要                                  | `摘要可见` | `摘要可见` | `摘要可见` | `摘要可见`    | `可采纳/治理`  |
| `redeem_code`、`auth_upgrade` 和人工升级记录                   | `摘要可见` | `不可见`   | `摘要可见` | `不可见`      | `可采纳/治理`  |
| `audit_log`                                                    | `不可见`   | `不可见`   | `摘要可见` | `摘要可见`    | `可采纳/治理`  |
| `ai_call_log`                                                  | `不可见`   | `不可见`   | `摘要可见` | `摘要可见`    | `仅审计追溯`   |

### Role Boundary Rules

个人用户：

- 可以使用个人 `personal_auth` 和个人额度发起个人 AI 出题/AI 组卷。
- 可以查看和操作自己生成的个人 AI 学习内容。
- 可以在正式学习入口操作自己的正式 `practice`、`mock_exam`、`exam_report` 和 `mistake_book`。
- 不可查看企业训练管理内容、企业员工统计、企业额度总账、平台 AI 草稿池或运营治理数据。

企业员工：

- 可以在企业授权上下文允许时使用企业授权和企业额度发起个人 AI 学习任务，但内容仍归个人。
- 可以作答自己可见组织范围内的企业训练。
- 每名员工每个企业训练版本只允许一次正式提交；正式提交前可以保存草稿作答，正式提交后该版本结果只读。
- 可以查看自己的企业训练作答状态和结果摘要。
- 企业训练下架后，仍可以查看自己的历史结果摘要，但不能重新进入题目详情、答案解析或新增作答。
- 不可查看其他员工个人内容、企业训练管理后台、企业额度总账明细、平台 AI 草稿池或运营治理数据。

企业管理员：

- 可以在绑定 `organization` 及可见下级组织范围内创建、编辑未发布草稿、发布和下架企业训练。
- 可以查看员工正式学习摘要、AI 自主学习摘要、企业训练统计和额度消耗摘要。
- 首期只能在后台在线查看员工统计摘要，不提供员工统计数据导出、组织级汇总导出或员工级摘要导出。
- 不可查看员工个人无关内容、使用个人授权和个人额度产生的 AI 学习内容、员工正式学习题目级或答案级明细、员工使用企业额度进行个人 AI 学习的单个任务详情、单个任务列表摘要、prompt、AI 原始输入输出、员工主观题原文、员工企业训练逐题作答明细、客观题逐题对错、明文 `redeem_code` 或 provider payload。
- 企业管理员的统计可见范围必须按组织权限和作答时组织快照约束。

平台内容老师：

- 可以管理平台内容 AI 草稿池。
- 可以编辑、校验并采纳 AI 题目草稿为正式 `question` 草稿。
- 可以编辑、校验并采纳 AI 组卷结果为正式 `paper` 草稿。
- 不可管理个人或企业授权、额度包、额度流水、企业员工隐私数据、明文 `redeem_code` 或运营支付/购买登记。
- 采纳后的正式草稿仍不得自动发布，必须继续走正式内容发布流程。

平台运营管理员：

- 可以治理 `authorization`、`redeem_code`、`auth_upgrade`、企业后台开关、额度包、额度流水、购买/赠送登记、人工调整、到期隐藏、取消隐藏和硬删除审批。
- 可以查看必要的审计摘要、任务公开标识、额度消耗摘要、失败分类和治理状态。
- 不应通过普通运营入口查看员工主观题原文、个人 AI 完整生成内容、prompt、AI 原始输入输出、provider payload、secret、token、数据库 URL 或明文 `redeem_code`。
- 如排障必须查看敏感原文，只能进入受控快照例外流程，并写入 `audit_log`。

### Boundary Acceptance Rules

- 任一角色不得通过前端隐藏、URL 猜测或上下文切换突破 service 层权限判断。
- 所有跨 `personal_auth`、`org_auth`、`organization`、`employee` 和内容域的数据访问必须由 service 层统一计算授权上下文。
- 企业管理员看到的是组织范围内摘要，不是员工个人内容所有权。
- 平台内容老师的“可采纳/治理”只覆盖内容采纳，不覆盖授权、额度或运营治理。
- 平台运营管理员的“可采纳/治理”只覆盖运营治理，不等于可查看全部敏感学习原文。
- `audit_log`、`ai_call_log`、额度流水和受控快照必须遵守日志/evidence 脱敏规则。

## Acceptance Scenarios

首期主闭环验收采用“四条主验收链 + 横向失败场景”组织。验收场景只约束需求结果、权限边界、状态流转和证据要求，不提前绑定具体页面、API 路由、数据库表或实现细节。

### Main Acceptance Chains

高级版个人用户 AI 出题/AI 组卷：

- 前置条件：用户拥有有效高级版个人 `authorization`，并拥有足够可用 AI 额度。
- 用户可以在个人授权上下文中发起 AI 出题和 AI 组卷任务。
- 系统必须先校验授权上下文、额度余额、输入参数和异步任务承载状态，再创建任务。
- 任务完成后，用户可以查看生成结果、消耗额度、任务状态和必要的 `evidence_status`。
- 生成内容默认属于个人 AI 学习内容，不自动进入正式 `question`、正式 `paper`、正式 `practice`、正式 `mock_exam`、正式 `exam_report` 或 `mistake_book`。
- 任务消耗必须形成额度流水，并能通过脱敏摘要追溯到对应任务。

企业管理员创建企业训练：

- 前置条件：企业管理员拥有有效企业 `authorization`，且在绑定 `organization` 及可见下级组织范围内操作。
- 企业管理员可以基于企业训练内容创建草稿、编辑未发布草稿、发布、下架和查看训练摘要。
- 企业训练内容不得自动写入正式 `question` 或正式 `paper`，除非后续进入平台内容老师采纳流程。
- 发布企业训练时必须固定组织可见范围，并保留作答时组织快照。
- 企业训练发布后内容不可直接编辑；如需修改题目、分值、答案、解析、标题、说明或可见范围，必须下架或保留旧版本，并复制为新草稿后重新发布新版本。
- 新版本不得覆盖旧版本的内容、组织范围快照、员工 `answer_record`、统计摘要或 `audit_log`。
- 企业训练首期不设置强制截止时间；停止新增作答以企业管理员手动下架为准，不提供到期自动停止新增作答、截止提醒、逾期标记、补考或自动下架。
- 企业管理员只能查看组织范围内训练级和员工级统计摘要、员工完成状态和得分摘要，不得查看员工企业训练逐题作答明细、客观题逐题对错、主观题原文、个人无关内容或敏感原文。

企业员工完成作答并形成统计：

- 前置条件：员工在企业 `authorization` 上下文中，且属于企业训练发布时允许的 `organization` 范围。
- 员工可以查看、进入并完成自己可见范围内的企业训练。
- 每名员工每个企业训练版本只允许一次正式提交；重复提交、补考、取最高分和取最后一次提交不属于首期。
- 员工作答记录必须进入企业训练统计，但个人学习内容所有权不因此转移给企业管理员。
- 企业训练统计、完成率、排行和得分摘要只基于正式提交记录计算。
- 企业管理员可见统计必须基于员工身份、作答时组织快照、训练范围和脱敏规则计算。
- 企业管理员只能查看员工使用企业额度进行个人 AI 学习的统计摘要和额度消耗摘要，不得查看单个任务详情、单个任务列表摘要、用户输入摘要、生成内容摘要、prompt 或 AI 原始输入输出。
- 企业管理员只能查看员工正式学习统计摘要和记录摘要，不得查看正式 `practice`、`mock_exam`、`exam_report` 或 `mistake_book` 的题目级、答案级、解析级或错题明细。
- 企业管理员首期只能在线查看员工统计摘要，不提供员工统计数据导出、组织级汇总导出、员工级摘要导出、导出文件生成、导出下载或导出文件流转治理。
- 员工在正式学习入口产生的正式 `practice`、`mock_exam`、`exam_report` 和 `mistake_book` 仍按正式学习边界处理。

平台运营管理员完成授权/额度治理：

- 前置条件：平台运营管理员拥有运营治理权限，并通过运营后台执行受控操作。
- 平台运营管理员可以登记人工购买/赠送、调整额度包、查看额度流水摘要、处理 `redeem_code` 与 `auth_upgrade`。
- 首期不接在线支付，购买与赠送通过运营登记式流程完成。
- 授权、额度和升级操作必须写入 `audit_log`，并避免暴露明文 `redeem_code`、secret、token、数据库 URL、provider payload 或 AI 原始输入输出。
- 平台运营管理员可以处理到期隐藏、取消隐藏和硬删除审批，但敏感原文查看必须进入受控快照例外流程。

### Horizontal Failure Scenarios

- 授权不足：标准版用户、过期授权用户、无企业授权上下文用户不得发起对应高级版或企业训练能力；系统应返回明确失败状态和可升级/联系入口摘要。
- 额度不足：额度余额不足时不得创建 AI 出题或 AI 组卷任务；不得先扣成负数；失败结果必须可被用户和运营通过摘要追溯。
- 异步任务失败/超时：任务应进入失败或超时状态；已扣额度的处理规则必须以额度流水为准；用户可见失败分类，运营可见治理摘要。
- 高峰期承载不足：系统可以降级为排队、限流、延迟执行或暂停创建任务；不得绕过授权、额度和日志规则。
- 组织越权：企业管理员和员工不得通过组织切换、URL 猜测或历史身份访问非授权 `organization` 范围内容。
- 企业训练下架：下架后员工不得新增作答，也不得重新进入题目详情或答案解析；员工仍可查看自己的历史结果摘要，历史 `answer_record`、统计摘要、组织快照、`audit_log` 和额度流水必须保留。
- 内容到期隐藏/恢复：到期内容默认隐藏；取消隐藏必须由授权角色执行并写 `audit_log`；硬删除仍需审批记录。
- 日志脱敏：`audit_log`、`ai_call_log`、额度流水和 evidence 不得记录 prompt、AI 原始输入输出、provider payload、secret、token、数据库 URL 或明文 `redeem_code`。

### Supplemental Acceptance Assertions

本轮补充决策进入后续实现验收时，必须额外覆盖以下断言：

- 企业训练发布后内容不可直接编辑；修改题目、分值、答案、解析、标题、说明或可见范围时，必须复制为新草稿并重新发布新版本。
- 企业训练新版本不得覆盖旧版本内容、组织范围快照、员工 `answer_record`、统计摘要或 `audit_log`。
- 每名员工每个企业训练版本只允许一次正式提交；正式提交前可以保存草稿作答，正式提交后结果只读。
- 企业训练首期不设置强制截止时间；停止新增作答只通过企业管理员手动下架，不提供到期自动停止新增作答、截止提醒、逾期标记、补考或自动下架。
- 企业训练下架后，员工只能查看自己的历史结果摘要，不得新增作答或重新进入题目详情、答案解析。
- 企业管理员只能查看训练级和员工级统计摘要，不得查看员工企业训练逐题作答明细、客观题逐题对错、主观题原文、完整题目、答案解析或完整作答明细。
- 企业管理员只能查看员工使用企业额度进行个人 AI 学习的统计摘要和额度消耗摘要，不得查看单个任务详情、单个任务列表摘要、用户输入摘要、生成内容摘要、prompt 或 AI 原始输入输出。
- 企业管理员只能查看员工正式学习统计摘要和记录摘要，不得查看正式 `practice`、`mock_exam`、`exam_report` 或 `mistake_book` 的题目级、答案级、解析级或错题明细。
- 企业管理员首期只能在线查看员工统计摘要，不提供员工统计数据导出、组织级汇总导出、员工级摘要导出、导出文件生成、导出下载或导出文件流转治理。
- 内容域保留期、到期隐藏恢复窗口、`audit_log` 保留期和 `ai_call_log` 保留期必须按运营配置 contract 执行，并能通过配置版本和 `audit_log` 追溯。

### Completion States

- `accepted`：四条主验收链均可用，横向失败场景均有明确业务处理，且 evidence 完整。
- `accepted_with_gaps`：主验收链可用，但存在不阻断首期上线的配置项或运营手册缺口；缺口必须进入 follow-up queue。
- `blocked`：任一主验收链缺失授权、额度、统计、审计或角色边界中的关键闭环。
- `deferred`：明确不属于首期的能力，例如在线支付、复杂审批流、细粒度多级数据授权或大规模队列治理升级。

### Evidence Requirements

- 验收证据必须覆盖四条主验收链、至少六类横向失败场景、角色边界检查、额度流水摘要、`audit_log` 摘要和日志脱敏检查。
- evidence 只能记录脱敏摘要、公开标识、状态、数量、时间、失败分类和必要配置键，不得记录敏感原文。
- 若未来进入实现阶段，每条验收链必须有可重复执行的验证命令或人工验收记录，并标明验证环境、时间、输入摘要和观察结果。
- 若测试脚本缺失，只能声明“lint/typecheck 通过，测试门禁缺失”，不得声明完整测试通过。

## Traceability To Existing Decisions

| MVP Requirement Area    | Existing Decision Source                                                                                                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 标准版/高级版授权与升级 | `Edition Model`, `Authorization Upgrade`, `Auth Upgrade Data Contract`, `Edition Upgrade Redeem Code Relationship`, `Organization Manual Upgrade Operation`                       |
| 授权上下文与权限边界    | `Authorization Context API Contract`, `User And Content Role Segmentation`, `Actor And Owner Model`                                                                               |
| AI 出题与 AI 组卷       | `AI Generated Content Governance`, `AI Generated Question Schema And Validation`, `AI Paper Generation Scope`                                                                     |
| 企业训练                | `Organization Training Minimum Loop`, `Content Domains`, `Statistics Separation`                                                                                                  |
| 企业后台统计            | `Organization Portal Homepage Metrics`, `Employee Detail Field Visibility`, `Organization Snapshot At Answer Time`                                                                |
| AI 额度与异步任务       | `Quota Unit And Configuration`, `Quota Defaults And Consumption Table`, `Quota Package And Ledger Rules`, `Worker Runtime And Recovery`, `Peak Capacity And Degradation Strategy` |
| 内容保留与日志治理      | `Expired Content Governance`, `Log And Evidence Redaction`                                                                                                                        |

### Supplemental Decision Traceability

| Supplemental Decision Area     | Confirmed Requirement                                                                                                             | Existing Decision Source                                                                       | Evidence                                                                                                                                                                                       |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 内容域保留期                   | 个人/员工 AI 学习型生成内容和企业训练未发布草稿首期 90 天；已发布企业训练长期保留；正式 `question` / `paper` 草稿按现有规则保留。 | `Retention Policy`, `Retention Domain Decision`                                                | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-retention-domain-decision.md`                                                                                                     |
| 到期隐藏恢复窗口               | `expired_content_hidden_grace_day` 首期为 30 天。                                                                                 | `Expired Content Governance`, `Expired Hidden Grace Decision`                                  | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-expired-hidden-grace-decision.md`                                                                                                 |
| 日志保留期                     | `audit_log_retention_day` 首期 1095 天；`ai_call_log_retention_day` 首期 180 天。                                                 | `Log And Evidence Redaction`, `Audit Log Retention Decision`, `AI Call Log Retention Decision` | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-audit-log-retention-decision.md`, `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-ai-call-log-retention-decision.md` |
| 企业训练发布后变更             | 已发布企业训练不可直接编辑；只允许下架、复制为新草稿、重新发布新版本。                                                            | `Organization Training Minimum Loop`                                                           | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-published-edit-decision.md`                                                                                 |
| 企业训练正式提交               | 每名员工每个企业训练版本只允许一次正式提交。                                                                                      | `Organization Training Minimum Loop`                                                           | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-single-submit-decision.md`                                                                                  |
| 企业训练截止时间               | 首期不设置强制截止时间；停止新增作答以企业管理员手动下架为准。                                                                    | `Organization Training Minimum Loop`                                                           | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-deadline-decision.md`                                                                                       |
| 企业训练下架后员工可见性       | 下架后员工只可查看自己的历史结果摘要，不得重新进入题目详情、答案解析或新增作答。                                                  | `Organization Training Minimum Loop`                                                           | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-takedown-visibility-decision.md`                                                                            |
| 企业训练作答明细可见性         | 企业管理员首期不可查看员工企业训练逐题作答明细，只看训练级和员工级统计摘要。                                                      | `Employee Detail Field Visibility`, `Privacy Boundary`                                         | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-organization-training-answer-detail-visibility-decision.md`                                                                       |
| 员工企业额度 AI 学习任务可见性 | 企业管理员只看统计摘要和额度消耗摘要，不看单个任务详情或任务列表摘要。                                                            | `Employee Detail Field Visibility`, `Actor And Owner Model`                                    | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-employee-ai-task-visibility-decision.md`                                                                                          |
| 员工正式学习明细可见性         | 企业管理员只看员工正式学习统计摘要和记录摘要，不看题目级或答案级明细。                                                            | `Employee Detail Field Visibility`, `Statistics Separation`                                    | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-formal-learning-detail-visibility-decision.md`                                                                                    |
| 员工统计导出                   | 企业管理员首期不提供员工统计数据导出，只提供后台在线查看摘要。                                                                    | `Organization Portal Homepage Metrics`, `Employee Detail Field Visibility`                     | `docs/05-execution-logs/evidence/2026-06-06-advanced-edition-employee-stat-export-decision.md`                                                                                                 |

## Operations Configuration Contract

运营配置清单按独立配置 contract 维护，不在本 MVP 需求规格正文中展开全部配置项。

- Contract path: `docs/superpowers/specs/2026-06-06-advanced-edition-ops-config-contract.md`
- 覆盖范围：企业后台开关、授权/额度配置、额度包与额度流水、异步任务、高峰降级、内容保留、到期隐藏、硬删除审批、受控快照例外、`audit_log`、`ai_call_log` 和 evidence 脱敏。
- 本 MVP 需求规格只约束主闭环、角色边界、验收场景和与既有模块的衔接边界。
- 配置 contract 约束配置项、作用域、治理规则和审计要求；具体默认点数、时长、阈值仍需在进入实现拆分前单独确认。
- 2026-06-06 已确认：生成内容保留期按内容域拆分治理，个人/员工 AI 学习型生成内容和企业训练未发布草稿首期均为 90 天，已发布企业训练长期保留，正式 `question` / `paper` 草稿按现有内容管理规则保留；到期隐藏后的恢复窗口首期为 30 天；`audit_log` 首期保留 1095 天；`ai_call_log` 首期保留 180 天。

## Requirements Freeze Handoff

2026-06-06 需求冻结审查结论为 `freeze_ready_for_implementation_planning`。

- Freeze review: `docs/05-execution-logs/audits-reviews/2026-06-06-advanced-edition-requirements-freeze-review.md`
- Implementation breakdown prep: `docs/superpowers/plans/2026-06-06-advanced-edition-mvp-implementation-breakdown.md`
- 本文档继续作为高级版首期 MVP 主闭环、角色边界、验收场景和既有模块衔接的 source of truth。
- 后续实现拆解必须继续遵守 ops config contract；未确认的生产默认额度点数、AI 行为消耗点数、并发阈值、超时阈值和高峰阈值不得写死。
- `Cost Calibration Gate` 仍为 blocked gate；未获得新的明确批准前，不得推进 provider 成本测算、真实 provider 调用、env/secret、staging/prod/cloud/deploy、支付或外部服务动作。

## Follow-Up Decision Queue

当前 MVP 主规格中的 follow-up decision queue 已关闭。运营配置 contract 中的 `Default Value Decision Queue` 属于后续默认值决策，不影响本文档作为首期 MVP 需求验收源。

后续若出现新的产品、运营、合规或实现问题，应新增 follow-up decision queue，不得复用已定稿条目。
