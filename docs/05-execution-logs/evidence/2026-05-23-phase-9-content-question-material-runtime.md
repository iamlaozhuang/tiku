# Evidence: phase-9-content-question-material-runtime

## Metadata

- Task id: `phase-9-content-question-material-runtime`
- Branch: `codex/phase-9-content-question-material-runtime`
- Base: `master`
- Head at evidence creation: `63e9654`
- Evidence created at: `2026-05-23T00:00:00+08:00`

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-content-question-material-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-content-question-material-runtime.md`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-content-question-material-runtime-security-review.md`
- `src/app/api/v1/questions/**`
- `src/app/api/v1/materials/**`
- `src/app/api/v1/knowledge-nodes/**`
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
- `git log -5 --oneline`: latest `63e9654 docs(agent): close authorization expiry termination task`.
- `git branch --list`: only `master` before branch creation.
- `git branch -r`: `origin/HEAD -> origin/master`, `origin/master`.
- `Test-AgentSystemReadiness.ps1`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass; no tracked, staged, untracked, or upstream differences.
- Created branch: `codex/phase-9-content-question-material-runtime`.
- Initial `Test-TaskClaimReadiness.ps1 -TaskId phase-9-content-question-material-runtime`: pass.
- Re-run after claim state update: pass.

## Implementation Summary

- Added `createContentQuestionMaterialRuntimeRouteHandlers` as the authenticated runtime boundary for content question/material/knowledge-node APIs.
- Rewired:
  - `GET/POST /api/v1/questions`
  - `GET/PATCH /api/v1/questions/{publicId}`
  - `POST /api/v1/questions/{publicId}/disable`
  - `POST /api/v1/questions/{publicId}/copy`
  - `GET/POST /api/v1/materials`
  - `GET/PATCH /api/v1/materials/{publicId}`
  - `POST /api/v1/materials/{publicId}/disable`
  - `POST /api/v1/materials/{publicId}/copy`
  - `GET /api/v1/knowledge-nodes`
- Added Postgres-backed runtime repositories for question, material, and knowledge-node list runtime.
- Added mutation context propagation so repository writes resolve `created_by_admin_id` / `updated_by_admin_id` from the authenticated admin public id.
- Added audit-log append boundaries for question/material create, update, disable, and copy, including permission-denied failures.
- Kept `knowledge-nodes` limited to authenticated list runtime. Full knowledge-node create/edit/move/disable and RAG lifecycle remain deferred to later Phase 9 AI/RAG and resource/knowledge tasks.
- Did not modify package files, lockfiles, `.env.example`, `drizzle/**`, migrations, external providers, SMS, email, payment, deployment, or production resources.

## TDD Notes

- RED: `npm.cmd run test:unit -- tests/unit/phase-9-content-question-material-runtime.test.ts`
  - Failed because `@/server/services/content-question-material-runtime` did not exist.
- GREEN: added protected content runtime handlers, repository-backed defaults, route rewiring, and audit boundaries.
- Focused GREEN: `npm.cmd run test:unit -- tests/unit/phase-9-content-question-material-runtime.test.ts`
  - Pass, `1` file and `4` tests passed.
- Regression GREEN: `npm.cmd run test:unit -- src/server/services/question-service.test.ts src/server/services/material-service.test.ts src/server/services/question-route.test.ts src/server/services/material-route.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts`
  - Pass, `5` files and `15` tests passed.

## Validation

Required commands:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-content-question-material-runtime
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Results so far:

- `Test-TaskClaimReadiness.ps1 -TaskId phase-9-content-question-material-runtime`: pass.
- Focused RED/GREEN tests: pass after implementation.
- `npm.cmd run typecheck`: first sandbox run failed with `EPERM` reading `node_modules` TypeScript entrypoint; escalated re-run passed.
- `npm.cmd run lint`: first sandbox run failed with `EPERM` reading `node_modules` ESLint entrypoint; escalated re-run passed.
- `npm.cmd run test:unit`: pass, `98` files and `341` tests passed.
- First `Invoke-QualityGate.ps1`: failed at `format:check` only; lint, typecheck, and unit tests passed.
- Prettier fix: sandbox run failed with `EPERM` reading the Prettier entrypoint; escalated `node .\node_modules\prettier\bin\prettier.cjs --write ...` passed and touched only the 6 reported task files.
- Re-run `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `98` files and `341` tests passed.
  - format:check: pass.
- `npm.cmd run build`: pass; Next.js compiled successfully and generated `questions`, `materials`, and `knowledge-nodes` API routes.
- First `Test-NamingConventions.ps1`: failed because `question-repository.ts` used generic `option` / `point` loop variable names.
- Naming fix: renamed those variables to `questionOptionRow`, `questionOptionInput`, and `scoringPointRow`.
- Re-run `Test-NamingConventions.ps1`: pass.

Final validation after evidence/security-review updates:

- Final `Invoke-QualityGate.ps1`: pass.
  - lint: pass.
  - typecheck: pass.
  - test:unit: pass, `98` files and `341` tests passed.
  - format:check: pass.
- Final `npm.cmd run build`: pass; Next.js build compiled successfully.
- Final `Test-NamingConventions.ps1`: pass.
- Final `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass inventory; branch has no upstream and only this task's allowed files are changed/untracked.

## Security Review

- Required: yes.
- Review artifact: `docs/05-execution-logs/audits-reviews/2026-05-23-phase-9-content-question-material-runtime-security-review.md`.
- Verdict: `APPROVE` with residual gaps documented below.

## Residual Risks And Deferred Items

- `knowledge-nodes` mutation routes are not implemented in this task; the current route surface only has `GET`, and full knowledge-node lifecycle is owned by later RAG/admin UI tasks.
- Question/material Postgres repository tests are covered through service contracts and protected route tests with repository doubles. Local DB-backed API behavior is further covered by build and final quality gates, but no Docker-backed integration test was added in this slice.
- Question-to-knowledge-node and tag persistence remains absent from the current schema/runtime surface; DTO fields remain empty arrays until the later AI/RAG knowledge binding task introduces that storage boundary.
- Object storage and rich-text image upload are not touched; no file upload or public file URL behavior is introduced.

## Git Closeout

- implementationCommit: pending.
- merge: pending.
- push: pending.
- cleanup: pending.

## Taste Compliance Self-Check

- Standard API response: pass; runtime routes return `{ code, message, data, pagination? }`.
- Naming discipline: pass after `Test-NamingConventions.ps1`; `question`, `material`, `knowledge_node`, and `audit_log` terms follow the glossary.
- Public ID boundary: pass; API route params and DTOs use `publicId`, never numeric database `id`.
- Layering: pass; route handlers resolve session/permission and delegate to service/repository boundaries.
- N+1 query rule: pass; repository child-row hydration uses batch queries, not per-row database selects in loops.
- Dependency isolation: pass; no dependency, package, lockfile, or `.env.example` changes.
- Schema and migration boundary: pass; no schema, migration, or `drizzle/**` changes.
- Sensitive data redaction: pass; no session token, password, secret, API key, raw prompt, raw answer, or provider payload is returned or logged.
- Evidence before conclusion: pass; required commands are recorded above.
