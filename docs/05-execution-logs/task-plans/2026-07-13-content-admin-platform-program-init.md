# Content Admin Platform Program Init Plan

Date: 2026-07-13

Task: `content-admin-platform-program-init-2026-07-13`

Branch: `codex/content-admin-platform-program-init`

Baseline: `master == origin/master == c674b188a6313b34f963dbef7ba140e89504f942`

## Objective

把已经批准的 Batch B–F 串行推进方案固化为仓库可恢复、可阻断、可审计的状态机与自动门禁。本任务只修改治理文档、状态、PowerShell 门禁和门禁测试，不修改任何产品功能、运行时 API、数据库、依赖或环境。

## Approved Design

产品负责人已经批准 Program Init 设计及放宽后的 standing serial authorization：B–F 与条件任务 X1/X2 在各自任务完成规范读取、计划、TDD/验证、两轮对抗式审查后，可自动提交、ff-only 合入 `master`、普通推送 `origin/master` 并清理；仅部署必须重新取得明确批准。

本任务实现以下约束：

1. 稳定串行总纲、独立授权凭证、父级 Program 状态和 PIC 覆盖/例外台账互相引用；
2. 同一时刻最多一个执行中任务，前置任务未关闭或未完成远端同步/清理时不得推进；
3. 每个实现任务必须记录真实 required reading、精确 allowed files、证据、两轮对抗式审查和 closeout checkpoint；
4. pre-commit 与 pre-push 自动执行 Program Guard；
5. 部署、Provider、staging/production、schema/fixture、依赖与敏感数据边界不因 standing authorization 自动放开。

## SSOT Read List

### Always

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`

### Program-specific

- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/stories/epic-02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-13-content-admin-p0-platform-interaction-contract.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-p0-platform-interaction-baseline-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-13-content-admin-p0-data-integrity.md`
- `docs/05-execution-logs/audits-reviews/2026-07-13-content-admin-p0-data-integrity-audit.md`

### Protected AI, edition, authorization, organization, phone and test-data baselines

- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-12-0704-b0-b6-cumulative-closeout.md`
- `docs/05-execution-logs/evidence/2026-07-12-0704-b0-b6-cumulative-closeout.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-0704-b0-b6-cumulative-closeout-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-12-0704-b0-b6-push-closeout.md`
- `docs/05-execution-logs/evidence/2026-07-12-0704-b0-b6-push-closeout.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-0704-b0-b6-push-closeout-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-12-phone-visibility-decision.md`
- `docs/05-execution-logs/evidence/2026-07-12-phone-visibility-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-phone-visibility-decision-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-12-phone-visibility-enforcement.md`
- `docs/05-execution-logs/evidence/2026-07-12-phone-visibility-enforcement.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-phone-visibility-enforcement-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-12-phone-visibility-validation.md`
- `docs/05-execution-logs/evidence/2026-07-12-phone-visibility-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-07-12-phone-visibility-validation-audit.md`
- `docs/05-execution-logs/task-plans/2026-07-13-prelaunch-ai-paper-test-data-refresh.md`
- `docs/05-execution-logs/evidence/2026-07-13-prelaunch-ai-paper-test-data-refresh.md`
- `docs/05-execution-logs/audits-reviews/2026-07-13-prelaunch-ai-paper-test-data-refresh-audit.md`

## Source And Test Review

- 已读取现有 Module Run v2 公共解析器、pre-commit/pre-push 门禁、task claim/status 脚本和代表性 smoke 测试。
- 本任务不读取私有账号、不连接 0704DB、不启动浏览器、不调用 Provider。
- Guard 使用独立 fixture 测试，不修改 package 或 lockfile，不引入 YAML 依赖。

## TDD And Implementation Order

1. 先创建 Guard smoke 测试，证明脚本不存在时测试失败。
2. 实现最小 Guard，使正例通过，并逐一锁定跳任务、未推送推进、缺第二轮审查、越界文件、缺 required reading、部署自动授权、X1 条件未满足和非法状态八类负例。
3. 在 project state 与 task queue 中物化 Program 父记录、任务顺序、条件任务、standing authorization 和 Program Init active task。
4. 把 Guard 接入 `.husky/pre-commit` 和 `.husky/pre-push`。
5. 完成 evidence、两轮串行对抗式审查、Module Run v2 与全量质量门禁。

## Allowed Files

- `.husky/pre-commit`
- `.husky/pre-push`
- `scripts/agent-system/Test-ContentAdminPlatformSerialProgram.ps1`
- `scripts/agent-system/Test-ContentAdminPlatformSerialProgram.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-program-init.md`
- `docs/05-execution-logs/task-plans/2026-07-13-content-admin-platform-b-to-f-serial-program.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-b-to-f-standing-authorization.md`
- `docs/05-execution-logs/acceptance/2026-07-13-content-admin-platform-pic-coverage-and-exception-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-13-content-admin-platform-program-init.md`
- `docs/05-execution-logs/audits-reviews/2026-07-13-content-admin-platform-program-init-audit.md`

## Blocked Scope

- 产品源码、产品测试、API、数据库、schema、migration、fixture、seed、依赖和 lockfile。
- 0704DB、账号、浏览器、截图、raw DOM、Provider、staging、production、deploy、Cost Calibration、PR、force push。
- 任何重开 A01-A30、旧 AI 问题、手机号或 AI 历史恢复合同的行为。

## Validation

- Guard smoke：正例和八类明确负例。
- Guard 对真实 Program 状态的 `pre_commit`、`pre_push` 只读验证。
- scoped Prettier、`git diff --check`、lint、typecheck、全量 unit、webpack build。
- Module Run v2 pre-commit、module closeout、pre-push readiness。
- 两轮串行对抗式审查：状态机/授权绕过；恢复性/范围/过度设计/历史保护。

## Stop Conditions

- 需求、ADR 或 traceability 出现无法按时间序和来源层级消解的业务冲突。
- Guard 需要新增依赖、修改产品运行时或削弱既有 Module Run v2 门禁。
- 出现敏感信息、不可逆远端风险或部署动作。
