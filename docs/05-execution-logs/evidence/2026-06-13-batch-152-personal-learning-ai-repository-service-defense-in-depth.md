# Evidence: batch-152-personal-learning-ai-repository-service-defense-in-depth

result: pass

## Batch 152

- Task: `batch-152-personal-learning-ai-repository-service-defense-in-depth`
- Branch: `codex/batch-152-personal-learning-ai-repository-service-defense-in-depth`
- Task kind: `implementation`
- Baseline: `31e00b2d918d91fd13604e2788b24073d62dcf48`
- Commit: `31e00b2d918d91fd13604e2788b24073d62dcf48` is the verified pre-edit repository baseline. The final immutable
  task commit SHA is reported in closeout because this evidence file participates in the task commit object.
- localFullLoopGate: L4 local API contract.
- threadRolloverGate: not required.
- nextModuleRunCandidate: `batch-153-personal-learning-ai-route-service-repository-metadata-security-review`.

## Approval Boundary

- The current user prompt and batch-152 queue entry approved scoped local source hardening for repository/service
  server-owned pending metadata after batch-151 seeding.
- Scope is limited to the queued personal AI request repository/service/model/validator files and batch-152 docs/state
  files. The actual source change touched only the repository and repository test files.
- No env/secret, provider, dependency, schema/migration, e2e, generated-content write, formal content adoption, deploy,
  payment, external-service, PR, force-push, or Cost Calibration Gate action is approved or performed by this task.
- Cost Calibration Gate remains blocked.

## RED:

- Added a focused repository regression test:
  `creates new pending requests with server-owned result metadata`.
- Initial `npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts` failed
  with `1 failed | 5 passed`.
- The failure showed `insertPendingRequest` still received client-supplied stale metadata:
  `resultPublicId`, `evidenceStatus`, `citationCount`, and `aiCallLogPublicId` were forwarded from the caller.
- This confirmed the batch-148 residual risk that route-level normalization was the only active defense for new pending
  persistence metadata.

## GREEN:

- Added `createServerOwnedPendingRequestInput` inside
  `src/server/repositories/personal-ai-generation-request-repository.ts`.
- New pending personal AI request persistence now passes server-owned pending metadata to the gateway:
  `resultPublicId: null`, `evidenceStatus: "none"`, `citationCount: 0`, and `aiCallLogPublicId: null`.
- Idempotent reuse is unchanged: existing repository-owned rows are returned before pending insert normalization.
- Route, flow, and AI generation task request policy focused tests still pass.
- No provider, generated-content, formal content adoption, schema/migration, dependency, env/secret, e2e, deploy,
  payment, external-service, PR, force-push, or Cost Calibration work was performed.

## Validation Log

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`:
  passed before edits on `codex/batch-152-personal-learning-ai-repository-service-defense-in-depth`; baseline `master`
  and `origin/master` were `31e00b2d918d91fd13604e2788b24073d62dcf48`.
- `npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts`: RED failed as
  expected with `1` failing test and `5` passing tests before implementation.
- `npm.cmd run test:unit -- src/server/repositories/personal-ai-generation-request-repository.test.ts`: GREEN passed
  with `1` test file and `6` tests after implementation.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`: passed with `1` test
  file and `15` tests.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts`: passed with `1`
  test file and `4` tests.
- `npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts`: passed with `1` test file
  and `4` tests.
- `node .\node_modules\prettier\bin\prettier.cjs --write src/server/repositories/personal-ai-generation-request-repository.ts src/server/repositories/personal-ai-generation-request-repository.test.ts docs/05-execution-logs/task-plans/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md`:
  passed; all files were unchanged by formatting.
- `git diff --check`: passed.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:unit`: passed with `Test Files 247 passed (247)` and `Tests 904 passed (904)`.
- `npm.cmd run build`: passed; Next.js compiled successfully and generated `55` static pages. The build reported the
  existing local build environment, but this task did not open, copy, edit, or record env file contents.
- `Select-String -Path docs/05-execution-logs/evidence/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md,docs/05-execution-logs/audits-reviews/2026-06-13-batch-152-personal-learning-ai-repository-service-defense-in-depth.md -Pattern 'server-owned pending metadata','repository/service','client-supplied','Cost Calibration Gate remains blocked'`:
  passed; required anchors were present.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-152-personal-learning-ai-repository-service-defense-in-depth`:
  passed; scope scan covered only the batch-152 allowedFiles that changed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-152-personal-learning-ai-repository-service-defense-in-depth`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-152-personal-learning-ai-repository-service-defense-in-depth`:
  passed; `master`, `origin/master`, and project-state SHAs remain accepted ancestor checkpoints before the local task
  commit is fast-forward merged.

## Blocked Remainder

- Security review remains `batch-153`.
- Existing local role-flow e2e validation remains `batch-154`.
- Provider/env/dependency/local provider sandbox/Cost Calibration blocked gate refresh remains `batch-155`.
- Provider execution, provider configuration, env/secret work, dependency/package/lockfile changes, schema/migration,
  e2e edits/execution, generated-content writes, formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`,
  and `mistake_book` adoption paths, deploy, payment, external-service, PR, force-push, and authorization model changes
  remain blocked.
- Cost Calibration Gate remains blocked.
