# 需求兑现表与角色体验闭环只读审计执行方案

**Date:** 2026-06-21
**Branch:** `codex/requirement-fulfillment-review`
**Task type:** `read_only_audit_documentation`
**Status:** `completed_for_static_docs`

## 目标

建立一份可审计的闭环文档，说明现有 64 条 Phase 18/19 基线需求、角色入口、关键体验路径、当前已暴露问题，在静态证据下分别处于 `covered`、`partial`、`gap`、`blocked` 或 `not_applicable`。本轮只做静态审计和文档闭环，不启动服务、不跑浏览器、不连数据库、不调用 AI Provider、不写入任务队列。

## 已读取规范与治理文件

- `AGENTS.md` 中的命名规范、执行纪律和半自动化推进流程。
- `docs/03-standards/code-taste-ten-commandments.md`。
- `docs/03-standards/glossary.yaml`。
- `docs/03-standards/ui-code.md` 相关 UI/UX 约束。
- `docs/02-architecture/adr/ADR-001-technology-stack.md`。
- `docs/02-architecture/adr/ADR-002-backend-layering-and-api-style.md`。
- `docs/02-architecture/adr/ADR-003-workplace-desktop-web-compatibility.md`。
- `docs/02-architecture/adr/ADR-004-environment-and-deployment-boundary.md`。
- `docs/02-architecture/adr/ADR-005-staging-preparation-boundary.md`。
- `docs/02-architecture/adr/ADR-006-current-runtime-baseline.md`。
- `docs/02-architecture/adr/ADR-007-authorization-edition-source-of-truth.md`。
- `docs/04-agent-system/sop/requirement-task-coverage-and-gap-audit-governance.md`。
- `docs/04-agent-system/sop/local-experience-closure-governance.md`。
- `docs/04-agent-system/sop/task-lifecycle-governance.md`。
- `docs/04-agent-system/sop/code-stage-task-seeding-governance.md`。
- `docs/04-agent-system/sop/local-human-verification.md`。
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`。
- `docs/04-agent-system/sop/operating-manual.md`。
- `docs/04-agent-system/sop/module-run-v2-evidence-template.md`。

## 需求源冻结

主账采用 `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-traceability-matrix.md` 的 64 条 Phase 18 需求矩阵，并对齐以下来源：

- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-total-requirement-audit-report.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-coverage-matrix-review.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-19-follow-up-queue-alignment.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/02-architecture/interfaces/phase-22-mvp-local-acceptance-reaudit-contract.md`
- `docs/05-execution-logs/audits-reviews/2026-06-01-phase-22-mvp-local-acceptance-reaudit-planning.md`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`

新增来源或用户已暴露问题不直接扩展实现范围，只以 `source_freshness_conflict` 或 `queue_ready` 建议入账。

## 静态审计范围

- 学员端入口、布局、底部菜单、首页理论/技能分组、练习、模拟考试、错题本、报告、个人 AI 页面。
- 后台内容运营题目、材料、试卷、手工组卷、AI 入口现状。
- 后台系统运营用户、组织、企业授权、卡密、审计日志、AI 调用日志。
- API、service、repository、schema 中与 `authorization`、`org_auth`、`personal_auth`、`redeem_code`、`mock_exam`、`mistake_book`、`ai_call_log`、`audit_log` 有关的边界。
- mock/fixture 与真实流程差异，仅记录静态证据，不做运行态证明。

## 硬性边界

- 不启动 dev server、浏览器、Playwright、截图、trace 或 DOM 采集。
- 不连接数据库，不读取 `.env`，不执行 seed、migration、bootstrap 或 DB 写操作。
- 不调用 AI Provider，不读取或修改模型密钥配置，不暴露 prompt、answer 或 provider payload。
- 不把缺口写入 `docs/04-agent-system/state/task-queue.yaml`。
- 不修改 `package.json` 或 lockfile。
- 不 push、不建 PR、不部署。
- 文档只声明静态证据、历史证据或待运行态验证，不声明用户体验已通过。

## 风险防御

- 历史 `implemented` 只有在有验证证据时映射为 `covered`；`RA-01-08` 因 e2e 前置账号仍不完整，降为 `partial`。
- 只存在文档、mock、fixture、代码但未闭合用户路径的条目保持 `partial`、`gap` 或 `release_blocked`。
- AI SDK 依赖与 ADR-006 的时间线存在来源新鲜度冲突，只登记为 `source_freshness_conflict`，不推导为真实 Provider 可用。
- 所有 evidence 均避免记录密钥、token、明文 `redeem_code`、原始 prompt、原始答案、完整 `paper`、完整 `material`、provider payload 或私有作答文本。

## 交付物

- `docs/01-requirements/traceability/requirement-fulfillment-matrix.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-21-requirement-fulfillment-and-role-experience-review.md`
- `docs/05-execution-logs/audits-reviews/2026-06-21-requirement-fulfillment-and-role-experience-review.md`

## 验证计划

- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\01-requirements\traceability\requirement-fulfillment-matrix.md docs\01-requirements\traceability\role-experience-fulfillment-matrix.md docs\05-execution-logs\task-plans\2026-06-21-requirement-fulfillment-and-role-experience-review.md docs\05-execution-logs\evidence\2026-06-21-requirement-fulfillment-and-role-experience-review.md docs\05-execution-logs\audits-reviews\2026-06-21-requirement-fulfillment-and-role-experience-review.md`
- 对 changed docs 执行未完成标记扫描，确认没有未完成标记或延期补录表述。
- 对 changed docs 执行术语红线扫描，确认没有违反术语表的旧称或裸用保留词。
