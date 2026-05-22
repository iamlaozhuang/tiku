# Evidence: phase-9-paper-composition-lifecycle-runtime

## Metadata

- Task id: `phase-9-paper-composition-lifecycle-runtime`
- Branch: `codex/phase-9-paper-composition-lifecycle-runtime`
- Base: `master`
- Head at evidence creation: `70e781c`
- Evidence created at: `2026-05-23T00:00:00+08:00`

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-paper-composition-lifecycle-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-paper-composition-lifecycle-runtime.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-paper-composition-lifecycle-runtime-security-review.md`
- `src/app/api/v1/papers/**`
- `src/app/api/v1/paper-assets/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files respected:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Recovery And Readiness

- `git status --short --branch`: `## master...origin/master` before branch creation.
- `git log -5 --oneline`: latest `70e781c docs(agent): close content question material runtime task`.
- `git branch --list`: only `master` before branch creation.
- `git branch -r`: `origin/HEAD -> origin/master`, `origin/master`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass; no tracked, staged, untracked, or upstream differences.
- Created branch: `codex/phase-9-paper-composition-lifecycle-runtime`.
- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-paper-composition-lifecycle-runtime`: pass on `pending`, then pass again after queue status `claimed`.

## Implementation Summary

- Added `createPaperCompositionLifecycleRuntimeRouteHandlers` as the authenticated runtime boundary for paper composition lifecycle and paper_asset metadata APIs.
- Rewired paper write/detail routes:
  - `POST /api/v1/papers`
  - `GET/PATCH/DELETE /api/v1/papers/{publicId}`
  - `POST /api/v1/papers/{publicId}/questions`
  - `PATCH/DELETE /api/v1/papers/{publicId}/questions/{paperQuestionPublicId}`
  - `POST /api/v1/papers/{publicId}/publish`
  - `POST /api/v1/papers/{publicId}/archive`
  - `POST /api/v1/papers/{publicId}/copy`
- Rewired paper_asset metadata routes:
  - `GET/POST /api/v1/paper-assets`
  - `GET/DELETE /api/v1/paper-assets/{publicId}`
- Kept `GET /api/v1/papers` collection read on the existing admin content read-view runtime for current admin UI compatibility.
- Added Postgres-backed repositories for paper draft/composition lifecycle and paper_asset metadata.
- Implemented source question snapshot copy, paper scoring point adjustment, paper_section total recalculation, publish validation handoff, source question/material lock on publish, archive, draft delete guard, and copy-to-draft.
- Added redaction-safe audit_log boundaries for paper and paper_asset mutations, including permission-denied failures.
- Did not add dependencies, schema changes, migrations, `.env.example`, object storage upload/download, real signed URLs, external providers, deployment, or production resource changes.

## TDD Notes

- RED: `npm.cmd run test:unit -- tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts`
  - Failed because `@/server/services/paper-composition-lifecycle-runtime` did not exist.
- GREEN: added protected runtime handlers, Postgres repository implementations, route rewiring, and audit boundaries.
- Focused GREEN: `npm.cmd run test:unit -- tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts`
  - Pass, `1` file and `4` tests passed.
- Regression GREEN: `npm.cmd run test:unit -- src/server/services/paper-draft-service.test.ts src/server/services/paper-draft-route.test.ts src/server/services/paper-asset-service.test.ts src/server/services/paper-asset-route.test.ts tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts`
  - Pass, `5` files and `23` tests passed.
- `npm.cmd run typecheck`: first sandbox run failed with `EPERM` reading `node_modules` TypeScript entrypoint; escalated re-run passed.
- Prettier: first sandbox run failed with `EPERM` reading `node_modules` Prettier entrypoint; escalated re-run passed on task files.

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-paper-composition-lifecycle-runtime
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results so far:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-paper-composition-lifecycle-runtime`: pass.
- Focused RED/GREEN tests: pass after implementation.
- Focused regression tests: pass.
- `npm.cmd run typecheck`: pass after escalated re-run.

Final validation:

- `npm.cmd run test:unit`: pass, `99` files and `345` tests passed.
- `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `99` files and `345` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js compiled successfully and generated `paper-assets`, `papers`, `publish`, `archive`, `copy`, and paper question API routes.
- First `Test-NamingConventions.ps1`: failed because one error message used the generic term `section`.
- Naming fix: changed the message to use the glossary term `paper_section`.
- Re-run `Test-NamingConventions.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; branch has no upstream and only this task's allowed files are changed/untracked.

## Security Review

- Required: yes.
- Review artifact: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-paper-composition-lifecycle-runtime-security-review.md`.
- Verdict: `APPROVE`.

## Residual Risks And Deferred Items

- `paper_asset` runtime stores metadata only. Real upload/download, object storage, scanning, temporary signed URL policy, and cleanup remain deferred to a later storage-specific task.
- `GET /api/v1/papers` collection remains on the existing admin read-view DTO for admin UI compatibility; detailed paper draft lifecycle DTO is available through detail/action routes.
- Postgres repositories are covered by service/runtime unit tests and typecheck, but no Docker-backed integration test was added in this slice.
- Copying a paper requires source questions to still exist; if a source question has been physically removed outside normal MVP rules, copy returns conflict instead of fabricating a stale FK.

## Git Closeout

- implementationCommit: `9e418ec feat(paper): add composition lifecycle runtime`.
- merge: `1dd346e merge: phase 9 paper composition lifecycle runtime`.
- postMergeValidation:
  - `Invoke-QualityGate.ps1`: pass on `master`; lint, typecheck, unit tests, and format check passed.
  - `npm.cmd run build`: pass on `master`; Next.js build completed and generated paper/paper_asset API routes.
  - `Test-NamingConventions.ps1`: pass on `master`.
  - `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass on `master`; no untracked or unstaged files before closeout documentation update.
- push: completed; `git push origin master` succeeded.
- cleanup: completed; local branch `codex/phase-9-paper-composition-lifecycle-runtime` deleted after merge and push.

## Taste Compliance Self-Check

- Standard API response: pass; paper and paper_asset runtime routes return `{ code, message, data, pagination? }`.
- Naming discipline: pass after `Test-NamingConventions.ps1`; `paper`, `paper_asset`, `paper_section`, `question_group`, `publish_lock`, and `audit_log` terms follow the glossary.
- Public ID boundary: tests assert DTOs and route behavior do not expose numeric `id`.
- Layering: route handlers resolve session/permission and delegate to service/repository boundaries.
- N+1 query rule: repository hydration uses batch queries for sections, groups, questions, and scoring points.
- Dependency isolation: no dependency, package, lockfile, or `.env.example` changes.
- Schema and migration boundary: no schema, migration, or `drizzle/**` changes.
- Sensitive data redaction: tests assert session token, object key, and secrets are absent from responses/audit summaries.
- Evidence before conclusion: final command results pending below.
