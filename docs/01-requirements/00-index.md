# 题库系统 MVP 需求文档索引

> 来源：`archive/plans/2026-05-12-tiku-mvp-requirements.md`（历史存档）
> 状态：正式需求文档
> 术语规范：`docs/03-standards/glossary.yaml`

---

## 1. 背景与目标

本系统面向烟草行业职业技能鉴定、竞赛备考与培训训练。首期不做完整大平台，而是优先跑通"题库内容管理、授权访问、练习考试、AI/RAG 能力"的可用闭环。

首期 MVP 必须同时满足三类验收目标：

1. **内容闭环**：能维护题库题目、材料、理论卷、技能卷，支持组卷、发布、下架。
2. **学员闭环**：个人用户和企业员工能基于授权访问对应专业/等级内容，完成练习、模拟考试、查看报告、使用客观题错题本。
3. **AI/RAG 闭环**：主观题 AI 评分、客观题 AI 讲解、主观题 AI 提示、AI 知识点推荐、RAG 引用展示可用。

首期应用需要同时支持移动端页面，并可在 Web 上使用。未来需要支持微信小程序，因此学员端需求必须移动优先、Web 可用、未来可迁移小程序。具体技术路线在技术选型阶段再确认。

---

## 2. 首期明确不做范围

为控制 MVP 开发量，以下能力首期不做：

- 在线支付。
- 企业后台（标准版基础 MVP 不开放企业自助后台；标准/高级版角色分离修复新增一等 `organization` 管理后台工作区，见 2026-06-24 对齐补充）。
- 培训机构模型和培训机构后台。
- 课程学习、教材阅读、章节学习、课件播放、学习进度。
- 专项刷题，包括按分类刷题、按知识点刷题、专项练习入口。
- 智能组卷，包括规则组卷、随机组卷、AI 智能组卷（标准版基础 MVP 不做；高级版 AI `paper` 生成和内容后台 AI 组卷草稿/评审能力见高级版需求与 2026-06-24 对齐补充）。
- AI 出题、AI 生成题入库、用户 AI 生成个人题库（标准版基础 MVP 不做；高级版个人/企业 AI 出题以及内容后台 AI 出题草稿/评审能力见高级版需求与 2026-06-24 对齐补充，且不得直接写入正式 `question` 或 `paper`）。
- 排行榜、排名、通过线、证书、正式考试合规流程。
- 数据看板、管理端 BI 统计图。
- 试卷 PDF/Word 自动导入。
- OCR。扫描型 PDF 由运营人员线下预处理后再上传可转换版本。
- 复杂审核流。题目不做完整发布审核，试卷只做草稿/发布/下架。
- 短信、微信、邮件通知。
- 用户自助修改手机号、修改密码、找回密码。
- AI 余额、Token 扣费、用户端 AI 消费明细。
- 知识点树版本管理。
- Markdown 知识库版本管理。
- RAG chunk 人工调整。
- 管理后台移动端适配。
- PDF/Word 原卷对照录入器。
- 类 Word 整卷标注式题目录入器。
- 备份/恢复流程细化。MVP 需求阶段只要求业务数据长期保留，正式上线前在部署方案中配置数据库和对象存储备份。

### 2.1 标准/高级版 MVP 角色分离补充范围

2026-06-24 起，标准/高级版 MVP 角色分离修复需求由以下需求树文档承载为 SSOT：

- [Role-Separated MVP Requirement Alignment](./traceability/2026-06-24-role-separated-mvp-requirement-alignment.md)
- [Standard Advanced Backend UX Design First Contract](./traceability/2026-06-27-standard-advanced-backend-ux-design-first-contract.md)
- [Standard Advanced Next UX Polish Queue Planning](./traceability/2026-06-28-standard-advanced-next-ux-polish-queue-planning.md)
- [Standard Advanced UX Polish Queue Planning](./traceability/2026-06-28-standard-advanced-ux-polish-queue-planning.md)
- [Advanced AI Generation Scope Clarification](./traceability/2026-06-23-advanced-ai-generation-scope-clarification.md)
- [AI Generation Requirements SSOT Alignment](./traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md)
- [Phase4 Requirements Agent Baseline Alignment](./traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md)
- [AI Generation Closed Loop Target Alignment](./traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md)
- [AI Generation Recontract Requirements Materialization](./traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md)
- [UI/UX Requirement Design Baseline Gap Analysis](./traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md)
- [Role Auth Training Ops Decision Package](./traceability/2026-07-02-role-auth-training-ops-decision-package.md)
- [Current Thread Requirement Reconciliation Ledger](./traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md)
- [Org Auth Scope Product Decision](./traceability/2026-06-21-org-auth-scope-product-decision.md)
- [Advanced Edition Requirements Index](./advanced-edition/00-index.md)

上述补充不改变标准版基础 MVP 的排除范围；它只明确标准/高级版合并验收中已经确认进入修复范围的能力：角色分离后台工作区、企业标准/高级管理员边界、高级学员 `AI训练`、高级企业员工 `AI训练` 与 `企业训练`、内容后台 `AI出题`/`AI组卷` 草稿评审、运营后台 `redeem_code` 和 `org_auth` 开通/升级/多范围授权治理。

该补充仍不批准代码、数据库、Provider、Cost Calibration、staging/prod、支付、外部服务或最终验收 Pass。

### 2.2 AI 出题 / AI 组卷当前 SSOT 基线

2026-07-02 起，AI出题 / AI组卷 后续任务必须先读取 [AI Generation Requirements SSOT Alignment](./traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md) 和对应 baseline evidence，再使用更早的 quick acceptance、MML rerun、能力目录或用例目录残留。

阶段4恢复和验收口径归一见 [Phase4 Requirements Agent Baseline Alignment](./traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md)。它只固化读取顺序和 supersession 口径，不新增 AI 出题 / AI 组卷修复范围。

2026-07-05 起，本轮“全角色 AI 出题 / AI 组卷有效闭环”实现任务还必须读取
[AI Generation Closed Loop Target Alignment](./traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md)，
并按角色区分显式审核/发布/练习/统计路径，不得把闭环解释为 AI 生成后自动写入正式表。

2026-07-06 起，AI组卷后续需求、UI/UX、后端或验收任务还必须读取
[AI Generation Recontract Requirements Materialization](./traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md)。
该合同将 AI组卷重定为“AI 生成组卷方案 + 系统从允许正式题源本地选题”，不再允许把 Provider 直接生成完整题目草稿解释为新的 AI组卷目标实现。

当前口径：

- 标准版基础 MVP 的“AI 出题 / 智能组卷不做”仍成立，不能被解释成标准版学员自动拥有 AI 生成能力。
- 统一标准/高级版修复范围中，`content_admin` 的内容后台 `AI出题` / `AI组卷` 草稿评审能力、`personal_advanced_student` 和 `org_advanced_employee` 的 `AI训练`、`org_advanced_admin` 的组织后台 AI 生成能力仍属于当前需求范围。
- AI出题生成完整题目草稿；AI组卷只生成组卷方案，最终题目必须来自角色允许的正式题源。
- 旧文档中的 blocked/gap 行如果已被 2026-07-02 baseline 标记为 closed 或 superseded，只能作为历史证据，不得作为新的默认阻塞项。
- 仍不声明 release readiness、final Pass、production usability、Cost Calibration、staging/prod 或广义生产全覆盖。

### 2.3 UI/UX 与需求设计基线

2026-07-02 起，涉及角色流程、企业授权、多范围 `org_auth`、`redeem_code`、组织树、企业训练、组织统计、内容/运营/组织后台、AI 生成后续操作、模型配置、Prompt 和日志治理的设计任务，应先读取
[UI/UX Requirement Design Baseline Gap Analysis](./traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md)。

涉及个人 `redeem_code` 标准版/高级版/升级类型、生成分发窗口、运营后台列表/详情明文查看复制、以及证据/日志脱敏边界时，还应读取
[Redeem Code Edition And Plaintext Operations Decision](./traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md)。

涉及本轮已确认的企业授权重叠闭环、企业管理员/员工账号边界、员工导入和密码重置、组织树、企业训练、组织统计、组织 AI 后续操作、模型连接测试、Prompt/日志治理和运营后台流程时，还应读取
[Role Auth Training Ops Decision Package](./traceability/2026-07-02-role-auth-training-ops-decision-package.md)。

为避免重复讨论、遗漏本轮决策或把已实现/未实现状态混入需求语义，后续涉及上述范围的 UI/UX、需求或实现任务还应读取
[Current Thread Requirement Reconciliation Ledger](./traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md)，并在任务计划中引用相关 `CT-REQ-*` 行。

2026-07-07 起，后续任何涉及角色导航、页面布局、状态模板、AI 页面、内容生命周期、组织工作区、学员壳层、运营后台或 `super_admin` 工作区行为的源码任务，还必须先读取
[Full-role UI/UX Source Implementation Entry](./traceability/2026-07-07-full-role-uiux-source-implementation-entry.md)。
该入口把全角色 UI 整改汇总、六批 UI/UX 基线、仓库外本地设计板与复核结论固化为后续源码实现的必读门禁；源码分支必须在任务计划中引用实际实施的 P1/P2/P3 项、相关角色/页面族、设计板方向、明确延期项和边界防护。

2026-07-13 起，内容后台 `question` / `material` P0 数据完整性修复以及后续平台交互一致性任务还必须读取
[Content Admin P0 Data Integrity And Platform Interaction Contract](./traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md)。
该合同固化 P0-01 至 P0-14、PIC-01 至 PIC-13、任务容器例外机制和分批顺序；Batch A 必须独立于 editor route 重构和全平台推广。

这些 traceability 文件只记录设计基线、缺口、决策和对账口径，不批准产品源码、测试、数据库、Provider、Prompt 编辑后台、浏览器验收、部署、Cost Calibration、release readiness 或 final Pass。

---

## 3. 端与后台划分

### 3.1 学员端

> 详见 [学员端答题与体验](./modules/03-student-experience.md)

学员端移动优先，同时 Web 可用，未来可迁移微信小程序。

### 3.2 管理后台

> 详见 [后台运营与日志](./modules/06-admin-ops.md)

管理后台首期只支持 PC Web，不做移动端适配。后台分两个产品入口：

1. **内容后台** — 面向内容老师、出题人。管理题库题目、材料、试卷、组卷、发布/下架、资源文件与 Markdown/RAG 知识库。
2. **运营后台** — 面向平台运营人员。管理企业组织、企业授权、个人卡密、用户账号、联系配置、审计日志和 AI 调用日志等运营功能。

两个后台共用账号体系和后端权限体系，但入口、菜单和使用体验分开。

---

## 4. 角色与权限

首期后台角色：

| 角色       | 权限范围                                                                           |
| ---------- | ---------------------------------------------------------------------------------- |
| 超级管理员 | 全局权限，管理运营后台和内容后台所有功能                                           |
| 运营管理员 | 企业组织、企业授权、个人卡密、用户账号、联系配置、审计日志和 AI 调用日志等运营功能 |
| 内容老师   | 题库、材料、试卷、组卷、发布/下架、资源与 Markdown/RAG 知识库等内容维护功能        |

规则：

- 账号体系共用，一个用户可拥有多个角色。
- 内容老师首期不做专业/等级权限隔离，可维护全部专业/等级内容。
- 运营管理员不能修改 AI 模型配置。
- AI 模型配置只允许超级管理员维护。
- 关键操作必须记录审计日志。

---

## 5. 子文档索引

| 编号 | 文档                                                   | 覆盖领域                               | 原始章节                |
| ---- | ------------------------------------------------------ | -------------------------------------- | ----------------------- |
| 01   | [用户体系与授权](./modules/01-user-auth.md)            | 统一账号、卡密、企业、授权规则         | §5, §6, §7, §8          |
| 02   | [题库、试卷与内容管理](./modules/02-question-paper.md) | 题型、题库、材料、试卷、发布           | §10, §11, §12           |
| 03   | [学员端答题与体验](./modules/03-student-experience.md) | 页面清单、练习、模拟考试、报告、错题本 | §3.1, §9, §13, §14, §20 |
| 04   | [AI 评分与讲解](./modules/04-ai-scoring.md)            | AI 评分、讲解、提示、模型、Prompt      | §15, §16                |
| 05   | [RAG 与知识库](./modules/05-rag-knowledge.md)          | RAG 检索、资源管理、Markdown、知识点   | §17, §18, §19           |
| 06   | [后台运营与日志](./modules/06-admin-ops.md)            | 后台功能清单、审计日志、AI 调用日志    | §3.2, §21, §22          |

---

## 6. 数据一致性核心规则汇总

为避免后续实现时产生歧义，以下规则为首期硬规则：

1. 手机号在学员/员工统一账号域内是唯一登录账号，首期不可修改；后台/企业管理员账号域与学员/员工账号域不得复用同一手机号。
2. 卡密兑换后不可撤销、不可换绑。
3. 个人授权和企业授权取并集。
4. 学员端访问内容和历史报告都要求当前有效授权。
5. 企业组织树和购买/授权关系分开建模。
6. 同专业/等级的企业授权范围首期不允许重叠。
7. 员工调动后，历史学习记录保持作答时企业归属快照。
8. 员工离职解绑企业后，不再查看企业授权产生的历史报告，除非重新获得对应授权。
9. 试卷一套只能属于理论或技能，不能混合科目。
10. 大题/模块、材料题组本身不计分，只由子题计分。
11. 发布后试卷不可修改，只能下架或复制新草稿。
12. 已发布或有作答记录的试卷不能删除。
13. 题库母题被已发布试卷引用后锁定。
14. 草稿试卷题目快照不随母题修改自动同步。
15. 客观题答案和解析不允许在试卷中覆盖母题。
16. 主观题评分点从母题复制到试卷，可按试卷调整。
17. 模拟考试报告必须保存快照。
18. Markdown 知识库不做版本，但 AI 调用保存引用快照。
19. RAG 命中不足不能伪造引用。
20. 主观题已成功评分结果不重复调用。

---

## 7. 后续扩展方向

后续可逐步扩展：

- 在线支付。
- 微信登录和微信小程序。
- 企业自助维护组织、员工、授权和更完整的企业管理后台能力。
- 企业员工自助导入、账号分配和管理权限下放。
- 企业报表、地市/县区权限。
- 培训机构模型。
- 课程学习、教材阅读、章节进度。
- 专项刷题、智能组卷、AI 出题。
- 试卷 PDF/Word AI 解析导入。
- OCR。
- 知识点树版本。
- Markdown 版本和 diff。
- RAG 测试集与命中率指标。
- RAG chunk 人工调整。
- AI Token 计费、套餐、余额。
- 批次卡密、渠道、代理、结算。
- 题目审核工作流。
- 排行榜、通过线、证书和正式考试能力。
- 用户自助修改密码、手机号换绑、短信验证码。

## Advanced Edition Requirement Reading Surface

Advanced edition requirements are collected as a derived reading surface under `docs/01-requirements/advanced-edition/`.

This section does not replace the standard edition `modules/` and `stories/` documents. It also does not move or override the advanced edition source documents under `docs/superpowers/specs/` and `docs/superpowers/plans/`.

- Advanced edition index: [advanced-edition/00-index.md](./advanced-edition/00-index.md)
- Advanced edition modules: [advanced-edition/modules/](./advanced-edition/modules/)
- Advanced edition stories: [advanced-edition/stories/](./advanced-edition/stories/)
- Role-separated MVP requirement alignment: [traceability/2026-06-24-role-separated-mvp-requirement-alignment.md](./traceability/2026-06-24-role-separated-mvp-requirement-alignment.md)

Cost Calibration Gate remains blocked pending fresh explicit approval. Code-stage queue seeding remains paused unless explicitly approved later.

---

## Requirement SSOT Reading Protocol

Task planning and implementation must follow the requirement SSOT reading protocol in
`docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.

Minimum reading entry:

- Start from this file for all standard MVP and shared standard/advanced MVP work.
- Read the relevant `modules/`, `stories/`, and `use-cases/` files for the affected domain.
- Read `advanced-edition/00-index.md` for every advanced edition, edition, quota, AI generation, organization training,
  or authorization task.
- Read `advanced-edition/edition-aware-authorization-requirements.md` for `authorization`, `personal_auth`, `org_auth`,
  `redeem_code`, `effectiveEdition`, `edition`, or `auth_upgrade` work.
- Read `traceability/2026-07-07-full-role-uiux-source-implementation-entry.md` for every UI/UX source task that touches
  role navigation, page layout, state templates, AI pages, content lifecycle, organization workspaces, learner shell,
  operations pages, or `super_admin` workspace behavior.
- Read the latest relevant traceability decision or matrix before using execution logs as evidence.

`docs/05-execution-logs/` remains valid evidence and history, but it is not sufficient as requirement SSOT by itself.
New requirements found in execution logs must first be promoted into `docs/01-requirements/` or traceability before
implementation starts.
