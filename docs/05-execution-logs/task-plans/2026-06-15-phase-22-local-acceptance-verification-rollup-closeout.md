# Task Plan: Phase 22 Local Acceptance Verification Rollup Closeout

## Task

- Task id: `phase-22-local-acceptance-verification-rollup-closeout`
- Branch: `codex/phase-22-local-acceptance-verification-rollup-closeout`
- Baseline: `318b1a7b7026aecc3794e31fe25c717fb5e4b35a`
- Task kind: `docs_only_rollup_closeout`
- Source story: `phase-22-mvp-local-acceptance-reaudit`

## Inputs Re-Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Six Phase 22 seeded candidate task plans, evidence files, and audit reviews:
  - `phase-22-local-acceptance-account-auth-verification`
  - `phase-22-local-acceptance-content-production-verification`
  - `phase-22-local-acceptance-student-answering-verification`
  - `phase-22-local-acceptance-mistake-learning-verification`
  - `phase-22-local-acceptance-admin-operations-verification`
  - `phase-22-local-acceptance-security-evidence-verification`

## Fresh Approval

The user approved this docs-only rollup closeout only:

- Do not claim any other task.
- Do not start a dev server.
- Do not use Browser or Playwright.
- Do not access DB.
- Do not read, output, summarize, or modify `.env*`.
- Do not call providers/models, inspect provider payloads, capture raw prompts/raw answers, measure quota/cost, or run Cost Calibration Gate.
- Do not modify `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`, package files, or lockfiles.
- Do not use raw SQL, migration, seed/bootstrap, or destructive DB.
- Do not access staging/prod/cloud/deploy/payment/external-service.
- Do not create PRs or force push.
- Do not expose secrets, tokens, cookies, Authorization headers, DB URL, provider payloads, raw prompts, raw answers, public identifiers, row data, or private data.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-verification-rollup-closeout.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-verification-rollup-closeout.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-verification-rollup-closeout.md`

## Plan

1. Reconfirm `master`, `origin/master`, clean worktree, and no local or remote `codex/*` residue.
2. Create branch `codex/phase-22-local-acceptance-verification-rollup-closeout`.
3. Summarize the six seeded candidate task results from queue/evidence/audit only.
4. Write a local acceptance matrix using the approved status vocabulary:
   - `local_verified`
   - `metadata_only`
   - `mock_only`
   - `deferred`
   - `needs_recheck`
   - `blocked`
   - `staging_blocked`
5. Record the Phase 22 rollup conclusion: scoped local non-provider/local acceptance verification is closed, while provider/model, raw prompt/raw answer, quota/cost, Cost Calibration, staging/prod/cloud, admin-only redaction, object storage, OCR, and public URL remainders stay deferred or blocked.
6. Update `project-state.yaml` and `task-queue.yaml` with the docs-only rollup closeout.
7. Run `git diff --check`, `npm.cmd run lint`, `npm.cmd run typecheck`, GitCompletionReadiness, PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
8. If validation passes, create one local commit, fast-forward merge to `master`, rerun necessary master validation, push `origin/master`, delete the merged local branch, fetch prune, and confirm clean alignment.

## Stop Conditions

- Rollup requires any blocked file.
- Rollup requires `.env*`, DB access, dev server, Browser, Playwright, provider/model call, raw prompt/raw answer, quota/cost, Cost Calibration, staging/prod/cloud, raw SQL, migration, seed/bootstrap, destructive DB, source/test/e2e/schema/drizzle/scripts/package/lockfile modification, dependency change, PR, or force push.
- Six candidate queue/evidence/audit records contain a substantive conflict that cannot be truthfully archived docs-only.
- Evidence cannot be redacted without leaking sensitive data.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-verification-rollup-closeout`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-verification-rollup-closeout`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-verification-rollup-closeout`
