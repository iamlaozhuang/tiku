# Task Plan: Advanced Student AI Generation Result Detail UI

## Task

- Task id: `advanced-student-ai-generation-result-detail-ui`
- Branch: `codex/advanced-student-ai-generation-result-detail-ui`
- Date: 2026-06-15
- Baseline: `c2364d3ba356f4beb5a7c46d8be2548d1a7c22f8`
- Task kind: local UI implementation

## Readiness And References

- Startup gate passed after `git switch master`, `git fetch --prune origin`, clean worktree check, `HEAD == master == origin/master`, and no local/remote `codex/*` refs before branch creation.
- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read all ADR files in `docs/02-architecture/adr/`, with ADR-002 as the primary route/service/UI boundary.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Read `docs/01-requirements/traceability/capability-catalog.md`.
- Read `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`.
- Read related evidence/audit for:
  - `advanced-personal-ai-generation-result-redacted-detail-read-model-service`
  - `advanced-personal-ai-generation-result-redacted-detail-readonly-route`
  - `advanced-student-ai-generation-result-history-ui`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-advanced-student-ai-generation-result-detail-ui.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-student-ai-generation-result-detail-ui.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-student-ai-generation-result-detail-ui.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

Blocked:

- `.env*` read/output/summary/modification.
- DB access, row/private data, provider/model calls, provider configuration, raw prompt/raw answer/provider payload, token/cookie/Authorization header/DB URL exposure.
- Schema, drizzle, migration, scripts, package, lockfile, dependency changes.
- Dev server, Browser, Playwright, e2e.
- Quota/cost/Cost Calibration, staging/prod/cloud/deploy/payment/external-service.
- Formal adoption write, PR, force-push.

## TDD Plan

1. RED: Add focused component tests for result detail entry, detail loading, empty/not-found, error, redacted detail ready state, formal adoption blocked display, and absence of raw/provider/private fields.
2. GREEN: Add only the UI state, fetch helper, affordance button, and redacted detail panel needed to satisfy those tests.
3. Refactor only within the touched UI/test file if needed, keeping route/local contract fields unchanged.

## Implementation Notes

- Use existing `fetchStudentApi` and the existing readonly detail route path `/api/v1/personal-ai-generation-results/{publicId}`.
- Do not introduce a service, schema, repository, route, dependency, or browser validation surface.
- Keep displayed fields limited to `PersonalAiGenerationResultDetailDto` and nested public/redacted DTO fields.
- Keep `runtimeStatus: "local_contract_only"`, `redactionStatus: "redacted"`, `contentVisibility: "redacted_snapshot"`, and `formalAdoptionWriteStatus: "blocked_without_follow_up_task"` visible in the UI.

## Validation Plan

- `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-student-ai-generation-result-detail-ui`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-student-ai-generation-result-detail-ui`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-student-ai-generation-result-detail-ui`

## Risk Controls

- Evidence will record command names/results only, with no sensitive payloads or private data.
- If any gate fails, stop and do not begin the follow-up audit task.
- The follow-up readonly audit remains pending until this task is committed, merged, pushed, cleaned, pruned, and rechecked.
