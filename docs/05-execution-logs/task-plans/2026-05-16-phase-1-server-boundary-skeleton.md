# Phase 1 Server Boundary Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for source changes and superpowers:verification-before-completion before handoff. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the first typed server boundary skeleton for Tiku without introducing new dependencies.

**Architecture:** Follow ADR-002 layering: route handlers / server actions -> service -> repository -> model. This task creates the service, repository, model, validator, contract, mapper, and db schema placeholder boundaries while keeping Drizzle-specific implementation deferred until dependency-approved database work.

**Tech Stack:** Next.js 16 App Router, TypeScript, Vitest, existing npm scripts.

---

## Read Standards

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/interfaces/global-db-api-skeleton.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

**Allowed source files:**

- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/models/**`
- `src/server/validators/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/db/schema/**`

**Allowed state/evidence files:**

- `docs/05-execution-logs/evidence/2026-05-16-phase-1-server-boundary-skeleton.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

**Blocked files:**

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`

## Implementation Tasks

### Task 1: Contract and Mapper Tests

**Files:**

- Create: `src/server/contracts/api-response.test.ts`
- Create: `src/server/mappers/paper-mapper.test.ts`

- [ ] **Step 1: Write failing tests**

Test standard success, error, and pagination envelopes, plus `paper` row to API JSON mapping with `publicId`, ISO timestamp, `null` optional fields, and no exposed internal `id`.

- [ ] **Step 2: Run tests and confirm RED**

Run:

```powershell
npm.cmd run test:unit -- src/server/contracts/api-response.test.ts src/server/mappers/paper-mapper.test.ts
```

Expected: FAIL because modules do not exist.

### Task 2: Service Boundary Tests

**Files:**

- Create: `src/server/services/paper-service.test.ts`

- [ ] **Step 1: Write failing service tests**

Test that `createPaperService().listPapers()` validates pagination defaults, delegates to a repository interface, maps rows through the API mapper, and returns the standard response envelope.

- [ ] **Step 2: Run tests and confirm RED**

Run:

```powershell
npm.cmd run test:unit -- src/server/services/paper-service.test.ts
```

Expected: FAIL because service modules do not exist.

### Task 3: Minimal Implementation

**Files:**

- Create: `src/server/contracts/api-response.ts`
- Create: `src/server/models/paper.ts`
- Create: `src/server/repositories/paper-repository.ts`
- Create: `src/server/validators/pagination.ts`
- Create: `src/server/mappers/paper-mapper.ts`
- Create: `src/server/services/paper-service.ts`
- Create: `src/db/schema/index.ts`
- Create: `src/db/schema/paper.ts`

- [ ] **Step 1: Implement contract helpers**

Create reusable typed helpers for `{ code, message, data, pagination? }`.

- [ ] **Step 2: Implement paper model and repository interface**

Define row/model types without importing Drizzle until dependencies are approved.

- [ ] **Step 3: Implement pagination validator**

Use `page`, `pageSize`, `sortBy`, and `sortOrder`, with stable defaults.

- [ ] **Step 4: Implement mapper**

Map snake_case row fields to camelCase API fields and keep optional fields as `null`.

- [ ] **Step 5: Implement service factory**

Accept a `PaperRepository` dependency, call it once, map rows, and return a paginated standard response.

### Task 4: Validation and Evidence

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-16-phase-1-server-boundary-skeleton.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [ ] **Step 1: Run focused tests**

Run:

```powershell
npm.cmd run test:unit -- src/server/contracts/api-response.test.ts src/server/mappers/paper-mapper.test.ts src/server/services/paper-service.test.ts
```

- [ ] **Step 2: Run task validation commands**

Run:

```powershell
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
```

- [ ] **Step 3: Write evidence**

Record the command outputs, residual risk, and note that Drizzle schema is a typed placeholder because dependency changes are blocked for this task.

- [ ] **Step 4: Update queue and project state**

Mark `phase-1-server-boundary-skeleton` as `done`, set current task back to idle, and point handoff to `phase-1-api-contract-baseline`.
