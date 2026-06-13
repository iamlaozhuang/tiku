# Task Plan: batch-141-personal-learning-ai-ui-server-backed-history-after-submit

## Baseline

- Branch: `codex/batch-141-personal-learning-ai-ui-server-backed-history-after-submit`
- Baseline HEAD/master/origin/master: `b3d67e6e3c9518d6106b3774c9d54d4f03878901`
- Pre-edit readiness: passed; no tracked, staged, or untracked changes before this plan/status update.
- Dependency: `batch-140-personal-learning-ai-route-post-persistent-request` is `closed` / `pass`.

## Governance Read

- `AGENTS.md` project instructions supplied in the session.
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-batch-140-personal-learning-ai-route-post-persistent-request.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-140-personal-learning-ai-route-post-persistent-request.md`
- Skills read for this UI task: `build-web-apps:frontend-testing-debugging` and `browser:control-in-app-browser`.

## Allowed Files

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `e2e/personal-ai-generation-local-request.spec.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-12-batch-141-personal-learning-ai-ui-server-backed-history-after-submit.md`
- `docs/05-execution-logs/evidence/2026-06-12-batch-141-personal-learning-ai-ui-server-backed-history-after-submit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-12-batch-141-personal-learning-ai-ui-server-backed-history-after-submit.md`

## Blocked Files And Capabilities

- Blocked files: `.env.local`, `.env.example`, package/lockfiles, `src/db/schema/**`, `drizzle/**`, `src/app/**`,
  `src/server/**`, `playwright-report/**`, `test-results/**`.
- Route/repository/schema/contract/model edits, new e2e spec authoring, dependency changes, env/secret/provider work,
  generated-content persistence, deploy/payment/external-service work, PR, force-push, and Cost Calibration Gate
  execution remain blocked.

## Implementation Plan

1. Add RED UI tests proving a successful POST triggers a server GET history refresh instead of relying only on synthetic
   local rows.
2. Add RED UI tests proving history refresh errors are rendered as the existing error state without exposing tokens,
   provider payloads, raw prompts, raw answers, or generated content.
3. Inspect `studentRuntimeApi` and `StudentPersonalAiGenerationPage` to reuse existing local API patterns with minimal
   state changes.
4. Implement the smallest UI/runtime API change needed to refetch persisted redacted history after submit.
5. Run the declared focused unit test, existing local e2e spec, rendered Browser verification if a dev server target is
   practical, lint, typecheck, full unit, build, diff check, and Module Run v2 closeout scripts before commit.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`
- Rendered UI validation path: Browser plugin first per `frontend-testing-debugging`; fallback to declared Playwright e2e
  only if Browser invocation is unavailable or blocked.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-141-personal-learning-ai-ui-server-backed-history-after-submit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-141-personal-learning-ai-ui-server-backed-history-after-submit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-141-personal-learning-ai-ui-server-backed-history-after-submit`

## Risk Controls

- Preserve standard API envelope handling and camelCase DTOs.
- Do not edit route/repository/server contracts; consume only existing GET/POST surfaces.
- UI must not display provider payload, raw prompt, raw answer, raw generated content, session token, credentials, or
  internal numeric ids.
- Keep student UI states explicit: loading, empty, error, unauthorized, and redacted history.
- Stop if the task requires changing blocked server, schema, package, env/provider, generated-content, or e2e coverage
  beyond the existing declared local spec.
