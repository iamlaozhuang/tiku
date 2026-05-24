# Task Plan: phase-11-local-happy-path-redeem-code-loop

## Task Claim

- Task id: `phase-11-local-happy-path-redeem-code-loop`
- Branch: `codex/phase-11-local-happy-path-redeem-code-loop`
- Phase: `phase-11-staging-release-planning`
- Human approval: user explicitly approved continuing through the two local happy path closeout tasks, with commit, merge, push, cleanup, and a clean repository.

## Boundary

This task supports the local `redeem_code` happy path so a fresh local validation run can understand where a usable card comes from and complete student redemption with existing local dev runtime boundaries.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- change database schema or migrations;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, redeem_code plaintext, or private data.

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

Manual local validation from `/profile` found that the student can see a card redemption form but does not have a usable card value or a clear local happy-path source for one. That makes the student redemption loop hard to validate from a fresh local system.

## Root-Cause Plan

1. Inspect the existing student redeem UI, admin redeem-code UI, and admin redeem-code runtime contract.
2. Identify whether local dev already exposes a safe card source or only masked summaries.
3. Write failing tests for the smallest acceptable happy-path affordance without exposing plaintext card values in evidence or logs.
4. Implement the smallest UI/runtime change within allowed files.
5. Verify focused tests, full quality gate, naming gate, browser smoke where feasible, and git completion gate.

## Allowed Files

- `src/features/student/profile/StudentProfileRedeemPage.tsx`
- `src/features/admin/org-auth-redeem/AdminOrgAuthRedeemPage.tsx`
- `src/server/services/admin-redeem-code-runtime.ts`
- `tests/unit/student-profile-redeem-ui.test.ts`
- `tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts`
- `tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-redeem-code-loop.md`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-redeem-code-loop`
- `npm.cmd run test:unit -- tests/unit/student-profile-redeem-ui.test.ts tests/unit/phase-8-admin-org-auth-redeem-ui.test.ts tests/unit/phase-8-admin-redeem-code-runtime.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
