# Organization Training Draft Source Context Runtime Contract TDD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the organization-training manual draft, source-context attachment, and copy-to-new-draft runtime route/API contract gaps without schema, dependency, provider, or browser runtime changes.

**Architecture:** Keep route handlers thin and delegate behavior to `organization-training-route.ts`, which composes existing service methods with a Postgres-backed repository. Add route-level validators and mappers for draft/source-context persistence rows so API JSON remains camelCase and standard response envelopes remain `{ code, message, data }`.

**Tech Stack:** Next.js route handlers, TypeScript, Vitest unit tests, Drizzle query builders through existing gateway seams.

---

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-draft-source-context-schema-migration.md`

## Scope

Allowed implementation files are the task-declared organization-training API routes, route service/test, validator/test, contract, repository/test, mapper/test, model, and docs/state/evidence/audit files. Blocked surfaces remain `.env*`, schema/drizzle/migration, package/lockfile/dependencies, admin/student UI, e2e runtime, provider/model, staging/prod/cloud/deploy/payment/external-service, PR, force-push, and Cost Calibration Gate.

## Tasks

### Task 1: RED repository and mapper contract

**Files:**

- Modify: `src/server/repositories/organization-training-repository.test.ts`
- Modify: `src/server/mappers/organization-training-mapper.test.ts`

- [ ] Add failing repository tests for `createManualDraft`, `copyVersionToNewDraft`, and `attachSourceContext` through the existing gateway seam.
- [ ] Add failing mapper tests for draft row and source-context row conversion to service DTOs.
- [ ] Run:

```powershell
npm.cmd run test:unit -- src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts
```

Expected RED: missing repository methods and mapper exports fail for feature-not-implemented reasons.

### Task 2: GREEN repository and mapper

**Files:**

- Modify: `src/server/repositories/organization-training-repository.ts`
- Modify: `src/server/mappers/organization-training-mapper.ts`
- Modify: `src/server/models/organization-training.ts` if a shared model type is needed

- [ ] Implement minimal row insert/return mapping for draft and source-context persistence using existing schema names.
- [ ] Preserve metadata-only boundaries; do not add raw answer persistence or schema changes.
- [ ] Re-run the Task 1 focused tests and keep them green.

### Task 3: RED validators and route service

**Files:**

- Modify: `src/server/validators/organization-training.test.ts`
- Modify: `src/server/services/organization-training-route.test.ts`

- [ ] Add failing validator tests for manual draft and source-context request bodies.
- [ ] Add failing route service tests for:
  - `POST /api/v1/organization-trainings` manual draft creation.
  - `POST /api/v1/organization-trainings/{publicId}/copy-to-new-draft`.
  - `POST /api/v1/organization-trainings/{publicId}/source-contexts`.
- [ ] Run:

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/validators/organization-training.test.ts
```

Expected RED: missing validators/route handlers/runtime store wiring fail for feature-not-implemented reasons.

### Task 4: GREEN validators, route service, and API routes

**Files:**

- Modify: `src/server/validators/organization-training.ts`
- Modify: `src/server/services/organization-training-route.ts`
- Create/modify: `src/app/api/v1/organization-trainings/**`
- Modify: `src/server/contracts/organization-training-contract.ts` only if route DTO exports are missing

- [ ] Implement minimal validators and handler methods.
- [ ] Wire runtime store methods to the repository.
- [ ] Add API route files that call the existing runtime route handler factory.
- [ ] Re-run focused route/validator tests and keep them green.

### Task 5: Evidence, audit, and closeout validation

**Files:**

- Modify: `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`
- Create: `docs/05-execution-logs/evidence/2026-06-18-organization-training-draft-source-context-runtime-contract-tdd.md`
- Create: `docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-draft-source-context-runtime-contract-tdd.md`

- [ ] Run the full task validation command list:

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/validators/organization-training.test.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.test.ts
npm.cmd run test:e2e -- --list
npx.cmd prettier --check --ignore-unknown src/app/api/v1/organization-trainings src/server/services/organization-training-route.ts src/server/services/organization-training-route.test.ts src/server/validators/organization-training.ts src/server/validators/organization-training.test.ts src/server/contracts/organization-training-contract.ts src/server/repositories/organization-training-repository.ts src/server/repositories/organization-training-repository.test.ts src/server/mappers/organization-training-mapper.ts src/server/mappers/organization-training-mapper.test.ts src/server/models/organization-training.ts docs/04-agent-system/state/local-experience-coverage-matrix.yaml docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-18-organization-training-draft-source-context-runtime-contract-tdd.md docs/05-execution-logs/evidence/2026-06-18-organization-training-draft-source-context-runtime-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-18-organization-training-draft-source-context-runtime-contract-tdd.md
npm.cmd run lint
npm.cmd run typecheck
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-draft-source-context-runtime-contract-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-draft-source-context-runtime-contract-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-draft-source-context-runtime-contract-tdd
```

- [ ] Record redacted command outcomes in evidence.
- [ ] Mark task closed without claiming `experience_closed`.
- [ ] Create one local commit if all gates pass. Fast-forward merge and push remain controlled by task closeout policy and fresh approval.
