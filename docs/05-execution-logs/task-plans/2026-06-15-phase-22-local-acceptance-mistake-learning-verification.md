# Phase 22 Local Acceptance Mistake Learning Verification Task Plan

## Task

- Task ID: `phase-22-local-acceptance-mistake-learning-verification`
- Branch: `codex/phase-22-local-acceptance-mistake-learning-verification`
- Verification journey: `mistake_and_learning_loop`
- Target entities: `mistake_book`, `ai_explanation`, `ai_hint`, `learning_suggestion`, `kn_recommendation`, `exam_report`
- Status at claim: `in_progress`

## Fresh Approval

User approved approval package v6 on 2026-06-15:

- Claim task 4 only.
- Acknowledge task 3 remains partial: `practice`, `mock_exam`, and `answer_record` were locally API-verified, while `exam_report.generation` remains a provider-gated remainder.
- Verify only the non-provider `mistake_book` local loop for task 4.
- Mark `ai_explanation`, `ai_hint`, `learning_suggestion`, `kn_recommendation`, and `exam_report.generation` as `deferred`, `needs_recheck`, or `mock_only` if provider access would be required.
- Do not read `.env*`, call providers/models, measure quota/cost, run Cost Calibration Gate, or modify source/test/e2e/schema/drizzle/scripts/package/lockfile files.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/02-architecture/interfaces/phase-22-mvp-local-acceptance-reaudit-contract.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-verification-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-student-answering-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-student-answering-verification.md`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-mistake-learning-verification.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-mistake-learning-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-mistake-learning-verification.md`

## Blocked Files And Gates

- `.env.local`, `.env.example`, `.env.*`
- `package.json`, `pnpm-lock.yaml`, `package-lock.yaml`, `package-lock.json`
- `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`
- Provider/model request, provider configuration, quota/cost, and Cost Calibration Gate.
- Raw SQL, destructive DB operations, seed/bootstrap scripts, schema migrations, dependency changes, staging/prod/cloud/deploy/payment/external-service, PR, and force push.

## Verification Plan

1. Confirm branch, SHA alignment, clean worktree, and no local/remote `codex/*` residue before claim.
2. Record this task plan and in-progress state/queue claim under allowed files only.
3. Use existing application runtime and local-only endpoints/UI to create or reuse a minimal fixture required for a wrong-answer-to-`mistake_book` observation, without writing credentials, tokens, public IDs, row data, or private data to evidence.
4. Verify non-provider `mistake_book` local behavior:
   - wrong objective answer creates a mistake entry;
   - list endpoint returns an entry;
   - detail endpoint returns the selected entry;
   - favorite/unfavorite or equivalent state transition works if available;
   - mark-mastered and remove transitions work if available.
5. Exercise localhost UI observation only when it can be done without provider access or secret exposure.
6. Keep provider-gated AI surfaces as remainders:
   - `ai_explanation`
   - `ai_hint`
   - `learning_suggestion`
   - `kn_recommendation`
   - `exam_report.generation`
7. Stop and record evidence/audit if verification requires provider access, blocked files, raw SQL, migrations, destructive DB operations, source/test/e2e/schema/scripts/dependency edits, or non-redactable evidence.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-mistake-learning-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-mistake-learning-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-mistake-learning-verification`

## Evidence Rules

- Record only sanitized statuses, endpoint categories, gate names, and command pass/fail results.
- Do not record account passwords, cookies, tokens, authorization headers, DB URLs, card-code plaintext, public IDs, row data, private data, provider payloads, raw prompts, or raw answers.
- Do not claim full `local_verified` unless all task target entities are locally covered without provider-gated remainders.
