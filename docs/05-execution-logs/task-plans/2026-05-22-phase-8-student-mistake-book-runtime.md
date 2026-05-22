# Task Plan: phase-8-student-mistake-book-runtime

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-profile-redeem-ui.md`

## Recovery And Claim

- Recovery branch: `master`
- Recovery HEAD: `28babc9 docs(agent): record phase 8 profile redeem cleanup`
- Recovery status: clean and aligned with `origin/master`
- Task branch: `codex/phase-8-student-mistake-book-runtime`
- Claim gate: `Test-TaskClaimReadiness.ps1 -TaskId phase-8-student-mistake-book-runtime` passed.

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-student-mistake-book-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-mistake-book-runtime.md`
- `docs/05-execution-logs/audits-reviews/2026-05-22-phase-8-student-mistake-book-runtime-security-review.md`
- `src/app/api/v1/mistake-books/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Plan

1. Add failing unit coverage for the Phase 8 runtime wrapper that proves:
   - authenticated student session can list and mutate only its own `mistake_book` records;
   - missing session and admin session return `401001` without leaking internals;
   - unauthorized `publicId` returns the existing contract-safe not-found envelope;
   - `ai_explanation` remains unavailable and does not call a real provider.
2. Implement a small `mistake_book` runtime composition service that reuses `createLocalSessionRuntime`, `createMistakeBookService`, and a Postgres `MistakeBookRepository`.
3. Wire all `src/app/api/v1/mistake-books/**` route files to the runtime wrapper instead of unavailable factories.
4. Keep DTOs public-id only and camelCase through the existing mapper.
5. Keep AI explanation contract-safe unavailable until mock AI logging prerequisites are available.
6. Record evidence, security review verdict, and final Git closeout.

## Risk Defense

- Auth/session: resolve user context only through `SessionService.getCurrentSession`.
- Admin session: reject by requiring `user.userType !== null`; admin-only sessions have `userType: null`.
- Ownership: repository lookup and update queries include both `userPublicId` and `publicId`.
- Authorization: service rechecks effective `authorization` scopes before detail and state changes.
- Data exposure: never return numeric `id`, `session token`, `password`, `secret`, `API key`, raw prompt, raw answer, `code_hash`, or provider payload.
- Dependency boundary: no dependency, package, lockfile, `.env.example`, schema, migration, or `drizzle/**` change.
- API contract: preserve `{ code, message, data, pagination? }`, camelCase JSON, `[]` empty lists, and `null` optional values.

## TDD Plan

- RED: add `tests/unit/phase-8-student-mistake-book-runtime.test.ts` before implementation and run the focused test to confirm missing runtime behavior fails.
- GREEN: implement minimal runtime/repository/route wiring and rerun the focused test.
- REFACTOR: run existing mistake_book unit tests and the full validation gate.

## Validation Commands

```powershell
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

`npm.cmd run test:e2e` is not planned because this task does not change browser flow or E2E files.
