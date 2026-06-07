# Fix Local Business Flow Runtime Task Plan

## Metadata

- Task id: `phase-7-fix-local-business-flow-runtime`
- Branch: `codex/fix-local-business-flow-runtime`
- Base branch: `codex/local-business-flow-verification`
- Root evidence: `docs/05-execution-logs/evidence/2026-05-21-local-business-flow-verification.md`
- Task type: verification-driven runtime repair.
- Dependency changes: not allowed and not intended.
- Human approval evidence: user requested on 2026-05-22 to "进入修复任务，规划完整的实施方案，并记录，然后分步骤执行。"
- High-risk note: adding a local dev Drizzle migration is required because `audit_log` is absent from the physical dev schema. No `drizzle-kit push`, no production database, no destructive data operation, no remote push/PR/merge.

## Required Reading Completed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/runtime-slice-contract.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- Latest evidence: `docs/05-execution-logs/evidence/2026-05-21-local-business-flow-verification.md`
- Prior task plans/evidence for Phase 7 session, student flow, admin flow, audit log, AI mock provider, dev migration/seed, and local E2E readiness.

## Problem Statement

The local full business-flow verification was only partially successful:

- `audit_log` table is missing from the local migrated schema, so safe admin audit actions cannot be persisted or verified.
- The mock AI provider runtime can append `ai_call_log`, but no current UI/API business route triggers it.
- `/login` is still a placeholder and student/admin browser flows are mostly fixture or static navigation, so browser verification cannot prove the real session-backed MVP flow.

This task repairs the smallest runtime slice needed for truthful local verification. It does not introduce new product features beyond making already-contracted local runtime paths verifiable.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-22-fix-local-business-flow-runtime.md`
- `docs/05-execution-logs/evidence/2026-05-22-fix-local-business-flow-runtime.md`
- `docs/05-execution-logs/audits-reviews/2026-05-22-fix-local-business-flow-runtime-security-review.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `drizzle/**`
- `src/db/schema/**`
- `src/db/dev-seed.ts`
- `src/ai/**`
- `src/app/(auth)/login/**`
- `src/app/(student)/**`
- `src/app/api/v1/audit-logs/**`
- `src/app/api/v1/exam-reports/**`
- `src/app/api/v1/ai-call-logs/**`
- `src/app/api/v1/model-configs/**`
- `src/features/student/**`
- `src/server/auth/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `e2e/**`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- External provider configuration
- Production, preview, remote, or deployment configuration

## Implementation Plan

1. Record this plan and initial evidence.
   - Create a new evidence file before runtime edits.
   - Keep changes on `codex/fix-local-business-flow-runtime`.
2. RED: add failing schema/repository tests for real `audit_log`.
   - Assert the Drizzle schema exports an `auditLog` table named `audit_log`.
   - Assert append/list behavior no longer silently treats the table as optional for migrated local dev.
3. GREEN: add `audit_log` schema and migration.
   - Define only redaction-safe fields already used by the runtime: `public_id`, `actor_public_id`, `actor_role`, `action_type`, `target_resource_type`, `target_public_id`, `result_status`, `metadata_summary`, `request_ip`, `created_at`.
   - Add indexes using project naming rules.
   - Remove the missing-table success fallback for the default runtime path where appropriate, while preserving tests for authorization and redaction.
4. RED: add failing route/runtime tests for business-triggered mock AI.
   - Target `POST /api/v1/exam-reports/{publicId}/retry-learning-suggestion`.
   - Assert authenticated student ownership/authorization is required.
   - Assert the route calls the mock AI runtime and appends an `ai_call_log`.
   - Assert returned payloads and admin reads do not expose raw prompt, raw answer, provider payload, API key, token, or numeric `id`.
5. GREEN: wire the retry learning suggestion route to local runtime.
   - Use the existing local session resolver and exam report repository.
   - Use seeded `model_config` and `prompt_template` values.
   - Keep the provider deterministic and local-only.
6. Browser verification repair.
   - First verify whether API-assisted browser flow can proceed without changing UI.
   - If UI changes are necessary, implement only the minimum login/session storage and student home runtime loader needed for browser-level local flow.
   - Do not modify business logic just to make tests pass; record any remaining UI gap as evidence.
7. Validation and evidence.
   - Run focused unit tests after each fix.
   - Run `docker compose ps`, Drizzle migration, dev seed, browser automation, `Invoke-QualityGate.ps1`, `npm.cmd run build`, `npm.cmd run test:e2e`, naming, and git completion readiness.
   - Record browser URL, roles, login method, visible states, interactions, console errors, network failures, screenshot status, and failure stopping point.
8. Closeout.
   - Write security review and final evidence.
   - Stage/commit only task-scoped files if gates pass.
   - Do not push, create PR, merge, or deploy without explicit user approval.

## Risk Defense

- Database: migration is additive only; no destructive SQL and no `drizzle-kit push`.
- Auth: runtime routes must still resolve sessions from bearer tokens; no bypass, no hardcoded privileged session.
- Authorization: student report operations must combine session, ownership, report public id, and effective authorization.
- Redaction: `audit_log` and `ai_call_log` expose summaries/public ids only, never secrets, raw prompts, raw answers, provider payloads, password hashes, bearer tokens, or session tokens.
- Naming: table/column names stay `snake_case`; REST paths stay kebab-case plural; API JSON stays camelCase.
- Scope: no dependency changes, no `.env.example` changes, no real AI provider credentials, no external login/payment/SMS/email.
- Verification honesty: `npm.cmd run test:e2e` remains smoke unless this task explicitly adds coverage; final evidence must separate browser, API, and DB coverage.
