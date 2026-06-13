# Task Plan: batch-176-personal-learning-ai-formal-adoption-design

## Scope

- Task: `batch-176-personal-learning-ai-formal-adoption-design`
- Branch: `codex/batch-176-personal-learning-ai-formal-adoption-design`
- Baseline: `47f0008a87881d889d5094760a2dadb58bfe2d6c`
- Task kind: docs-only formal generated-content adoption design gate.

## Readiness

- Re-read `AGENTS.md`.
- Re-read `docs/03-standards/code-taste-ten-commandments.md`.
- Re-read `docs/02-architecture/adr/*.md`.
- Re-read `docs/04-agent-system/state/project-state.yaml`.
- Re-read `docs/04-agent-system/state/task-queue.yaml`.
- Re-read recent batch-172 and batch-173 evidence/audit records.
- Re-read generated-content boundary and implementation context:
  - `docs/05-execution-logs/evidence/2026-06-13-batch-159-personal-learning-ai-generated-content-adoption-boundary-review.md`
  - `docs/05-execution-logs/evidence/2026-06-13-batch-167-personal-learning-ai-generated-content-persistence.md`
  - `docs/05-execution-logs/evidence/2026-06-13-batch-168-personal-learning-ai-api-ui-wiring.md`
  - `docs/05-execution-logs/evidence/2026-06-13-batch-169-personal-learning-ai-local-e2e-validation.md`
  - `docs/05-execution-logs/evidence/2026-06-13-batch-170-personal-learning-ai-generated-content-persistence-implementation.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-13-batch-170-personal-learning-ai-generated-content-persistence-implementation.md`
- Re-read requirement and SOP anchors:
  - `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
  - `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
  - `docs/04-agent-system/sop/advanced-edition-implementation-boundary-checklist.md`
  - `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- Confirmed `HEAD`, `master`, local `origin/master`, and remote `origin/master` are all
  `47f0008a87881d889d5094760a2dadb58bfe2d6c`.
- Confirmed the worktree is clean before edits.
- Confirmed no local or remote `codex/*` branches remain before task branch creation.
- Created short branch `codex/batch-176-personal-learning-ai-formal-adoption-design`.
- Ran pre-edit readiness with `Test-GitCompletionReadiness.ps1 -BaseBranch master`; it passed.

## Human Approval

- human approval: The user prompt on 2026-06-13 approved executing
  `batch-176-personal-learning-ai-formal-adoption-design`.
- Approved scope:
  - modify only state, queue, task plan, evidence, and audit files for this task;
  - design the adoption boundary from generated-content drafts to formal `question`, `paper`, `practice`,
    `mock_exam`, `exam_report`, and `mistake_book`;
  - record review workflow, permission requirements, rollback strategy, audit requirements, and future
    implementation gate requirements.
- Not approved:
  - formal writes or adoption implementation;
  - provider calls, model requests, sandbox execution, or Cost Calibration;
  - source, tests, e2e, schema, Drizzle, dependency, package, lockfile, env, secret, deploy, payment, or
    external-service changes;
  - reading, creating, modifying, or printing `.env.local` or any real secret/env/provider configuration.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`
- `docs/05-execution-logs/evidence/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`
- `docs/05-execution-logs/audits-reviews/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`

## Blocked Files And Actions

- `.env.local`, `.env.example`, `package.json`, `pnpm-lock.yaml`, package lockfiles.
- `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `playwright-report/**`, `test-results/**`.
- Provider calls, model requests, local provider sandbox execution, env/secret access, provider configuration access,
  schema/migration, dependency changes, source/test/e2e changes, staging/prod/cloud, deploy, payment, external-service,
  PR, force-push, formal generated-content writes, implementation of adoption behavior, and Cost Calibration.

## Design Approach

- Preserve `personal_ai_generation_result` as a personal draft source domain. A draft can become an adoption candidate
  only through a future explicit review workflow; it must never write directly into formal tables.
- Keep `isFormalAdoptionBlocked: true` as the current runtime contract until a later implementation task introduces an
  approved adoption workflow and updates tests.
- Define target-specific boundaries:
  - `question`: future adoption may create or update a draft-only `question` candidate after teacher review, source
    traceability, validation, duplicate checks, and audit. It must not publish automatically.
  - `paper`: future adoption may assemble a draft `paper` from reviewed draft `question` records and explicit
    `paper_section` or `question_group` structure. It must not publish automatically.
  - `practice`: generated content must not create formal `practice` sessions. Formal `practice` can only arise from a
    user action against already formal content under existing `authorization`.
  - `mock_exam`: generated content must not create formal `mock_exam` sessions. Formal `mock_exam` can only arise from
    a user action against a published `paper` under existing `authorization`.
  - `exam_report`: generated content must not create formal `exam_report` records. Reports remain downstream of
    submitted `answer_record` or `mock_exam` scoring.
  - `mistake_book`: generated content must not create formal `mistake_book` records. Mistake entries remain downstream
    of scoring and answer history.
- Record review ownership, permission checks, rollback behavior, and audit fields without changing runtime behavior.
- Leave batch-177 blocked until a future approval names exact write targets, files, authorization model, schema/migration
  status, e2e scope, rollback behavior, and validation commands.

## Validation Plan

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md docs/05-execution-logs/evidence/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md docs/05-execution-logs/audits-reviews/2026-06-13-batch-176-personal-learning-ai-formal-adoption-design.md`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId batch-176-personal-learning-ai-formal-adoption-design`

## Validation Boundary

- `npm.cmd run build` is intentionally not planned because local Next.js build has previously reported loading
  `.env.local`, which conflicts with this task's explicit no real env/secret access boundary.
- No e2e command is planned because this task is docs-only and e2e remains outside the approval boundary.

## Rollback And Recovery

- Revert the batch branch before merge if validation fails.
- No runtime rollback is required because this task changes no source, schema, migration, dependency, env/secret,
  provider configuration, sandbox command, deployment, or formal generated-content behavior.
