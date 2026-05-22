# Evidence: phase-9-authorization-expiry-termination-completion

## Metadata

- Task id: `phase-9-authorization-expiry-termination-completion`
- Branch: `codex/phase-9-authorization-expiry-termination-completion`
- Base: `master`
- Head at evidence creation: `775b689`
- Evidence created at: `2026-05-23T00:00:00+08:00`

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-authorization-expiry-termination-completion.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-authorization-expiry-termination-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-authorization-expiry-termination-completion-security-review.md`
- `src/app/(student)/**`
- `src/app/api/v1/authorizations/**`
- `src/app/api/v1/personal-auths/**`
- `src/app/api/v1/org-auths/**`
- `src/app/api/v1/practices/**`
- `src/app/api/v1/mock-exams/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Recovery And Readiness

- `git status --short --branch`: `## master...origin/master`.
- `git log -5 --oneline`: latest `775b689 merge: phase 9 auth session account completion`.
- `git branch --list`: only `master` before task branch creation.
- `git branch -r`: `origin/HEAD -> origin/master`, `origin/master`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass; no tracked, staged, untracked, or upstream differences.
- Created branch: `codex/phase-9-authorization-expiry-termination-completion`.
- Initial `Test-TaskClaimReadiness.ps1 -TaskId phase-9-authorization-expiry-termination-completion`: failed because dependency `phase-9-auth-session-account-completion` was still `status: committed` in `task-queue.yaml`.
- State reconciliation: updated `phase-9-auth-session-account-completion` to `status: pushed` based on merge commit `775b689` and user handoff that it was merged and pushed; moved `project-state.yaml` current task to this task with `status: claimed`.
- Re-run `Test-TaskClaimReadiness.ps1 -TaskId phase-9-authorization-expiry-termination-completion`: pass.

## Implementation Summary

- Added current-time validation to practice and mock exam authorization scopes; `expires_at <= now` is no longer treated as active by service logic.
- When a student starts, reads, answers, submits, restarts, or terminates a practice/mock exam after the matching authorization is no longer effective, the in-progress record is marked `terminated` with `terminationReason: authorization_invalid`.
- `POST /api/v1/practices` and `POST /api/v1/mock-exams` also terminate an existing in-progress record for the same paper when the current authorization has expired before returning the access-denied response.
- Student flow repository now includes active `org_auth` rows, active organization status, active user status, and date bounds in effective authorization scopes used by `student-papers`, `practices`, `mock-exams`, and `exam-reports`.
- Student paper scope selection now merges personal and org authorization rows for the same `profession`/`level`, preserving the union of authorization types and the latest expiry.
- Did not modify package files, lockfiles, `.env.example`, `drizzle/**`, external providers, SMS, email, payment, deployment, or production resources.

Changed implementation files:

- `src/server/repositories/student-flow-runtime-repository.ts`
- `src/server/services/mock-exam-service.ts`
- `src/server/services/practice-service.ts`
- `src/server/services/student-paper-service.ts`

Changed tests:

- `src/server/services/mock-exam-service.test.ts`
- `src/server/services/practice-service.test.ts`
- `src/server/services/student-paper-service.test.ts`

State and review files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-authorization-expiry-termination-completion.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-authorization-expiry-termination-completion.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-authorization-expiry-termination-completion-security-review.md`

## TDD Notes

- RED: `npm.cmd run test:unit -- src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts`
  - Failed because practice and mock exam services treated `expires_at == now` scopes as effective and returned in-progress records instead of terminating them.
- GREEN: Added service-level expiry checks, authorization-invalid termination, and updated old hidden-404 assertions to the new termination response behavior.
- RED: `npm.cmd run test:unit -- src/server/services/student-paper-service.test.ts`
  - Failed because duplicate personal/org authorization rows for the same scope were treated as ambiguous instead of a single union scope.
- GREEN: Added scope merge logic and kept authorization type union plus latest expiry.
- Focused GREEN: `npm.cmd run test:unit -- src/server/services/student-paper-service.test.ts src/server/services/practice-service.test.ts src/server/services/mock-exam-service.test.ts`
  - Pass, `3` files and `20` tests passed.

## Security Review

- Required: yes.
- Review artifact: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-authorization-expiry-termination-completion-security-review.md`.
- Verdict: `APPROVE` with residual gaps documented below.

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-authorization-expiry-termination-completion
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results:

- task claim readiness: pass after state reconciliation.
- focused RED/GREEN tests: pass after implementation.
- `npm.cmd run test:unit`: pass, `97` files passed and `337` tests passed.
- First `Invoke-QualityGate.ps1`: failed at `format:check` only; lint, typecheck, and unit tests passed. Prettier reported the task plan plus practice/mock exam service files.
- Prettier fix: sandboxed `.bin\prettier.cmd` failed with local `EPERM` reading the installed Prettier entrypoint; escalated `node .\node_modules\prettier\bin\prettier.cjs --write ...` passed and touched only the 3 reported task files.
- Re-run `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `97` files and `337` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js build compiled successfully and generated all API routes including `authorizations`, `practices`, `mock-exams`, `personal-auths`, and `org-auths`.
- `npm.cmd run test:e2e`: pass, `2` Playwright tests passed.
- `Test-NamingConventions.ps1`: pass.
- Final `Invoke-QualityGate.ps1` after evidence/security-review updates: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `97` files and `337` tests passed.
  - format:check: pass.
- Final `npm.cmd run build`: pass; Next.js build compiled successfully.
- Final `npm.cmd run test:e2e`: pass, `2` Playwright tests passed.
- Final `Test-NamingConventions.ps1`: pass.
- Final `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; branch has no upstream and only this task's allowed files are changed/untracked.

## Residual Risks And Deferred Items

- Admin org-auth cancellation and organization disable mutation routes remain intentionally unavailable in Phase 8/9 admin runtime. This task enforces the student-side consequence when effective authorization disappears, but it does not activate high-risk admin mutation flows.
- Account disablement still invalidates current-session access through active-account lookup from the previous task. Broad admin account-disable mutation and audit UI are owned by later admin ops tasks.
- Practice/mock exam answer autosave at the browser offline edge is not expanded here; this task preserves existing route contracts and server-side termination.
- No schema-level background job marks auth rows `expired`; effective access is computed by status and date bounds at runtime.

## Git Closeout

- implementationCommit: pending.
- merge: pending.
- push: pending.
- cleanup: pending.

## Taste Compliance Self-Check

- Standard API response: pass; changed service responses keep `{ code, message, data }`.
- Naming discipline: pass; `authorization`, `personal_auth`, `org_auth`, `practice`, and `mock_exam` terms follow the glossary.
- Public ID boundary: pass; no numeric database `id` added to URLs or DTOs.
- Layering: pass; route handlers remain unchanged and logic stays in service/repository boundaries.
- N+1 query rule: pass; no looped database select introduced.
- Dependency isolation: pass; no dependency, package, lockfile, or `.env.example` changes.
- Schema and migration boundary: pass; no schema, migration, or `drizzle/**` changes.
- Sensitive data redaction: pass; no session token, password, secret, API key, raw prompt, raw answer, or provider payload is returned or logged.
- Evidence before conclusion: pass; required commands are recorded above.
