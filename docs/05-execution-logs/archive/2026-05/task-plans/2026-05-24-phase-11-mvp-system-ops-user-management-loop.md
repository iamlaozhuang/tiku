# Task Plan: phase-11-mvp-system-ops-user-management-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close MVP-GAP-006 with local system-ops user and employee management runtime evidence for reset, disable/enable, employee lifecycle, session invalidation, active flow termination, permission checks, and audit behavior.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Keep route handlers thin, use standard `{ code, message, data, pagination? }` responses, and keep admin/system operations scoped to public identifiers and explicit permission checks.

**Tech Stack:** Next.js App Router route handlers, TypeScript services, existing local auth/session/admin ops runtimes, Vitest, and existing e2e coverage where relevant.

---

## Task Claim

- Task id: `phase-11-mvp-system-ops-user-management-loop`
- Branch: `codex/phase-11-mvp-system-ops-user-management-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task remains local-only; dependency, schema, migration, script, cloud, deployment, staging/prod, secret/env, package, lockfile, or destructive data work is not approved.

## Boundary

This task may modify user/employee API route handlers, admin feature code under allowed roots, auth/service contracts, services, tests, task plan/evidence, and queue state only.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- perform destructive data operations;
- record secrets, tokens, Authorization headers, raw prompts/answers/model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, or private data.

If completing the loop requires schema, migration, script, dependency, secret/env, staging/prod, major permission-model, or destructive data work, stop and record an approval-gated follow-up.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/modules/02-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/stories/epic-06-admin-ops.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                            | Runtime surface                          | Current state    | Implementation evidence                        | Downstream effect                               | Remaining gap | Decision              |
| --------------------------------------------------------------- | ---------------------------------------- | ---------------- | ---------------------------------------------- | ----------------------------------------------- | ------------- | --------------------- |
| Admin can reset user password/account state with permission     | `/api/v1/users/**`, user service         | existing_runtime | Existing reset route/runtime and unit coverage | Ops can recover accounts safely                 | none          | verified by full unit |
| Admin can disable/enable user and terminate active flows        | user service, session/auth runtime       | implemented      | RED/GREEN lifecycle tests                      | Disabled users cannot keep using active flows   | none          | implemented           |
| Employee lifecycle is granular and scoped                       | `/api/v1/employees/**`, employee service | implemented      | RED/GREEN create/disable tests                 | Org/system ops can manage employee access       | none          | implemented           |
| Authorization/session effects are explicit and non-leaky        | auth/session/user context                | implemented      | Permission denial and redaction tests          | Student/admin sessions respect lifecycle states | none          | implemented           |
| Audit behavior covers system ops mutations without raw payloads | audit_log append/list evidence           | implemented      | Redacted audit metadata tests                  | Ops changes remain reviewable                   | none          | implemented           |

## TDD Plan

1. [x] Inspect current user, employee, session, auth, and admin ops runtime code.
2. [x] RED: add focused failing tests for reset/enable/disable/employee lifecycle/session/audit gaps.
3. [x] GREEN: wire the smallest local service/runtime behavior needed to satisfy RED tests without schema/dependency changes.
4. [x] Extend tests for permission denial, public-id-only responses, error states, and redacted audit metadata.
5. [ ] Run validation commands, update evidence, closeout checklist, commit, merge, push, cleanup, then claim the next queued task only from a clean repo.

## Allowed Files

- `src/app/api/v1/users/**`
- `src/app/api/v1/employees/**`
- `src/features/admin/**`
- `src/server/contracts/**`
- `src/server/services/**`
- `src/server/auth/**`
- `tests/unit/**`
- `e2e/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `drizzle/**`
- `scripts/**`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-system-ops-user-management-loop`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Keep work local-only and fixture/mock backed.
- Do not read or output `.env.local` or any secret value.
- Do not introduce new authorization roles or major permission-model changes without approval.
- Do not add schema/migration/script/dependency changes.
- Do not perform destructive data operations; model termination effects in local service tests only.
- Keep audit evidence redacted: public ids and metadata summary only, no Authorization headers or raw request payloads.
