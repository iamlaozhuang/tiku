# 2026-07-07 学员端桌面可读壳层整改计划

Task id: `learner-desktop-readable-shell-2026-07-07`

Branch: `codex/learner-desktop-readable-shell-2026-07-07`

## Goal

只处理学员端/员工端壳层、导航、标题、上下文、空态、错误态、禁用态的桌面可读性。不得触碰 AI 表单内部、Provider、DB、账号、fixture、env、依赖、package/lockfile、schema/migration/seed、e2e、截图或私有原始材料。

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
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-0-global-foundation.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-3-org-employee-workspace.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-batch-4-personal-students.md`
- `docs/05-execution-logs/task-plans/2026-07-07-full-role-uiux-source-remediation-control-matrix.md`
- `D:/tiku-local-private/acceptance/design-boards/2026-07-07-full-role-uiux/page-matrix.html`

## Branch Matrix Slice

| Item                | Requirement                                                                                                                                                                                                                                                                                                                                              |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 覆盖角色            | `personal_standard_student`, `personal_advanced_student`, `org_standard_employee`, `org_advanced_employee`                                                                                                                                                                                                                                               |
| 覆盖页面            | `home`, `profile`, `redeem-code`, `practice`, `mock-exam`, `exam-report`, `mistake-book`, `organization-training` route state; AI form internals excluded                                                                                                                                                                                                |
| 设计板/截图索引     | Design board rows `personal_*_student__01/04/05/06/07/08/09`, `org_standard_employee__01/03/04/05/06/07/08/09`, `org_advanced_employee__01/02`; screenshot directory path label only: `D:/tiku-local-private/acceptance/screenshots/2026-07-07-three-role-page-review`                                                                                   |
| 允许修改            | `src/components/StudentAppLayout/**`, `src/app/(student)/**` shell/page wiring, `src/features/student/home/**`, `src/features/student/profile/**`, `src/features/student/practice/**`, `src/features/student/mock-exam/**`, `src/features/student/mistake-book/**`, `src/features/student/organization-training/**`, targeted tests, docs/evidence/audit |
| 禁止触碰            | Provider, DB, account/fixture data, env, package/lockfile, schema/migration/seed, AI form internals, screenshots, raw DOM, e2e artifacts, staging/prod/deploy, Cost Calibration                                                                                                                                                                          |
| 必测权限边界        | 不改变登录、角色、authorization、`effectiveEdition`、组织上下文、导航 guard 语义                                                                                                                                                                                                                                                                         |
| 必测标准/高级版边界 | 标准学员/员工无高级主入口；高级学员/员工保持 AI/企业训练入口可发现                                                                                                                                                                                                                                                                                       |
| 必测状态            | 首页空授权/空试卷/加载/错误、企业训练标准不可用/无训练/缺组织上下文、标准学习页空态与过滤空态、壳层 active nav                                                                                                                                                                                                                                           |

## TDD Plan

1. 先新增 `StudentAppLayout` focused test，断言桌面约束容器、非 emoji line-icon 导航、移动优先底部导航语义。
2. 先补充 `student-home-ui` targeted test，断言首页上下文带能显示授权来源、edition、quota owner 且不暴露内部标识。
3. 再实现 `StudentAppLayout` 和 `StudentHomePage` 的限定范围变更。

## Validation Commands

- `.\node_modules\.bin\vitest.cmd run src/components/StudentAppLayout/StudentAppLayout.test.tsx tests/unit/student-home-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`
- `.\node_modules\.bin\eslint.cmd src/components/StudentAppLayout/StudentAppLayout.tsx src/components/StudentAppLayout/StudentAppLayout.test.tsx src/features/student/home/StudentHomePage.tsx tests/unit/student-home-ui.test.ts`
- `.\node_modules\.bin\tsc.cmd --noEmit`
- `.\node_modules\.bin\prettier.cmd --check src/components/StudentAppLayout/StudentAppLayout.tsx src/components/StudentAppLayout/StudentAppLayout.test.tsx src/features/student/home/StudentHomePage.tsx tests/unit/student-home-ui.test.ts docs/05-execution-logs/task-plans/2026-07-07-learner-desktop-readable-shell.md`
- `.\node_modules\.bin\vitest.cmd run`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-desktop-readable-shell-2026-07-07`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-desktop-readable-shell-2026-07-07 -SkipRemoteAheadCheck`

## Requirement Mapping Result

| Requirement                                   | Branch 2 Mapping                                                                                                               |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Learner layout mobile-first, desktop-readable | Constrain header/content/nav width and replace decorative tab symbols with line icons while preserving bottom tab interaction. |
| Context visible near page title               | Add compact learner context band to home using existing authorization context DTOs.                                            |
| Standard/advanced visibility                  | Home entries remain capability-driven; standard roles do not gain advanced routes.                                             |
| Empty/error/disabled states                   | Keep explicit empty/error/unavailable wording and targeted tests for current pages.                                            |
| Sensitive evidence                            | Evidence records command status and file labels only, no screenshot pixels or private values.                                  |

## Adversarial Checks

- Verify no auth/service/route guard semantics changed.
- Verify no Provider, DB, env, package/lockfile, schema/migration/seed, fixture, screenshot, raw DOM, or e2e artifact changes.
- Verify no internal identifiers, credentials, tokens, raw records, Provider payloads, raw prompts, raw AI output, or full question/material content are recorded in evidence.
- Verify desktop readability change does not break mobile-first tab navigation.
