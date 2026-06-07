# Task Plan: phase-11-local-happy-path-redeem-code-generation-source

## Task Claim

- Task id: `phase-11-local-happy-path-redeem-code-generation-source`
- Branch: `codex/phase-11-local-happy-path-redeem-code-generation-source`
- Phase: `phase-11-staging-release-planning`
- Human approval: user explicitly requested completing the local redeem_code generation source after closeout. Scope is local UI/runtime happy-path closure only. No Tencent Cloud, deployment, staging/prod connection, secret/env, dependency, schema, migration, script, package, or lockfile work is approved.

## Boundary

This task creates a local dev system ops source for a usable one-time `redeem_code` so the student redemption happy path can be validated without faking a closure.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, or real/private data;
- record a plaintext generated `redeem_code` value in evidence or final response.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-ops-role-verification.md`

## Implementation Plan

1. Write failing unit tests for admin redeem_code runtime `POST /api/v1/redeem-codes`, admin UI generation, and student copy.
2. Add `RedeemCodeGenerationDto` and repository `createRedeemCode`.
3. Add `POST` to `src/app/api/v1/redeem-codes/route.ts`, keeping list responses masked.
4. Wire `/ops/users` generation confirmation to the new route and show the generated card as a one-time local source.
5. Update student profile/redeem copy to point to system ops as the configured source.
6. Verify focused tests, quality gate, naming scan, and git inventory.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-local-happy-path-redeem-code-generation-source.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-redeem-code-generation-source.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/app/api/v1/redeem-codes/route.ts`
- `src/server/contracts/admin-user-org-auth-ops-contract.ts`
- `src/server/repositories/admin-redeem-code-runtime-repository.ts`
- `src/server/services/admin-redeem-code-runtime.ts`
- `src/features/admin/admin-ops-management/AdminOpsManagement.tsx`
- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts`
- `tests/unit/student-profile-redeem-ui.test.ts`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-redeem-code-generation-source`
- `npm.cmd run test:unit -- --run tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/phase-9-admin-ops-runtime-ui-completion.test.ts tests/unit/student-profile-redeem-ui.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- The generated plaintext card value is a one-time operational value shown only in the local admin UI response; it must not be written to evidence, logs, real-data tests, or final response.
- Keep list responses masked.
- Keep the route admin-session protected and permission-bound to system ops roles.
- Do not bypass student authorization or redeem_code conflict checks.
