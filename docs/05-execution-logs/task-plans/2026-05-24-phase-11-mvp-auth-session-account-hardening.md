# Task Plan: phase-11-mvp-auth-session-account-hardening

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Track steps with checkbox syntax.

**Goal:** Close MVP-GAP-014 for local auth/session/account acceptance gaps: prove login/session/account surfaces are publicId-safe, protected, and locally verifiable without dependency, schema, migration, script, staging/prod, cloud, secret/env, package, lockfile, or destructive data changes.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Auth/session routes remain thin adapters. API responses use `{ code, message, data, pagination? }`; JSON fields use camelCase; external URLs must not expose auto-increment IDs.

**Boundary:** Allowed files cover auth pages, session/user API routes, student/admin features, contracts, services, server auth, tests/e2e, and task docs/state. Schema, migration, script, dependency, env, cloud/deploy, staging/prod, destructive data, and package/lockfile changes are not approved. Major permission model changes require explicit approval before implementation.

## Task Claim

- Task id: `phase-11-mvp-auth-session-account-hardening`
- Branch: `codex/phase-11-mvp-auth-session-account-hardening`
- Source gap: `MVP-GAP-014`
- Human approval: user approved routine commit/merge/push/cleanup for the MVP gap queue. Hard-stop gates still require explicit task-specific approval.
- Claim readiness: passed while queue status was `pending`.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-ai-call-log-coverage-hardening.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                              | Runtime surface                        | Current state   | Implementation evidence         | Downstream effect                              | Remaining gap | Decision    |
| ----------------------------------------------------------------- | -------------------------------------- | --------------- | ------------------------------- | ---------------------------------------------- | ------------- | ----------- |
| Session/account endpoints return publicId-safe current user state | `/api/v1/sessions`, auth service       | partial_runtime | Target unit route/service tests | Students/admins can verify login state safely  | none          | implemented |
| Unauthorized and expired session states return standard envelopes | session route/service                  | partial_runtime | Target unit negative-path tests | Clients can handle auth failures predictably   | none          | implemented |
| Login/register/account UI avoids leaking token/password internals | auth pages and feature code            | partial_runtime | Full unit/e2e regression gates  | Local acceptance does not expose credentials   | none          | implemented |
| User account admin actions remain publicId-only and audit-safe    | `/api/v1/users/**`, admin services     | partial_runtime | RED/GREEN reset-session test    | System ops can manage accounts without raw IDs | none          | implemented |
| No dependency/schema/migration/script/env/staging/prod change     | task boundary and repository inventory | runtime_closed  | Claim readiness passed          | Keeps Phase 11 local-only boundary intact      | none          | implemented |

## TDD Plan

1. [x] Inspect existing auth/session/user routes, services, UI, and tests.
2. [x] RED: add focused failing tests for the highest-risk uncovered local auth/session/account acceptance gap.
3. [x] GREEN: implement the smallest hardening within allowed files.
4. [x] Record any major permission-model, schema, or repository residual as approval-blocked.
5. [x] Run validation and update evidence; commit, merge, push, cleanup remain the closeout steps before the next task.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-auth-session-account-hardening`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Do not read or output `.env.local`.
- Do not change dependencies, package files, lockfiles, schema, migrations, scripts, env files, cloud, deployment, staging, or prod configuration.
- Do not record tokens, Authorization headers, passwords, password hashes, session secrets, private account data, raw provider payloads, raw prompts, raw answers, or raw model responses.
- Pause for approval before major permission model changes or destructive data operations.
