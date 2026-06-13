# Evidence: batch-147-personal-learning-ai-server-owned-metadata-hardening

result: pass

## Batch 147

- Task: `batch-147-personal-learning-ai-server-owned-metadata-hardening`
- Branch: `codex/batch-147-personal-learning-ai-server-owned-metadata-hardening`
- Task kind: `implementation`
- Baseline: `e7ca66af0186ca632d57553aaab319f5e245e0a1`
- Commit: `e7ca66af0186ca632d57553aaab319f5e245e0a1` is the verified pre-edit repository baseline. The final immutable
  task commit SHA is reported in closeout because this evidence file participates in the task commit object.
- localFullLoopGate: L4 local API contract.
- threadRolloverGate: not required.
- nextModuleRunCandidate: `batch-148-personal-learning-ai-server-owned-metadata-security-review`.

## Approval Boundary

- The current user prompt approved local source hardening for server-owned metadata within queued allowedFiles.
- No env/secret, provider, dependency, schema/migration, e2e, generated-content write, formal content adoption, deploy,
  payment, external-service, PR, force-push, or Cost Calibration Gate action is approved or performed by this task.
- Cost Calibration Gate remains blocked.

## RED:

- Initial `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts` failed after
  adding the stale-client-metadata regression test. The failing response was `flowStatus: "blocked"` because
  client-supplied authorization status booleans were still trusted, and stale `resultPublicId`, `evidenceStatus`,
  `citationCount`, `aiCallLogPublicId`, and audit evidence references were still echoed or persisted.
- This confirmed the pre-hardening bug: client-supplied metadata could influence new local pending task metadata.

## GREEN:

- Added route hardening so local browser POST creates a server-owned request input before persistence and read-model
  construction.
- New local pending task creation now forces server-owned metadata: `resultPublicId: null`, `evidenceStatus: "none"`,
  `citationCount: 0`, `aiCallLogPublicId: null`, `auditLogPublicId: null`, and positive local contract readiness
  booleans.
- Existing session-normalized owner, actor, and quota owner behavior remains intact.
- Reused persistent tasks may still return repository-owned existing result/evidence metadata.

## Validation Log

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`:
  passed before edits on `codex/batch-147-personal-learning-ai-server-owned-metadata-hardening`; baseline `master` and
  `origin/master` were `e7ca66af0186ca632d57553aaab319f5e245e0a1`.
- `node .\node_modules\prettier\bin\prettier.cjs --write src/server/services/personal-ai-generation-request-route.ts src/server/services/personal-ai-generation-request-route.test.ts docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md docs/05-execution-logs/evidence/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md`:
  passed; only the route test file was reformatted.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts`: passed with
  `1` test file and `15` tests.
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts`: passed with
  `1` test file and `4` tests.
- `npm.cmd run test:unit -- src/server/services/ai-generation-task-request-service.test.ts`: passed with `1` test file
  and `4` tests.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:unit`: passed with `Test Files 247 passed (247)` and `Tests 903 passed (903)`.
- `npm.cmd run build`: passed; Next.js compiled successfully and generated `55` static pages. The build reported the
  existing local build environment, but this task did not open, copy, edit, or record env file contents.
- `git diff --check`: passed.
- `Select-String -Path docs/05-execution-logs/evidence/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md,docs/05-execution-logs/audits-reviews/2026-06-13-batch-147-personal-learning-ai-server-owned-metadata-hardening.md -Pattern 'server-owned metadata','client-supplied','Cost Calibration Gate remains blocked'`:
  passed; required anchors were present.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-147-personal-learning-ai-server-owned-metadata-hardening`:
  passed; scope scan covered only the batch-147 allowedFiles that changed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-147-personal-learning-ai-server-owned-metadata-hardening`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-147-personal-learning-ai-server-owned-metadata-hardening`:
  passed; `master`, `origin/master`, and project-state SHAs remain accepted ancestor checkpoints before the local task
  commit is fast-forward merged.

## Blocked Remainder

- Security review remains `batch-148`.
- Local role-flow e2e validation remains `batch-149`.
- Provider/env/dependency/local provider sandbox/Cost Calibration blocked gate remains `batch-150`.
- Provider execution, provider configuration, env/secret work, dependency/package/lockfile changes, schema/migration,
  e2e edits, generated-content writes, formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and
  `mistake_book` adoption paths, deploy, payment, external-service, PR, force-push, and authorization model changes
  remain blocked.
- Cost Calibration Gate remains blocked.
