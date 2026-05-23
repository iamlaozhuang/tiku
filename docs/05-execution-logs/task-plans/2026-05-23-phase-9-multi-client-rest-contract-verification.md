# Phase 9 Multi Client REST Contract Verification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:test-driven-development` for new verification coverage and `superpowers:verification-before-completion` before delivery. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Verify that the Phase 9 REST surface is consistently usable by multiple clients through `/api/v1/`, without exposing internal ids, sensitive fields, or bypassing auth/session/authorization runtime.

**Architecture:** Follow ADR-002. This task does not change runtime implementation. It adds unit and E2E verification only within the queue `allowedFiles`; any REST contract defect requiring `src/**` changes is recorded as a blocker in evidence instead of silently expanding scope.

**Tech Stack:** Next.js App Router route handlers under `/api/v1/`, TypeScript, Vitest, Playwright, existing local mock/dev runtime. No dependency, lockfile, schema, environment, production resource, deploy, or PR changes are allowed.

---

## Readiness And Required References

- Read `AGENTS.md`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read ADR files under `docs/02-architecture/adr/`, especially ADR-002.
- Read `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Read previous evidence `docs/05-execution-logs/evidence/2026-05-23-phase-9-admin-ops-runtime-ui-completion.md`.
- Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-multi-client-rest-contract-verification`.

## Allowed Scope

- Create this task plan.
- Create evidence `docs/05-execution-logs/evidence/2026-05-23-phase-9-multi-client-rest-contract-verification.md`.
- Add or modify contract verification under `tests/unit/**`.
- Add or modify browser/API verification under `e2e/**`.
- Update `docs/04-agent-system/state/project-state.yaml`.
- Update `docs/04-agent-system/state/task-queue.yaml`.

## Blocked Scope

- No `package.json`, `pnpm-lock.yaml`, `package-lock.json`, `.env.example`, `src/**`, or `drizzle/**` changes.
- No dependency changes or dependency introduction gate unless separately approved by a human.
- No production credentials, real AI provider, production resources, deployment, PR creation, or remote production action.
- No session token, password, secret, API key, raw prompt, raw answer, provider payload, or `code_hash` in tests, logs, or evidence.

## Scope Conflict Strategy

- If route handlers or DTOs violate ADR-002 and the fix requires `src/**`, the task will add the strongest possible regression test under `tests/unit/**` or `e2e/**`, record the failure/blocker in evidence, and stop before marking the task closed.
- If a task-queue requirement conflicts with `allowedFiles`, `allowedFiles` wins. Evidence will explicitly describe the skipped runtime modification and why it needs a future approved task.
- E2E verification may exercise live local `/api/v1/` endpoints, but it must not connect to real providers or production resources.

## TDD Tasks

### Task 1: Static REST Route Contract Inventory

**Files:**

- Test: `tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`

- [x] Write a failing unit test that inventories `src/app/api/v1/**/route.ts` from the filesystem and asserts all REST routes remain under `/api/v1/`, path segments are kebab-case, route params are `publicId` instead of `id`, and read-only log routes do not export mutation handlers.
- [x] Verify RED against any missing verification helper or unmet contract.
- [x] Implement only test-side helpers needed to pass the inventory assertions.
- [x] Verify GREEN with the focused unit test.

### Task 2: Route Handler Envelope And Redaction Contract

**Files:**

- Test: `tests/unit/phase-9-multi-client-rest-contract-verification.test.ts`

- [x] Write failing unit tests that call representative route handlers and prove responses use `{ code, message, data, pagination? }`, DTO keys are camelCase, public URLs/DTOs avoid auto-increment `id`, sensitive fields are absent, and protected endpoints reject unauthenticated access.
- [x] Verify RED.
- [x] Add only test-side request helpers and assertions; do not edit runtime code.
- [x] Verify GREEN.

### Task 3: Multi-Client Browser/API E2E Coverage

**Files:**

- Modify: `e2e/local-business-flow.spec.ts` or add an E2E spec under `e2e/**`.

- [x] Add Playwright coverage for direct REST fetches from the local browser context, covering student and admin representative endpoints, standard envelopes, `publicId` boundaries, read-only `audit_log` / `ai_call_log` write rejection, sensitive redaction, and loading/empty/error or failure-state surfaces already exposed in UI.
- [x] Run focused or full E2E as practical during implementation.

### Task 4: Evidence And State Closeout

**Files:**

- Create: `docs/05-execution-logs/evidence/2026-05-23-phase-9-multi-client-rest-contract-verification.md`
- Modify: `docs/04-agent-system/state/project-state.yaml`
- Modify: `docs/04-agent-system/state/task-queue.yaml`

- [x] Run and record required validation commands:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-multi-client-rest-contract-verification`
  - `npm.cmd run test:unit`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
  - `npm.cmd run build`
  - `npm.cmd run test:e2e`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- [x] Update task state to `closed` only after evidence is complete and gates pass.
- [ ] Commit this task as one reviewable commit.
