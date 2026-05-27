# Phase 17 Prerequisite Readiness Planning

**Task id:** `phase-17-prerequisite-readiness-planning`

**Branch:** `codex/phase-17-prerequisite-readiness-planning`

**Date:** 2026-05-27

## Goal

Plan Phase 17 as a prerequisite readiness audit before any Phase 16 requirement implementation audit execution. This task registers the execution task, defines the verification scope, and creates a checklist for local e2e readiness. It does not run business fixes, edit source code, change tests, change dependencies, read env files, or touch deployment/cloud/provider state.

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-16-full-requirement-audit-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-full-audit-prerequisites.md`
- `docs/05-execution-logs/audits-reviews/2026-05-27-requirement-audit-catalog.md`

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked files and actions:

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- `src/**`
- `tests/**`
- `e2e/**`
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- real provider calls
- staging/prod/cloud/deploy actions
- dependency changes
- destructive database operations

## Execution Model

Phase 17 has two independent tasks:

1. `phase-17-prerequisite-readiness-planning`
   - Task kind: `docs_only`.
   - Output: plan, evidence, checklist, queue registration.
   - Completion: commit, merge into `master`, push `origin/master`, and delete the short-lived branch.

2. `phase-17-local-e2e-prerequisite-readiness-audit`
   - Task kind: `local_verification`.
   - Output: local readiness audit report, evidence, and queue updates for any prerequisites found missing.
   - Completion: commit, merge into `master`, push `origin/master`, and delete the short-lived branch.

Missing prerequisites must be registered as follow-up prerequisite tasks. They must not be repaired inside the readiness audit unless a later task explicitly scopes and approves the relevant file/action surface.

## Readiness Dimensions

The execution audit must verify or block-document:

- Local dev server startup and stability.
- Local database availability.
- Fixture or seed coverage for requirement audit.
- Role account coverage for `student`, `super_admin`, `ops_admin`, and `content_admin`.
- Existing e2e script discoverability and runnable condition.
- Browser/IAB or Playwright local target readiness.
- Env/secret restrictions without reading `.env.local` or `.env.example`.
- Long-lived blocked gates: real provider, staging/prod, cloud/deploy, dependency changes, destructive data operations.

## Prerequisite Handling Rule

If a prerequisite is missing, unstable, or blocked:

- record evidence;
- mark the affected audit dimensions as `partial` or `blocked`;
- add a prerequisite task to the queue only when it can be described with clear scope and validation;
- do not hard-run Phase 16 requirement audit items that depend on the missing prerequisite;
- do not fix implementation defects or change runtime behavior.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`
- `node .\node_modules\prettier\bin\prettier.cjs --check docs\04-agent-system\state\project-state.yaml docs\04-agent-system\state\task-queue.yaml docs\05-execution-logs\task-plans\2026-05-27-phase-17-prerequisite-readiness-planning.md docs\05-execution-logs\evidence\2026-05-27-phase-17-prerequisite-readiness-planning.md docs\05-execution-logs\audits-reviews\2026-05-27-phase-17-prerequisite-readiness-checklist.md`

## Risk Controls

- Evidence must summarize command outcomes and avoid copying sensitive values.
- Framework output may mention `.env.local` existence only; env contents remain forbidden.
- E2E or browser failures are readiness findings, not implementation fixes.
- Phase 16 audit execution tasks remain pending until Phase 17 readiness state is known.
