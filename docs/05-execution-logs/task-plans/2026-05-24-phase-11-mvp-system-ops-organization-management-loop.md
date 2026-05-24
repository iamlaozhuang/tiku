# Task Plan: phase-11-mvp-system-ops-organization-management-loop

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for runtime changes and superpowers:verification-before-completion before commit/merge/push. Track steps with checkbox syntax.

**Goal:** Close MVP-GAP-015 for local organization tree management: prove system ops can manage organization lifecycle with publicId-only APIs, standard responses, audit-safe metadata, and no dependency/schema/migration/script/env/staging/prod/cloud changes.

**Architecture:** Preserve ADR-002 route-handler -> service -> repository/model layering. Organization route handlers remain thin adapters over services. API responses use `{ code, message, data, pagination? }`, JSON fields use camelCase, and external URLs use publicId only.

**Boundary:** Allowed files cover organization API routes, admin features, server contracts/services, tests/e2e, and task docs/state. Schema, migration, script, dependency, env, cloud/deploy, staging/prod, package/lockfile, and destructive data changes are not approved. Major permission model changes require explicit approval before implementation.

**Scope expansion approval:** User approved expanding this task's `allowedFiles` to include `src/server/repositories/admin-organization-org-auth-runtime-repository.ts` for default local organization mutation runtime closure. This does not approve schema, migration, script, dependency, env, staging/prod, cloud, deployment, package, lockfile, or destructive data changes.

## Task Claim

- Task id: `phase-11-mvp-system-ops-organization-management-loop`
- Branch: `codex/phase-11-mvp-system-ops-organization-management-loop`
- Source gap: `MVP-GAP-015`
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
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-auth-session-account-hardening.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                                | Runtime surface                                     | Current state   | Implementation evidence                               | Downstream effect                                                                      | Remaining gap                    | Decision              |
| ------------------------------------------------------------------- | --------------------------------------------------- | --------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------------- | --------------------- |
| Organization list/detail remain publicId-only and standard-envelope | `/api/v1/organizations/**`                          | partial_runtime | Pending runtime inspection/tests                      | System ops can inspect organization tree safely                                        | P1 pending                       | inspect and implement |
| Organization lifecycle actions are locally verifiable               | organization service/API/admin UI                   | partial_runtime | RED/GREEN route/service tests                         | Ops can mutate organization state safely through injected/default repository contracts | none                             | implemented           |
| Organization mutations write redacted audit evidence                | service audit_log integration                       | partial_runtime | RED/GREEN service/API tests                           | Ops actions are reviewable without secret leakage                                      | none                             | implemented           |
| Default local Postgres runtime exposes organization mutation hooks  | `admin-organization-org-auth-runtime-repository.ts` | not_present     | RED/GREEN repository hook test, build/typecheck       | Route handlers can use real local repository methods                                   | none                             | implemented           |
| Organization flow does not rely on fixture-only/read-only behavior  | admin organization page and routes                  | partial_runtime | service/repository unit tests, full unit suite, build | Avoids false MVP completion from list-only coverage                                    | P2 side-effect DB smoke deferred | implemented           |
| No dependency/schema/migration/script/env/staging/prod change       | task boundary and repository state                  | runtime_closed  | Claim readiness passed                                | Keeps Phase 11 local-only boundary intact                                              | none                             | implemented           |

## TDD Plan

1. [x] Inspect existing organization routes, services, admin UI, and tests.
2. [x] RED: add focused failing tests for the highest-risk uncovered organization lifecycle acceptance gap.
3. [x] GREEN: implement the smallest hardening within allowed files.
4. [x] Record schema, permission-model, or destructive-data residuals as approval-blocked if discovered.
5. [x] Run validation, update evidence, commit, merge, push, cleanup, then claim the next task only from a clean repo.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-system-ops-organization-management-loop`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Do not read or output `.env.local`.
- Do not change dependencies, package files, lockfiles, schema, migrations, scripts, env files, cloud, deployment, staging, or prod configuration.
- Do not record secrets, credential values, Authorization header values, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR/resource text, or private data.
- Pause for approval before major permission model changes or destructive data operations.
