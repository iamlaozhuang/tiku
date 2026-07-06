# 2026-07-06 AI训练学员与员工 UI 重定合同 Evidence

## Scope

- Task id: `ai-training-learner-employee-ui-recontract-2026-07-06`
- Branch: `codex/ai-training-learner-employee-ui-recontract-2026-07-06`
- Scope: learner and organization employee `AI训练` UI source and unit tests.
- Non-executed: DB runtime, Provider, browser runtime, e2e, staging, prod, deploy, Cost Calibration.

## Redaction

Evidence is limited to file paths, test names, command statuses, aggregate counts, role labels, source labels, and non-sensitive UI contract facts.

Not recorded: credentials, sessions, cookies, tokens, env values, connection strings, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI outputs, full question/paper/material/resource/chunk content, screenshots, DOM dumps, traces, private fixture values, plaintext redeem codes, or employee raw answers.

## TDD RED

- Command: `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts -t "switches between AI出题"`
- Status: failed as expected.
- Expected failure category: missing tab contract.
- Observed failure summary: no accessible `AI组卷` tab existed; existing UI still exposed legacy submit-style buttons.

## Implementation Evidence

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
  - Added `AI出题` / `AI组卷` tab selection that does not submit requests.
  - Added visible AI出题 default quantity 3 with max 10.
  - Added visible AI组卷 default quantity 30 with max 80.
  - Request `generationParameters.questionCount` now follows the visible default/input value.
  - Added personal AI组卷 source label: `平台正式题库`.
  - Added organization employee AI组卷 source label: `平台正式题库 + 本企业可用题库`.
  - Added organization employee source preference labels: `均衡使用`, `优先使用企业题`, `优先使用平台题`.
  - Changed learner/employee paper preview copy to `自测试卷预览`.
  - Prevented preview-before-answer from displaying answer/analysis in learner/employee generated-content preview.
- `tests/unit/student-personal-ai-generation-ui.test.ts`
  - Added tests for tab switching without POST.
  - Added tests for AI出题 3-count request.
  - Added tests for personal AI组卷 30-count request and source label.
  - Added tests for organization employee source label, source preference, and enterprise submit label.
  - Updated legacy tests to the new active-tab interaction and preview-before-answer boundary.

## Validation

- Command: `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
  - Status: pass.
  - Result: 1 test file, 32 tests passed.
- Command: `git diff --check`
  - Status: pass.
- Command: `npm.cmd run typecheck`
  - Status: pass.
- Command: `npm.cmd run lint`
  - Status: pass.
- Command: `npm.cmd exec -- prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-training-learner-employee-ui-recontract.md src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts`
  - Status: pass.
- Command: `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-06-ai-training-learner-employee-ui-recontract.md docs/05-execution-logs/evidence/2026-07-06-ai-training-learner-employee-ui-recontract.md docs/05-execution-logs/audits-reviews/2026-07-06-ai-training-learner-employee-ui-recontract.md src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx tests/unit/student-personal-ai-generation-ui.test.ts`
  - Status: pass.
- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-training-learner-employee-ui-recontract-2026-07-06`
  - Status: pass.

## Boundary Assertions

- Dependency changed: false.
- Package/lockfile changed: false.
- Schema/migration/seed changed: false.
- DB mutation executed: false.
- Provider call executed: false.
- Browser/dev server/e2e executed: false.
- Staging/prod/deploy executed: false.
- Cost Calibration executed or claimed: false.
- Release readiness: not claimed.
- Production usability: not claimed.
