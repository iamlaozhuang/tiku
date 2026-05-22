# Phase 8 Student Authorization Redeem Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for behavior changes and superpowers:verification-before-completion before completion claims. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the smallest Phase 8 runtime slice for student `authorization`, `personal_auth`, and `redeem_code` APIs using the existing local session runtime.

**Architecture:** Route handlers stay thin under `/api/v1`, services own authorization and redeem-code state rules, repositories isolate Drizzle access, and mappers return camelCase DTOs without numeric ids. Existing unavailable actions that are outside this task must continue returning contract-safe unavailable errors instead of fixture success.

**Tech Stack:** Next.js App Router route handlers, TypeScript, Drizzle ORM, Vitest unit tests, existing local session runtime.

---

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
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
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-login-session-ui-runtime.md`

## Recovery And Claim

- [x] Confirmed `master` was clean and aligned with `origin/master` at `8b02b22`.
- [x] Confirmed only `master` and `origin/master` remained.
- [x] Ran readiness gates before implementation.
- [x] Created branch `codex/phase-8-student-authorization-redeem-runtime`.
- [x] Ran `Test-TaskClaimReadiness.ps1 -TaskId phase-8-student-authorization-redeem-runtime`: pass.
- [x] Corrected prior login task queue status from `merged` to `closed` based on real Git state and pushed `master`.
- [x] Claimed current task in `task-queue.yaml` and `project-state.yaml`.

## Allowed Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-student-authorization-redeem-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-authorization-redeem-runtime.md`
- `docs/05-execution-logs/audits-reviews/2026-05-22-phase-8-student-authorization-redeem-runtime-security-review.md`
- `src/app/api/v1/authorizations/**`
- `src/app/api/v1/personal-auths/**`
- `src/app/api/v1/redeem-codes/**`
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

## Implementation Steps

- [x] Inspect existing route handlers, unavailable factories, service interfaces, repository patterns, mappers, validators, tests, and seed data for `authorization`, `personal_auth`, and `redeem_code`.
- [x] Write failing unit tests for authorization listing, personal authorization listing, redeem-code lifecycle boundaries, unauthenticated access, and DTO id leakage prevention.
- [x] Run focused unit tests and record the expected red failures.
- [x] Implement minimal repository/service/mapper/validator changes to satisfy the tests without adding dependencies or schema changes.
- [x] Wire route handlers to the existing session runtime and new service methods.
- [x] Keep unsupported/deferred mutations contract-safe with standard API error envelopes.
- [x] Run focused unit tests to green, then full `npm.cmd run test:unit`.
- [x] Create the required security review artifact with authorization, API, data exposure, redeem-code abuse cases, and verdict.
- [x] Run required gates: `Invoke-QualityGate.ps1`, `npm.cmd run build`, `Test-NamingConventions.ps1`, and `Test-GitCompletionReadiness.ps1 -BaseBranch master`.
- [x] Update evidence with command outputs, changed files, residual risks, and security review result.
- [ ] Commit the task, merge into `master`, rerun master closeout gates, push `master`, and delete the merged task branch after validation.

## Risk Controls

- No dependency changes.
- No `.env.example`, schema, migration, or `drizzle/**` changes.
- No external SMS, email, payment, production credential, or real AI provider connections.
- No bypass of existing auth/session runtime.
- No numeric auto-increment id in URL or DTO.
- No token, password, secret, or API key logging.
- Redeem-code state checks must include active, expired, used, cancelled/disabled, and not-yet-started boundaries where the current schema supports them.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-8-student-authorization-redeem-runtime
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
