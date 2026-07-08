# 2026-07-08 Profile Information Hierarchy Task Plan

## Goal

优化学员端 `/profile` 的默认信息层级，让个人标准版、个人高级版、企业标准版员工、企业高级版员工默认只看到账号概览和当前权益摘要，授权明细、会话有效期、账号帮助和低频操作按需展开。

## Scope

- 仅限本地代码与本地验证。
- 仅修改学员端 profile 展示层、相关测试和本任务证据文档。
- 不修改 API DTO、service、repository、DB schema、migration、seed、fixture、package、lockfile、Provider 调用链、env 或部署配置。
- 不记录凭证、session、cookie、token、DB URL、内部 id、Provider payload、raw prompt、raw AI output、完整题目/试卷/材料/资源内容。

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
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
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-ui-remediation-baseline.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-org-employee-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-personal-students.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`

## Root Cause

`src/features/student/profile/StudentProfileRedeemPage.tsx` 将账号帮助、会话有效期、有效授权、版本授权、授权明细和个人授权记录全部默认展开。四类学员/员工角色复用同一 profile 页面，因此企业员工也会在首屏看到个人卡密、个人授权记录和等待卡密类信息，造成默认信息过载。问题位于前端信息架构，不是授权计算或服务边界问题。

## Implementation Plan

1. 先补一个四角色 profile 单元回归测试，证明当前默认信息过载：
   - 个人角色默认不应显示会话有效期、账号帮助正文、授权明细、个人授权记录。
   - 企业员工默认不应显示顶部兑换卡密入口或等待个人卡密提示。
   - 展开详情后仍能看到授权明细和账号帮助。
2. 只在 `StudentProfileRedeemPage.tsx` 调整信息层级：
   - header 保留账号名称和脱敏账号，不默认展示 session 过期时间。
   - 新增当前权益摘要，默认展示授权来源、版本、专业、等级、到期时间和额度归属。
   - 个人用户保留兑换卡密入口；企业员工将兑换卡密移入低优先级账号操作。
   - 账号帮助、会话有效期、版本授权、授权明细、个人授权记录改为按需展开。
   - 企业员工没有个人授权时不默认展示等待个人卡密/购买联系提示。
3. 按需更新现有 profile 相关测试期望，避免未来 e2e/unit 仍要求默认展开旧信息。
4. 运行 targeted tests、lint、typecheck、diff 检查。
5. 写脱敏 evidence/audit。

## Risk Guards

- 不改接口字段和授权服务，只消费现有 `authContext`、`authorizationContexts`、`effectiveAuthorizations`、`personalAuths`。
- UI 隐藏只用于信息层级，不能作为权限边界。
- 保留所有原明细入口，避免客服和验收无法查看来源。
- 不新增依赖，不改 package/lockfile。
- 不记录浏览器敏感状态，不截图，不抓 raw DOM。

## Validation Commands

- `npm.cmd exec -- vitest run tests/unit/student-profile-information-hierarchy.test.tsx`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
