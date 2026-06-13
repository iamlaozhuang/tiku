# Evidence: batch-148-personal-learning-ai-server-owned-metadata-security-review

result: pass

## Batch 148

- Task: `batch-148-personal-learning-ai-server-owned-metadata-security-review`
- Branch: `codex/batch-148-personal-learning-ai-server-owned-metadata-security-review`
- Task kind: `security_review`
- Baseline: `2368b3795858392a000bb3e00690da96309bbfb0`
- Commit: `2368b3795858392a000bb3e00690da96309bbfb0` is the verified pre-edit repository baseline. The final immutable
  task commit SHA is reported in closeout because this evidence file participates in the task commit object.
- localFullLoopGate: L0 security review docs-only.
- threadRolloverGate: not required.
- nextModuleRunCandidate: `batch-149-personal-learning-ai-local-role-flow-server-owned-metadata-validation`.

## Approval Boundary

- The queue approves docs-only/read-only security review after batch-147 closeout.
- This task did not edit product source, tests, e2e, schema/migration, dependencies, env/secret, provider,
  generated-content, deploy, payment, external-service, PR, force-push, or Cost Calibration surfaces.
- Cost Calibration Gate remains blocked.

## RED:

- Security review looked for a regression where client-supplied metadata could still become durable
  result/evidence/reference metadata after batch-147.
- The reviewed risk areas were server-owned metadata normalization, owner-scoped persistent history, public ids only
  DTOs, `ai_call_log` evidence references, provider/generated-content blocking, and formal content adoption blocking.

## GREEN:

- No blocking finding was identified.
- `POST /api/v1/personal-ai-generation-requests` local browser mode now builds server-owned metadata before
  persistence and read-model construction.
- New local pending task creation forces `resultPublicId: null`, `evidenceStatus: "none"`, `citationCount: 0`,
  `aiCallLogPublicId: null`, and null audit evidence references before calling `createOrReuseRequest`.
- Persistent history is scoped by session owner through `owner_type = personal`, `owner_public_id`, and task type
  filters; idempotency reuse is also owner-scoped.
- History and local browser DTOs expose redacted public ids only, status, evidence summary, citation count, and
  `ai_call_log` public-id references. They do not expose raw provider payloads, prompts, generated content, internal
  autoincrement ids, DB rows, secrets, or tokens.
- Formal generated-content adoption into `question`, `paper`, `practice`, `mock_exam`, `exam_report`, or
  `mistake_book` remains outside this path and blocked by queue policy.

## Residual Risk

- `createOrReuseRequest` still accepts result/evidence fields from its internal caller. This is acceptable for the
  current route because batch-147 normalizes the only active local browser persistence caller first, but any future
  caller, provider-result adoption path, or generated-content write path must re-establish server-owned metadata at the
  service boundary before enabling persistence.
- Local role-flow behavior still needs the queued batch-149 existing e2e validation.
- Provider/env/dependency/local provider sandbox and Cost Calibration boundaries still need batch-150 blocked-gate
  refinement.

## Validation Log

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`:
  passed before edits on `codex/batch-148-personal-learning-ai-server-owned-metadata-security-review`; baseline
  `master` and `origin/master` were `2368b3795858392a000bb3e00690da96309bbfb0`.
- `node .\node_modules\prettier\bin\prettier.cjs --write docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-148-personal-learning-ai-server-owned-metadata-security-review.md docs/05-execution-logs/evidence/2026-06-13-batch-148-personal-learning-ai-server-owned-metadata-security-review.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-148-personal-learning-ai-server-owned-metadata-security-review.md`:
  passed.
- `git diff --check`: passed.
- `Select-String -Path docs/05-execution-logs/evidence/2026-06-13-batch-148-personal-learning-ai-server-owned-metadata-security-review.md,docs/05-execution-logs/audits-reviews/2026-06-13-batch-148-personal-learning-ai-server-owned-metadata-security-review.md -Pattern 'server-owned metadata','public ids only','ai_call_log','Cost Calibration Gate remains blocked'`:
  passed; required anchors were present.
- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npm.cmd run test:unit`: passed with `Test Files 247 passed (247)` and `Tests 903 passed (903)`.
- `npm.cmd run build`: passed; Next.js compiled successfully and generated `55` static pages. The build reported the
  existing local build environment, but this task did not open, copy, edit, or record env file contents.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-148-personal-learning-ai-server-owned-metadata-security-review`:
  passed; scope scan covered only the batch-148 allowedFiles that changed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-148-personal-learning-ai-server-owned-metadata-security-review`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-148-personal-learning-ai-server-owned-metadata-security-review`:
  passed; `master`, `origin/master`, and project-state SHAs remain accepted ancestor checkpoints before the local task
  commit is fast-forward merged.

## Blocked Remainder

- Local role-flow validation remains `batch-149`.
- Provider and generated-content write paths remain blocked.
- Provider/env/secret work, dependency/package/lockfile changes, schema/migration, e2e execution, deploy, payment,
  external-service, PR, force-push, and Cost Calibration Gate execution remain blocked.
- Cost Calibration Gate remains blocked.
