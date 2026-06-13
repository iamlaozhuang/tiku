# Evidence: batch-131-personal-learning-ai-session-public-id-request-alignment

result: pass

## Summary

- Task id: `batch-131-personal-learning-ai-session-public-id-request-alignment`
- Branch: `codex/batch-131-personal-learning-ai-session-public-id-request-alignment`
- Task kind: implementation
- Scope: align the student personal AI request `userPublicId`, `actorPublicId`, `ownerPublicId`, and
  `quotaOwnerPublicId` with the current local student session; remove the batch-130 Playwright route payload rewrite.
- Fresh approval: user approved executing this suggested follow-up task after batch-130.
- localFullLoopGate: L5 local session-aligned e2e.
- Cost Calibration Gate remains blocked.

## Batch Evidence

- Batch range: batch-131
- dependency: `batch-130-personal-learning-ai-dedicated-local-e2e-spec` is closed and pushed to `origin/master`.
- localExperienceClosureGate: personal-learning-ai-experience remains local-only.
- threadRolloverGate: no thread rollover required for this scoped follow-up.
- nextModuleRunCandidate: none selected in this task; no additional personal-learning-ai task is executed in this run.
- blocked remainder: provider calls, env/secret changes, schema/migration changes, dependency/package/lockfile changes,
  deploy, payment, external-service, PR, force-push, formal generated-content write paths, authorization model changes,
  and Cost Calibration Gate remain blocked.

## Pre-Edit Readiness

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`:
  passed on branch `codex/batch-131-personal-learning-ai-session-public-id-request-alignment`; no changed or untracked
  files before batch-131 edits. Baseline was `aba3cb866887f539ca37e206b2a2463a66acad61`.

## RED:

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts` failed as expected after test changes
  and before implementation: the focused test expected `/api/v1/sessions` plus the request call, but current code made
  only `1` fetch call.
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts` failed as expected after removing the
  test-only payload rewrite: posted `userPublicId`, `actorPublicId`, `ownerPublicId`, and `quotaOwnerPublicId` still
  used `student-public-001` instead of the current local student session public id.

## GREEN:

- Added `fetchCurrentStudentSession` to the student runtime helper using the existing `/api/v1/sessions` route and
  existing auth header creation.
- Updated `StudentPersonalAiGenerationPage` to fetch the current session before request submission and to override only
  `userPublicId`, `actorPublicId`, `ownerPublicId`, and `quotaOwnerPublicId` with the session user public id.
- Removed the Playwright route payload rewrite from the dedicated local e2e spec and asserted the posted request body
  directly.
- Focused GREEN:
  `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts` passed with `6` tests.
- Focused GREEN:
  `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts` passed with `1` test.
- Intermediate typecheck caught an over-narrow test fixture annotation; fixed by keeping the UI fetch mock response at
  the `unknown` JSON boundary instead of binding the entire fixture to a service DTO.

## Validation

- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`: passed, `6` tests.
- `npm.cmd run test:e2e -- e2e/personal-ai-generation-local-request.spec.ts`: passed, `1` test.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:unit`: passed, `Test Files 245 passed (245)`, `Tests 879 passed (879)`.
- `npm.cmd run build`: passed, Next.js 16.2.6 compiled successfully and generated 55 static pages.
- `git diff --check`: passed.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-131-personal-learning-ai-session-public-id-request-alignment`:
  passed with `filesToScan: 9`; all changed files matched batch-131 allowed scope.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-131-personal-learning-ai-session-public-id-request-alignment`:
  passed.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-131-personal-learning-ai-session-public-id-request-alignment`:
  passed.

## Commit

- Commit: `aba3cb866887f539ca37e206b2a2463a66acad61` is the verified pre-edit repository baseline. The final immutable
  task commit SHA is reported in closeout because this evidence file participates in the task commit object.

## Out Of Scope

- No route, service, repository, mapper, persistence, schema, migration, dependency, package/lockfile, env, provider,
  deploy, payment, external-service, PR, force-push, authorization model, or formal generated-content write path changes.
- No headed/debug e2e mode and no full-suite e2e default expansion.
- No raw provider payload, raw generated content, full paper content, internal numeric ids, auth header value, local
  session material, or local credential value in committed evidence.
