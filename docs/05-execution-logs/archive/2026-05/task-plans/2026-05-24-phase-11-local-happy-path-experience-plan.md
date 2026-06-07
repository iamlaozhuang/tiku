# Task Plan: phase-11-local-happy-path-experience-plan

## Task Claim

- Task id: `phase-11-local-happy-path-experience-plan`
- Branch: `codex/phase-11-local-happy-path-experience-plan`
- Phase: `phase-11-staging-release-planning`
- Human approval: user approved proceeding by mechanism after local manual experience found the current role-by-route validation confusing and not sufficient for a fresh-system happy path.

## Boundary

This is a planning-only task. It records the local happy path experience strategy and follow-up task split before any further implementation.

This task must not:

- change application runtime code;
- change database schema or migrations;
- change package or lock files;
- change scripts;
- read or output `.env.local` contents;
- create or modify cloud resources;
- deploy;
- connect to `staging` or `prod`;
- add dependencies;
- create public object storage URLs;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, or customer/private data.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-23-phase-11-local-product-readiness-roleplay-run.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-staging-entry-known-limitations.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-staging-entry-student-practice-mock-entry.md`

## Observed User Feedback

The user manually tried a student path and found the current experience does not support a clear fresh-system validation:

- `/profile` does not provide an obvious logout path, making role switching and fresh-start validation difficult.
- `/profile` exposes redeem_code experience, but the user has no available card code to redeem.
- `/practice?paperPublicId=paper-dev-theory` shows one single-choice question but no answer options; the user cannot submit an answer.
- The practice restart button is visible but does not respond.
- `/mock-exam?paperPublicId=paper-dev-theory` also shows one single-choice question with no answer options; the user cannot save the answer or move to the next question.
- Forced submit reports one unsaved answer, which is expected protection but becomes a dead end because the answer cannot be saved.
- The current local seed data is not shaped like a fresh initialized system with role-by-role setup actions.

## Implementation Plan

1. Record the user-observed findings as a local happy path planning audit.
2. Define the desired fresh-system role journey:
   - `content ops`: create question, create paper, add question, publish paper.
   - `system ops`: create organization, create org_auth, generate redeem_code.
   - `student`: register/login, redeem_code, home, practice, mock_exam, exam_report, mistake_book, profile, logout.
3. Classify which gaps are local implementation blockers versus missing seed/fixture conditions.
4. Recommend follow-up task split with no cloud, deployment, secret/env, dependency, schema, migration, or script change in this task.
5. Update queue and project state so the next task is explicit and auditable.
6. Run local mechanism gates and record results in evidence.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-local-happy-path-experience-plan.md`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-local-happy-path-experience-plan.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-local-happy-path-experience-plan.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`
- `scripts/**`

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-local-happy-path-experience-plan`
- `Select-String -Path 'docs\05-execution-logs\audits-reviews\2026-05-24-phase-11-local-happy-path-experience-plan.md' -Pattern 'fresh_system_happy_path_not_ready|P1|redeem_code|logout|practice|mock_exam'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Treat Tencent Cloud preview as blocked until local fresh-system happy path is explicitly planned and minimum local blockers are closed.
- Do not treat existing seeded authorized student flow as a substitute for fresh registration, redeem_code, and role setup validation.
- Keep evidence redacted and route-level only.
- Keep this task planning-only; implementation tasks must be separately approved and scoped.
