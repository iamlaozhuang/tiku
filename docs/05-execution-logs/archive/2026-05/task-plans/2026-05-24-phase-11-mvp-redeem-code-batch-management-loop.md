# Task Plan: phase-11-mvp-redeem-code-batch-management-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close MVP-GAP-008 with local redeem_code batch management evidence for batch generation, 100-code limit, uppercase display policy, search/status filters, UTC+8 expiry behavior, plaintext viewing policy, audit logging, and generated-code-to-student redemption acceptance.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Keep route handlers thin, use standard `{ code, message, data, pagination? }` responses, and avoid recording generated plaintext redeem_code values in evidence.

**Tech Stack:** Next.js App Router route handlers, TypeScript services, existing redeem_code and student authorization runtimes, Vitest, existing Playwright e2e only if required by validation.

---

## Task Claim

- Task id: `phase-11-mvp-redeem-code-batch-management-loop`
- Branch: `codex/phase-11-mvp-redeem-code-batch-management-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task remains local-only; dependency, schema, migration, script, cloud, deployment, staging/prod, secret/env, package, lockfile, or real-provider work is not approved.

## Boundary

This task may modify redeem_code, authorization, personal_auth, admin/student feature code under allowed roots, service contracts, repositories, services, tests, task plan/evidence, and queue state only.

Boundary correction after runtime inspection: the default local API uses `src/server/repositories/admin-redeem-code-runtime-repository.ts` and `src/server/repositories/student-authorization-redeem-runtime-repository.ts` for batch generation, list filtering, audit logging, and generated-code redemption. Repository edits are included for this task only; schema, migration, script, dependency, env, staging/prod, and deployment boundaries remain blocked.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- perform destructive data operations;
- record secrets, tokens, Authorization headers, raw payloads, raw prompts/answers/model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, or private data.

If completing the loop requires schema, migration, script, dependency, secret/env, staging/prod, major permission-model, or destructive data work, stop and record an approval-gated follow-up.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                            | Runtime surface                              | Current state   | Implementation evidence                    | Downstream effect                                | Remaining gap | Decision              |
| --------------------------------------------------------------- | -------------------------------------------- | --------------- | ------------------------------------------ | ------------------------------------------------ | ------------- | --------------------- |
| System ops can generate redeem_code batches with a 100 limit    | `/api/v1/redeem-codes`, admin service        | partial_runtime | Pending RED/GREEN tests                    | Ops can issue bounded card batches               | P1 pending    | inspect and implement |
| Generated code display uses uppercase non-secret policy         | redeem_code generation/display service       | partial_runtime | Pending tests and evidence redaction       | Ops can copy codes without evidence leakage      | P1 pending    | inspect and implement |
| List/search/status filters include UTC+8 expiry behavior        | `/api/v1/redeem-codes`, admin list service   | partial_runtime | Pending list/filter tests                  | Ops can find unused/used/expired codes correctly | P1 pending    | inspect and implement |
| Generated code can be redeemed by student into personal_auth    | `/api/v1/redeem-codes/redeem`, personal_auth | partial_runtime | Pending generated-code-to-redemption tests | Student receives personal authorization          | P1 pending    | inspect and implement |
| Audit behavior covers batch generation without raw code leakage | audit_log append/list evidence               | partial_runtime | Pending redacted audit metadata tests      | Ops changes remain reviewable                    | P1 pending    | inspect and implement |

## TDD Plan

1. [x] Inspect current redeem_code generation, list, redemption, personal_auth, and audit runtime code.
2. [x] RED: add focused failing tests for batch generation, 100 limit, status/search filters, generated redemption, and audit redaction.
3. [x] GREEN: wire the smallest local service/runtime behavior needed to satisfy RED tests without schema/dependency changes.
4. [x] Extend tests for permission denial, no raw code leakage in evidence, and generated-code-to-student redemption acceptance.
5. [x] Run validation commands, update evidence, closeout checklist, commit, merge, push, cleanup, then claim the next queued task only from a clean repo.

## Allowed Files

- `src/app/api/v1/redeem-codes/**`
- `src/app/api/v1/authorizations/**`
- `src/app/api/v1/personal-auths/**`
- `src/features/admin/**`
- `src/features/student/**`
- `src/server/contracts/**`
- `src/server/repositories/**`
- `src/server/services/**`
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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-redeem-code-batch-management-loop`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Keep work local-only and fixture/mock backed.
- Do not read or output `.env.local` or any secret value.
- Do not add schema/migration/script/dependency changes.
- Do not record generated plaintext redeem_code values in evidence or final response.
- Do not record Authorization headers, raw request payloads, or private data.
- Keep audit evidence redacted: generation counts, scope metadata, and public ids only.
