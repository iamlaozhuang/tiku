# 2026-07-07 学员 AI 五区结构整改计划

Task id: `learner-ai-five-zone-workbench-2026-07-07`

Branch: `codex/learner-ai-five-zone-workbench-2026-07-07`

## Goal

只处理学员端 `AI训练` 页面表现层，把个人高级学员与组织高级员工的 `AI出题` / `AI组卷` 页面核销为上下文、模式、参数、边界、结果/记录五区结构。标准学员和标准员工直接进入时必须是清晰不可用状态，不显示生成表单或历史记录。不触碰 Provider、后端生成语义、DB、账号、fixture、env、依赖、package/lockfile、schema/migration/seed、截图或 e2e。

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-org-employee-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-personal-students.md`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-source-remediation-control-matrix.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/page-matrix.html`

## Branch Matrix Slice

| Item                | Requirement                                                                                                                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 覆盖角色            | `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`                                                                                                                    |
| 覆盖页面            | learner `ai-generation` route only, including direct unavailable states and selected authorization context display                                                                                                            |
| 设计板/截图索引     | Batch 0 AI five-zone, Batch 3, Batch 4, AI recontract 2026-07-06, design board rows `*_ai-generation`; screenshot directory path label only: `D:/tiku-local-private/acceptance/screenshots/2026-07-07-three-role-page-review` |
| 允许修改            | `src/app/(student)/ai-generation/**`, `src/features/student/ai-generation/**`, `tests/unit/student-personal-ai-generation-ui.test.ts`, focused docs/evidence/audit/state                                                      |
| 禁止触碰            | Provider execution/config, backend generation semantics, paper source resolver, DB, env, package/lockfile, schema/migration/seed, fixture data, screenshots, raw DOM, e2e artifacts                                           |
| 必测权限边界        | UI 不授予 AI 能力、额度归属或组织上下文；Provider 保持未执行；runtime/service 仍负责 `effectiveEdition` 和 authorization enforcement                                                                                          |
| 必测标准/高级版边界 | 标准个人/员工渲染不可用状态且无表单/历史；高级个人/员工显示上下文、模式、参数、边界、结果/记录五区                                                                                                                            |
| 必测状态            | 标准不可用、缺上下文/无可用高级授权、生成错误、无结果/历史空态、提交禁用态，不执行 Provider                                                                                                                                   |

## TDD Plan

1. 先补 `student-personal-ai-generation-ui` targeted tests，断言高级上下文有五区 data-testid、边界文案、历史/结果区；标准上下文无表单和历史。
2. 再重排 `StudentPersonalAiGenerationPage` 的表现层结构，保留现有请求、历史、学习会话和授权选择逻辑。
3. 保持所有现有 AI 生成请求 payload、fetch、Provider-disabled 行为不变。

## Validation Commands

- `.\node_modules\.bin\vitest.cmd run tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `npm run lint`
- `npm run typecheck`
- `.\node_modules\.bin\prettier.cmd --check src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts docs/05-execution-logs/task-plans/2026-07-07-learner-ai-five-zone-workbench.md docs/05-execution-logs/evidence/2026-07-07-learner-ai-five-zone-workbench-evidence.md docs/05-execution-logs/audits-reviews/2026-07-07-learner-ai-five-zone-workbench-adversarial-audit.md`
- `.\node_modules\.bin\vitest.cmd run`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-five-zone-workbench-2026-07-07`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-five-zone-workbench-2026-07-07 -SkipRemoteAheadCheck`

## Requirement Mapping Result

| Requirement                                          | Branch 3 Mapping                                                                                                |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Learner AI five-zone                                 | Render context, mode, parameters, boundary, result/history zones as stable page structure.                      |
| Learner and employee AI labels                       | Keep `AI训练`, `AI出题`, `AI组卷`, `生成练习题草稿`, `生成自测试卷`, `生成企业自测试卷`.                        |
| Standard roles denied/unavailable                    | No form/history/result zones when no advanced AI authorization context is available.                            |
| AI组卷 plan-and-select wording                       | Use product wording around formal question sources and self-test preview; no backend completion claim.          |
| No Provider / no sensitive evidence / no raw content | Only UI source/tests/docs change; evidence records command status, file labels, safe counts, and boundary pass. |

## Adversarial Checks

- Verify tab changes do not submit generation requests.
- Verify standard contexts cannot see form/history.
- Verify organization quota is used only after explicit org context selection.
- Verify no Provider, backend generation, DB, env, package/lockfile, schema/migration/seed, fixture, screenshot, raw DOM, or e2e change.
- Verify evidence excludes credentials, sessions, cookies, tokens, env values, DB URL/raw rows, internal ids, Provider payload, raw prompt/output, full question/paper/material/resource content, screenshots, traces, and private fixture values.
