# Task Plan: batch-169-personal-learning-ai-local-e2e-validation

## Scope

- Task: `batch-169-personal-learning-ai-local-e2e-validation`
- Branch: `codex/batch-169-personal-learning-ai-local-e2e-validation`
- Baseline: `e86314381c67fe66614ea9a4e3f6b4c5596ad8f1`
- Task kind: local e2e validation.

## Readiness

- Re-read `AGENTS.md`.
- Re-read `docs/03-standards/code-taste-ten-commandments.md`.
- Re-read `docs/02-architecture/adr/*.md`.
- Re-read `docs/04-agent-system/state/project-state.yaml`.
- Re-read `docs/04-agent-system/state/task-queue.yaml`.
- Re-read recent batch-162 and batch-168 evidence/audit records.
- Confirmed `HEAD`, `master`, and `origin/master` are all `e86314381c67fe66614ea9a4e3f6b4c5596ad8f1`.
- Confirmed the worktree is clean before edits.
- Confirmed no local or remote `codex/*` branches remained before task branch creation.
- Created short branch `codex/batch-169-personal-learning-ai-local-e2e-validation`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it passed.

## Human Approval

- human approval: The user prompt on 2026-06-13 approved executing the recommended next work, which was
  `batch-169-personal-learning-ai-local-e2e-validation`.
- Approved scope:
  - local-only existing Playwright e2e validation;
  - target existing spec `e2e/personal-ai-generation-local-request.spec.ts`;
  - update the existing spec only if needed for the batch-168 API/UI contract surface;
  - use redacted evidence that records command, result, spec name, and test count only.
- Artifact handling:
  - run the target spec with list reporter to avoid creating `playwright-report/**`;
  - no trace/screenshot/video artifact should be preserved in repository evidence;
  - do not commit generated e2e artifacts.
- Not approved: provider calls, model requests, sandbox execution, env/secret reads or writes, `.env.local`,
  schema/migration, dependency/package/lockfile changes, staging/prod/cloud, deploy, payment, external-service, formal
  generated-content adoption, PR, force-push, and Cost Calibration.

## Allowed Files

- `e2e/personal-ai-generation-local-request.spec.ts`
- `tests/unit/student-personal-ai-generation-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-169-personal-learning-ai-local-e2e-validation.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-169-personal-learning-ai-local-e2e-validation.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-169-personal-learning-ai-local-e2e-validation.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, `package.json`, `pnpm-lock.yaml`, package lockfiles.
- `src/db/schema/**`, `drizzle/**`, `materials/**`, `paper_assets/**`, `playwright-report/**`, `test-results/**`.
- Provider calls, model requests, sandbox execution, env/secret use, schema/migration, dependency changes,
  staging/prod/cloud, deploy, payment, external-service, PR, force-push, formal generated-content adoption, and Cost
  Calibration.

## Plan

1. Add e2e coverage for the batch-168 `isFormalAdoptionBlocked` no-formal-adoption field in the existing local request
   spec.
2. Run `npm.cmd run test:e2e -- --list` to confirm the target spec is discoverable.
3. Run only `e2e/personal-ai-generation-local-request.spec.ts` with list reporter against `127.0.0.1`.
4. Run lint, typecheck, unit, build, diff check, and Module Run v2 gates.
5. Write redacted evidence and audit without env values, provider payloads, generated content body, row data, or secrets.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run test:e2e -- --list`
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts --reporter=list`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-169-personal-learning-ai-local-e2e-validation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-169-personal-learning-ai-local-e2e-validation`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-169-personal-learning-ai-local-e2e-validation`

## Rollback And Recovery

- If the e2e spec or validation fails, keep the failure local, record redacted evidence, and do not merge.
- No database migration, provider execution, dependency change, or deployment rollback is needed because those actions
  remain blocked.
