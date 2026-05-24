# Task Plan: phase-11-local-happy-path-student-session-controls

## Task Claim

- Task id: `phase-11-local-happy-path-student-session-controls`
- Branch: `codex/phase-11-local-happy-path-student-session-controls`
- Phase: `phase-11-staging-release-planning`
- Human approval: user explicitly approved continuing through the two local happy path closeout tasks, with commit, merge, push, cleanup, and a clean repository.

## Boundary

This task supports local happy-path role switching by making student session exit behavior explicit from the profile/redeem flow.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, or private data.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`

## Observed Problem

Manual local validation from `/profile` found that the student profile/redeem page does not expose an obvious exit control. That blocks clean local happy-path role switching when the same browser is used to validate student and system-ops flows.

## Root-Cause Plan

1. Inspect the current student profile/redeem UI and local session token helper.
2. Write a failing unit test that proves the profile page exposes a logout/exit control and clears the local session token.
3. Implement the smallest UI/runtime helper change needed for local student logout.
4. Verify the focused unit test, full quality gate, naming gate, and git completion gate.

## Allowed Files

- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-profile-redeem-ui.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-student-session-controls.md`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-student-session-controls`
- `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
