# Advanced Student AI Generation Result History UI Plan

## Task

- Task id: `advanced-student-ai-generation-result-history-ui`
- Branch: `codex/advanced-student-ai-generation-result-history-ui`
- Date: 2026-06-15
- Task kind: local UI implementation

## Approval

The user approved the four-task serial advanced batch. This is task 4 of 4 and may proceed only after
`advanced-personal-ai-generation-result-readonly-route` is closed and pushed.

## Files Allowed

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-student-ai-generation-result-history-ui.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-student-ai-generation-result-history-ui.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-student-ai-generation-result-history-ui.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/app/(student)/ai-generation/page.tsx`

## Files And Actions Blocked

- No route, repository, e2e, schema, migration, drizzle, script, package, or lockfile changes.
- No `.env.local`, `.env.*`, secret, provider configuration, database URL, token, cookie, Authorization header, raw
  prompt, raw answer, provider payload, row data, or private data access or output.
- No real DB access, dev server, Browser, Playwright, provider/model call, quota/cost measurement, Cost Calibration Gate,
  staging/prod/cloud/deploy, payment, external-service, PR, or force-push.

## Implementation Plan

1. Follow TDD: add focused component tests for result history rendering and error state, then run them to see RED.
2. Extend the student AI generation page to fetch `/api/v1/personal-ai-generation-results` through the existing
   `fetchStudentApi` helper with the stored session token.
3. Add a separate result history panel with loading, empty, error, unauthorized, and ready states.
4. Display only redacted result fields already present in `PersonalAiGenerationResultHistoryDto`.
5. Refresh both request history and result history after a successful local browser request.
6. Preserve existing request-history behavior and no-session behavior.
7. Verify focused component unit test, lint, typecheck, diff checks, and Module Run v2 closeout gates.

## Validation Commands

- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-student-ai-generation-result-history-ui`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-student-ai-generation-result-history-ui`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-student-ai-generation-result-history-ui`

## Risks

- Browser/dev-server/e2e rendered validation is blocked by the task policy, so this task relies on component unit tests
  plus lint/typecheck.
- The UI must not display raw generated content, provider payloads, internal numeric ids, or row/private data.
- The existing request history panel must remain intact while adding the result history panel.
