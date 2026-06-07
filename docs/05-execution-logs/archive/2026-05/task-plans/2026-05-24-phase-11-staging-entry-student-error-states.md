# Task Plan: phase-11-staging-entry-student-error-states

## Task Claim

- Task id: `phase-11-staging-entry-student-error-states`
- Branch: `codex/phase-11-staging-entry-student-error-states`
- Phase: `phase-11-staging-release-planning`
- Human approval: user explicitly requested completing the remaining local happy-path follow-up after the local redeem_code generation source. Scope is local student UI/runtime missing-object and error-state closure only. No Tencent Cloud, deployment, staging/prod connection, secret/env, dependency, schema, migration, script, package, or lockfile work is approved.

## Boundary

This task clarifies student local runtime and fixture error states for missing deep-linked objects:

- `practicePublicId` / `paperPublicId` practice entry;
- `mockExamPublicId` / `paperPublicId` mock exam entry;
- `examReportPublicId` report detail entry.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, or real/private data.

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
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-redeem-code-generation-source.md`

## Implementation Plan

1. Write failing tests that distinguish missing practice, missing mock exam, and missing exam report from generic load failure.
2. Add a local UI state for missing target objects in student practice, mock exam, and exam report pages.
3. Map runtime `404` / resource-not-found API responses to the missing-target state, while preserving unauthorized and generic failure behavior.
4. Keep recovery actions local and explicit: return to student home or report list; no token, raw answer, or content payload logging.
5. Verify focused tests, quality gate, naming scan, and git inventory.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-staging-entry-student-error-states.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-entry-student-error-states.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `src/features/student/practice/StudentPracticePage.tsx`
- `src/features/student/mock-exam/StudentMockExamReportPage.tsx`
- `tests/unit/student-practice-ui.test.ts`
- `tests/unit/student-mock-exam-report-ui.test.ts`

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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-staging-entry-student-error-states`
- `npm.cmd run test:unit -- --run tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Keep `authorization_expired` distinct from missing object states.
- Keep generic load failure for non-404 API failures and network failures.
- Avoid recording any local session token, Authorization header, answer body, full question paper, or private data in evidence.
