# Unified Repair Auth Session Personal Auth Boundary Plan

## Task

- Task id: `unified-repair-auth-session-personal-auth-boundary`
- Branch: `codex/unified-repair-auth-session-personal-auth-boundary`
- Date: 2026-06-14
- Source story: `unified-standard-advanced-audit-campaign`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- Completed code-audit and repair evidence for auth scope, organization auth, question/paper, student experience,
  AI/RAG, admin ops/logs, repair queue seeding, and AI provider redaction/function contract.

## Scope

This task may address the P1 auth/session and personal authorization repair theme:

- browser `localStorage` bearer-token pattern;
- registration-to-`redeem_code` continuity;
- scoped `user-auth` and `authorization` layering;
- password-reset coverage boundaries.

The implementation must stay inside the queued `allowedFiles`. It must not change auth model, schema, migration,
env/secret/provider configuration, dependency/package/lockfile, e2e, staging/prod/cloud/deploy, payment,
external-service, PR, force-push, or Cost Calibration surfaces.

## TDD Plan

1. Add `tests/unit/auth/session-personal-auth-boundary.test.ts` first.
2. Run `npm.cmd run test:unit -- tests/unit/auth/session-personal-auth-boundary.test.ts` and record RED for expected
   missing behavior.
3. Implement the smallest scoped `user-auth` / `authorization` contract, mapper, validator, or UI boundary needed to
   make the target behavior pass.
4. Re-run the target unit test for GREEN.
5. Run full queued validation commands before closeout.

## Implementation Approach

- Prefer explicit contracts and validators over ad hoc string checks.
- Keep route handlers and pages as thin adapters in line with ADR-002.
- Use `publicId` and camelCase transport fields; never expose auto-increment ids in external paths.
- Keep evidence summary-only: no cleartext `redeem_code`, token, Authorization header, password, session value,
  database URL, row data, or private user data.
- If the required fix needs blocked files or blocked gates, stop and record evidence instead of widening scope.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- tests/unit/auth/session-personal-auth-boundary.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-auth-session-personal-auth-boundary`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-auth-session-personal-auth-boundary`

## Risk Controls

- Stop if schema/migration or auth model changes are required.
- Stop if env/secret/provider configuration is needed.
- Do not run e2e.
- Do not modify package files or lockfiles.
- Do not read `.env.local`, `.env.*`, real secret files, or provider configuration files.
- Keep all evidence redacted and scoped to command summaries.
