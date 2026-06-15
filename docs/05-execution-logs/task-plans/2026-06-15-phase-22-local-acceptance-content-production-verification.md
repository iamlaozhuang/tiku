# Task Plan: Phase 22 Content Production Local Acceptance Verification

## Task

- Task id: `phase-22-local-acceptance-content-production-verification`
- Branch: `codex/phase-22-local-acceptance-content-production-verification`
- Date: 2026-06-15
- Baseline: `b58cc4d3404bf5efc82b0484050076defe553040`
- Task kind: `local_acceptance_verification_candidate`
- Verification journey: `content_production`

## Fresh Local State

- Startup branch: `master`
- `HEAD` / `master` / `origin/master`: `b58cc4d3404bf5efc82b0484050076defe553040`
- Worktree before claim: clean
- Local `codex/*` residue before claim: none observed
- Remote `origin/codex/*` residue before claim: none observed after `git fetch --prune origin`

## Inputs Re-Read

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

## Human Approval

The user approved a unified upfront authorization for the remaining Phase 22 seeded candidate tasks 2-6. For this task,
the approval permits one-at-a-time claim, local dev server on localhost or 127.0.0.1, Browser-first or Playwright
fallback local observation, application UI/API mediated use of the local dev DB, in-process use of the existing project
runtime/env loader only for the required local `DATABASE_URL`, and minimal fixture creation through existing ORM or
service-layer paths when needed for the current verification.

The same approval permits task plan, evidence, audit, state, and queue updates, validation commands, one local commit,
fast-forward merge to `master`, `master` validation, push to `origin/master`, merged short-branch deletion, fetch prune,
and clean alignment checks after the task passes.

## Boundaries

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-content-production-verification.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-content-production-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-content-production-verification.md`

Blocked writes and actions:

- `.env*`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`
- dependency changes, schema or migration work, raw SQL, seed/bootstrap scripts, destructive DB operations
- object storage, binary upload, OCR, public URL validation, staging/prod/cloud/deploy, payment, external-service
- provider/model calls, quota/cost measurement, Cost Calibration Gate
- PR, force push, secret/token/cookie/Authorization header/DB URL/card-code plaintext/publicId/row-data/private-data exposure

## Verification Approach

1. Read-only inspect the local content production route/API/service surface for `material`, `question`,
   `knowledge_node`, `tag`, `paper`, `paper_section`, and `paper_asset` metadata.
2. Start a local dev server only on localhost or 127.0.0.1 if runtime observation is needed.
3. Use Browser first, with Playwright only as fallback, to observe content production UI/API behavior.
4. Prepare the smallest current-task fixture through application UI/API or existing ORM/service-layer paths if the
   content-production route needs role/content prerequisites.
5. Record only redacted, bounded evidence: route/API names, role class, entity coverage, expected state, observed state,
   pass/fail, status label, and gaps.
6. Mark object-storage, binary upload, OCR, public URL, or cloud callback surfaces as `metadata_only` or
   `staging_blocked` rather than attempting out-of-scope work.
7. Stop and record evidence/audit if verification requires source/test/e2e/schema/drizzle/script/dependency/env/provider
   changes, raw SQL, seed/bootstrap, destructive DB work, or non-local services.

## Validation Commands

The task queue does not declare task-specific validation commands for this candidate. The task will run the standard
authorized closeout surface:

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-content-production-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-content-production-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-content-production-verification`

## Risk Controls

- Treat this as verification and evidence work, not repair work.
- Do not claim full local acceptance unless local evidence explicitly covers the target entities.
- Keep `paper_asset` binary/object-storage/OCR/public URL behavior separate from metadata verification.
- Do not record generated credentials, cookies, tokens, card-code plaintext, public identifiers, DB URLs, row data, full
  papers, full source documents, raw prompts, raw answers, or private user data.
- If the existing application cannot create or observe the minimum content-production state without blocked work, close
  this task as blocked or partial with `needs_recheck`, `metadata_only`, or `staging_blocked` labels as appropriate.

## Execution Result

- Local API evidence covered the content-production API chain for `knowledge_node`, `tag`, `material`, `question`,
  `paper`, `paper_section`, and `paper_asset` metadata. All observed API calls returned HTTP 200 and `code=0`.
- `paper_asset` was verified as metadata-only. Binary upload, object storage, OCR, and public URL behavior remain
  `staging_blocked`.
- Browser-first observation confirmed the local content page entry could be opened for the task, but credentialed UI
  verification required Playwright fallback so generated login material could remain in-process and unrecorded.
- Playwright fallback showed normal admin login creates a valid cookie-backed session, but does not populate
  `tiku.localSessionToken`. The `/content/papers` page then reports `data-admin-ux-state="permission-denied"`, and the
  content API call without a bearer header returns `code=401001`.
- Because repairing this requires changes under `src/**`, which are blocked for this verification task, the task stops
  as `blocked_validation_failure`. Task 3 is not claimed.

## V5 Repair Addendum

- Fresh approval: user approved approval package v5 to continue current task 2 repair only; task 3 remains unclaimed.
- Source scope: exact source repair is limited to `src/features/admin/content-admin-runtime.tsx`,
  `src/server/services/content-question-material-runtime.ts`,
  `src/server/services/paper-composition-lifecycle-runtime.ts`,
  `src/server/services/rag-resource-knowledge-runtime.ts`, and one focused unit test file under `tests/unit/`.
- Repair hypothesis: content admin UI should not require a client-stored bearer token when a cookie-backed session
  exists, and content-production server runtimes should resolve authorization through the existing session cookie
  boundary instead of reading only the raw `Authorization` header.
- RED/GREEN plan:
  1. Add focused failing tests for tokenless/cookie-backed content admin fetch behavior and cookie-backed server runtime
     authorization.
  2. Apply the smallest helper/runtime changes inside the approved files.
  3. Re-run the focused test, then local task 2 API/UI evidence, then standard validation commands.

## V5 Repair Result

- Focused RED test failed as expected before implementation and passed after the scoped repair.
- Related existing UI tests were updated to the new cookie-backed session probing semantics and passed.
- Local redacted browser/API verification showed normal login creates a valid cookie-backed admin session, leaves
  `tiku.localSessionToken` absent, and `/content/papers` no longer renders `permission-denied`.
- Remaining blocker: direct cookie-backed GET `/api/v1/papers` still returns `code=401001` because the GET route is
  wired to `src/server/services/admin-flow-runtime.ts`, not the v5-approved paper lifecycle runtime. That file is
  outside current allowedFiles, so task 2 stops again and task 3 remains unclaimed.

## V6 Repair Addendum

- Fresh approval: user approved the v6 package to continue current task 2 only; task 3 remains unclaimed.
- Added allowed source surface: `src/server/services/admin-flow-runtime.ts`.
- Added allowed test surface: minimal corresponding unit coverage under `tests/unit/**`.
- Repair hypothesis: the paper list GET route is wired to admin-flow-runtime, so the remaining cookie-backed paper list
  failure should be fixed by resolving admin-flow authorization through the existing `session-cookie` boundary while
  keeping bearer-token behavior unchanged.
- RED/GREEN plan:
  1. Extend the focused Phase 22 cookie repair unit test with a failing admin-flow paper list GET cookie case.
  2. Apply the smallest authorization helper change in `admin-flow-runtime.ts`.
  3. Re-run focused and related unit tests, then repeat redacted local API/UI verification and standard closeout gates.
