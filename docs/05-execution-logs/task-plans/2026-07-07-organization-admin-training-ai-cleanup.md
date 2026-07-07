# 2026-07-07 组织后台训练/AI 清理计划

Task id: `organization-admin-training-ai-cleanup-2026-07-07`

Branch: `codex/organization-admin-training-ai-cleanup-2026-07-07`

## Goal

只处理组织后台表现层：组织门户、企业训练、组织统计、组织 `AI出题` / `AI组卷`。核销分支 4 的组织上下文、标准/高级版边界、训练列表/向导、组织 AI 五区结构与训练草稿边界。不改变登录、角色、授权、`effectiveEdition`、DB、Provider、正式内容写入、账号、fixture、env、package/lockfile、schema/migration/seed、截图或 e2e。

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
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-2-org-admin-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-local-design-board-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-baseline-design-review.md`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-source-remediation-control-matrix.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/README.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/manifest.redacted.json`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/page-matrix.html`

## Branch Matrix Slice

| Item            | Requirement                                                                                                                                                                    |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 覆盖角色        | `org_standard_admin`, `org_advanced_admin`                                                                                                                                     |
| 覆盖页面        | organization portal, `organization-training`, `organization-analytics`, organization `AI出题`, organization `AI组卷`                                                           |
| 设计板/截图索引 | Batch 2, Batch 0, `CT-REQ-010`, `CT-REQ-024`, `CT-REQ-048`, `CT-REQ-055`; design board rows `org_standard_admin__*`, `org_advanced_admin__*`                                   |
| 允许修改        | `src/app/(admin)/organization/**`, organization portal/training/analytics/admin AI UI paths, focused organization/admin-AI unit tests, docs/state                              |
| 禁止触碰        | operations mutation, auth service semantics, employee import/mutation, formal content writes, raw employee answers, Provider, DB, env, package/lockfile, schema/migration/seed |
| 必测权限边界    | 组织管理员页面不暗示员工写操作、组织树变更或 `org_auth` 变更权限；UI 只做发现和表现，不授予能力。                                                                              |
| 必测版本边界    | `org_standard_admin` 只看只读状态和标准不可用模板；`org_advanced_admin` 保持训练、统计、AI 入口可发现。                                                                        |
| 必测状态        | 训练空列表/错误/禁用，统计空态/错误/禁用导出，AI 标准不可用/历史空态/生成禁用，训练草稿发布阻塞说明。                                                                          |

## TDD Plan

1. 先调整 targeted tests，断言组织门户/统计/训练不在主文案中展示技术标识；企业训练创建上下文由会话授权带入；组织 AI 页面有 context/mode/parameters/boundary/result-history 五区。
2. 再做最小 UI 改动：隐藏组织 public id 主文案，补组织后台版本/范围上下文文案，训练创建表单去掉 raw 组织/授权输入，组织 AI 包装五区 test id。
3. 保留现有 route/API/body/Provider-disabled 行为，不改服务、DB、Provider、正式内容写入语义。

## Validation Commands

- `.\node_modules\.bin\vitest.cmd run tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
- `npm run lint`
- `npm run typecheck`
- `.\node_modules\.bin\prettier.cmd --check src/features/admin/organization-portal/AdminOrganizationPortalPage.tsx src/features/admin/organization-training/AdminOrganizationTrainingPage.tsx src/features/admin/organization-analytics/AdminOrganizationAnalyticsPage.tsx src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts docs/05-execution-logs/task-plans/2026-07-07-organization-admin-training-ai-cleanup.md docs/05-execution-logs/evidence/2026-07-07-organization-admin-training-ai-cleanup-evidence.md docs/05-execution-logs/audits-reviews/2026-07-07-organization-admin-training-ai-cleanup-adversarial-audit.md`
- `.\node_modules\.bin\vitest.cmd run`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-admin-training-ai-cleanup-2026-07-07`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-admin-training-ai-cleanup-2026-07-07 -SkipRemoteAheadCheck`

## Requirement Mapping Result

| Requirement                                        | Branch 4 Mapping                                                                                           |
| -------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Human-readable organization context                | Visible copy uses current organization scope and edition labels instead of technical identifier-like text. |
| Standard unavailable shared backend-state template | Standard training/analytics/AI direct routes keep shared upgrade-required state and no forms/history.      |
| Training list and wizard separation                | List remains first; creation controls stay in the dedicated `新建企业训练` section with disabled reasons.  |
| Organization AI five-zone                          | Organization AI pages expose context, mode, parameters, boundary, and result/history zones.                |
| Organization AI output-to-training handoff         | Copy path remains review then training draft; no platform formal content shortcut.                         |

## Adversarial Checks

- Verify standard organization admin cannot see training/analytics/AI controls or histories.
- Verify advanced organization admin still sees training, analytics, `AI出题`, and `AI组卷`.
- Verify organization pages do not imply employee import/mutation, organization tree mutation, or `org_auth` mutation.
- Verify organization AI copy path remains enterprise training draft only and evidence_status gating wording remains visible.
- Verify no Provider, DB, env, dependency, package/lockfile, schema/migration/seed, fixture, screenshot, raw DOM, or e2e change.
- Verify evidence excludes credentials, sessions, cookies, tokens, env values, DB URL/raw rows, internal ids, Provider payload, raw prompt/output, full question/paper/material/resource content, screenshots, traces, private fixture values, and raw employee answers.
