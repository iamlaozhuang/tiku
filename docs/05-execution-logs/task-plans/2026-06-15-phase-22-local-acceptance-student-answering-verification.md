# Task Plan: Phase 22 Student Answering Local Acceptance Verification

## Task

- Task id: `phase-22-local-acceptance-student-answering-verification`
- Branch: `codex/phase-22-local-acceptance-student-answering-verification`
- Baseline: `afbb463815090b23d69da6890ba58965419bab8e`
- Journey: `student_answering`
- Target entities: `practice`, `mock_exam`, `answer_record`, `exam_report`

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

The user approved execution after the unified upfront authorization for remaining Phase 22 seeded candidate tasks 2-6.
For this task, the approval permits one-at-a-time execution, a localhost or 127.0.0.1 dev server, Browser-first or
Playwright-fallback local observation, application UI/API mediated local dev DB use, in-process use of the existing
project runtime/env loader only for the required local `DATABASE_URL`, and minimal current-task fixture creation through
existing ORM or service-layer paths.

The same approval permits task plan, evidence, audit, state, and queue updates, standard validation commands, one local
commit, fast-forward merge to `master`, `master` validation, push to `origin/master`, merged short-branch deletion,
fetch prune, and clean alignment checks after the task passes.

## Boundaries

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-phase-22-local-acceptance-student-answering-verification.md`
- `docs/05-execution-logs/evidence/2026-06-15-phase-22-local-acceptance-student-answering-verification.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-phase-22-local-acceptance-student-answering-verification.md`

Blocked writes and actions:

- `.env*`, `package.json`, lockfiles, `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, `drizzle/**`, `scripts/**`
- dependency changes, schema or migration work, raw SQL, seed/bootstrap scripts, destructive DB operations
- provider/model calls, quota/cost measurement, Cost Calibration Gate
- staging/prod/cloud/deploy, payment, external-service, PR, force push
- secret/token/cookie/Authorization header/DB URL/raw answer/row-data/private-data exposure

## Verification Approach

1. Use the existing local runtime and local dev DB only through approved localhost UI/API observation and minimal
   ORM/service-layer fixture setup.
2. Start a dev server on `127.0.0.1` only if runtime observation is needed.
3. Prefer Browser for local UI observation; use Playwright fallback only if Browser invocation is unavailable or unsafe
   for redacted fixture handling.
4. Cover the student answering journey:
   - student login/session and authorization context;
   - `practice` entry, answer save, submit, and resume/restart if available;
   - `mock_exam` entry, answer save, submit, and timeout/termination if available locally;
   - `answer_record` creation/update through user actions;
   - `exam_report` reachability and summary evidence.
5. Record only redacted evidence: route names, HTTP status, API `code`, boolean state, counts when safe, status labels,
   and blocked remainders.
6. Stop and record blocked evidence if the journey requires source/test/e2e/schema/drizzle/script/dependency/env/provider
   changes, raw SQL, seed/bootstrap, destructive DB work, or non-local services.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId phase-22-local-acceptance-student-answering-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId phase-22-local-acceptance-student-answering-verification`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId phase-22-local-acceptance-student-answering-verification`

No task-specific existing local-only e2e spec is declared for this queue item, so e2e is not run in this task.

## Risk Controls

- Do not record raw student answers; use boolean or count-level observations only.
- Do not claim complete student answering acceptance unless `practice`, `mock_exam`, `answer_record`, and `exam_report`
  are all covered by local evidence.
- Mark unavailable AI/provider-dependent behavior as `mock_only`, `needs_recheck`, or `staging_blocked` instead of
  bypassing blocked gates.
