# Task Plan: phase-11-mvp-system-ops-org-auth-management-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close MVP-GAP-007 with local org_auth management evidence for create/cancel/adjust behavior, overlap prevention, quota occupancy, effective authorization union with personal_auth, immediate access loss, active flow termination, and audit behavior.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Keep route handlers thin, use standard `{ code, message, data, pagination? }` responses, and keep system ops mutations scoped to public identifiers and explicit permission checks.

**Tech Stack:** Next.js App Router route handlers, TypeScript services, existing authorization and student runtime services, Vitest, existing Playwright e2e only if required by the task validation command.

---

## Task Claim

- Task id: `phase-11-mvp-system-ops-org-auth-management-loop`
- Branch: `codex/phase-11-mvp-system-ops-org-auth-management-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved continuing the 16 MVP gap tasks with commit, merge, push, and safe branch cleanup. This task remains local-only; dependency, schema, migration, script, cloud, deployment, staging/prod, secret/env, package, lockfile, or real-provider work is not approved.

## Boundary

This task may modify org_auth, authorization, personal_auth, admin/student feature code under allowed roots, service contracts, services, tests, task plan/evidence, and queue state only.

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
- `docs/01-requirements/stories/epic-01-auth-and-access.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                          | Runtime surface                                            | Current state    | Implementation evidence                        | Downstream effect                                             | Remaining gap | Decision    |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------- | ---------------- | ---------------------------------------------- | ------------------------------------------------------------- | ------------- | ----------- |
| System ops can create org_auth with requirement-level fields                  | `/api/v1/org-auths`, admin org_auth service                | implemented      | RED/GREEN admin runtime tests                  | Organizations can receive scoped enterprise authorization     | none          | implemented |
| Cancel/adjust org_auth changes effective access immediately                   | org_auth service, student authorization scope runtime      | implemented      | Cancel route and effective authorization tests | Student hidden/denied access updates after cancellation       | none          | implemented |
| Overlap and quota rules are enforced without schema changes                   | org_auth create/update validation                          | implemented      | Overlap guard, quota occupancy, related tests  | Prevents double grants and over-allocation                    | bounded       | implemented |
| Effective authorization union includes org_auth and personal_auth             | `/api/v1/authorizations/**`, student authorization service | existing_runtime | Existing effective authorization tests passed  | Student sees all valid scopes and loses invalidated scopes    | none          | verified    |
| Active practice/mock_exam flows terminate or become inaccessible on auth loss | practice/mock_exam/student paper runtime                   | implemented      | Cancel termination hook and related flow tests | Prevents continued use after enterprise authorization removal | none          | implemented |
| Audit behavior covers org_auth mutations without raw payloads                 | audit_log append/list evidence                             | implemented      | Redacted audit metadata tests                  | Ops changes remain reviewable                                 | none          | implemented |

## TDD Plan

1. [x] Inspect current org_auth, authorization, personal_auth, student paper, practice/mock_exam, and audit runtime code.
2. [x] RED: add focused failing tests for org_auth create/cancel/overlap/quota/effective authorization gaps.
3. [x] GREEN: wire the smallest local service/runtime behavior needed to satisfy RED tests without schema/dependency changes.
4. [x] Extend tests for permission denial, public-id-only responses, safe error states, active-flow impact, and redacted audit metadata.
5. [ ] Run validation commands, update evidence, closeout checklist, commit, merge, push, cleanup, then claim the next queued task only from a clean repo.

## Allowed Files

- `src/app/api/v1/org-auths/**`
- `src/app/api/v1/authorizations/**`
- `src/app/api/v1/personal-auths/**`
- `src/features/admin/**`
- `src/features/student/**`
- `src/server/contracts/**`
- `src/server/services/**`
- `src/server/repositories/**`
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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-system-ops-org-auth-management-loop`
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Keep work local-only and fixture/mock backed.
- Do not read or output `.env.local` or any secret value.
- Do not introduce major permission-model changes without approval.
- Do not add schema/migration/script/dependency changes.
- Do not perform destructive data operations; model cancellation/termination effects in local service tests only.
- Keep audit evidence redacted: public ids and metadata summary only, no Authorization headers or raw request payloads.
