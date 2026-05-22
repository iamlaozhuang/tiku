# Phase 8 Student Profile And Redeem UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:test-driven-development` for behavior changes and `superpowers:verification-before-completion` before handoff. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the minimum Phase 8 student profile and redeem-code UI slice so `/profile` and `/redeem-code` are navigable, contract-safe, and backed by the existing session plus authorization/redeem APIs.

**Architecture:** Keep runtime behavior behind existing `/api/v1/authorizations`, `/api/v1/personal-auths`, and `/api/v1/redeem-codes/redeem` contracts. Implement student-facing UI in `src/features/student/**` and route pages under the allowed student app paths without changing API runtime, schema, packages, or environment files.

**Tech Stack:** Next.js App Router, React client components where interaction is required, TypeScript, Tailwind/design tokens, Vitest, Playwright when browser flow changes.

---

## Read Sources

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/02-architecture/interfaces/phase-8-product-surface-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-authorization-redeem-runtime.md`

## Scope

Allowed files:

- `docs/05-execution-logs/task-plans/2026-05-22-phase-8-student-profile-redeem-ui.md`
- `docs/05-execution-logs/evidence/2026-05-22-phase-8-student-profile-redeem-ui.md`
- `src/app/(student)/profile/**`
- `src/app/(student)/redeem-code/**`
- `src/app/(student)/home/**`
- `src/features/student/**`
- `tests/unit/**`
- `e2e/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `drizzle/**`

## Implementation Steps

- [x] Run recovery gates and create branch `codex/phase-8-student-profile-redeem-ui`.
- [x] Run `Test-TaskClaimReadiness.ps1 -TaskId phase-8-student-profile-redeem-ui`.
- [x] Inventory existing student routes, feature components, API contract types, unit tests, and E2E flow.
- [x] Write focused failing unit tests for the profile/redeem UI data normalization and contract-safe error behavior.
- [x] Run the focused unit test and confirm RED for the missing UI helper/component behavior.
- [x] Implement minimal student profile/redeem feature code using existing session runtime and Phase 8 authorization/redeem APIs.
- [x] Add route pages for `/profile` and `/redeem-code`, and update MVP-visible student navigation/home entrypoints within allowed paths.
- [x] Extend E2E only if browser navigation or redeem form coverage is changed.
- [x] Run focused tests to confirm GREEN.
- [x] Run required gates: `npm.cmd run test:unit`, `Invoke-QualityGate.ps1`, `npm.cmd run build`, `npm.cmd run test:e2e`, `Test-NamingConventions.ps1`, and `Test-GitCompletionReadiness.ps1 -BaseBranch master`.
- [x] Record command outcomes, residual risk, and closeout details in evidence.
- [ ] Commit task changes, merge to `master`, rerun necessary master gates, write closeout evidence, push `master`, prune and delete the merged task branch.

## Risk Controls

- Use only existing runtime APIs; do not bypass auth/session.
- Display contract-safe messages from standard API envelopes; never fabricate redeem success.
- Do not render session token, password, secret, API key, `code_hash`, or numeric database `id`.
- Keep UI mobile-first and token-driven; include loading, empty, error, unauthorized, and success states.
- Do not introduce dependencies or modify package/lock/env/schema/migration files.
