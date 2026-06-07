# Task Plan: phase-11-mvp-queue-runner-mechanism-hardening

## Task Claim

- Task id: `phase-11-mvp-queue-runner-mechanism-hardening`
- Branch: `codex/phase-11-mvp-queue-runner-mechanism-hardening`
- Phase: `phase-11-staging-release-planning`
- Human approval: user requested adding and claiming this mechanism-hardening task before starting the 16 MVP gap tasks, and approved future commit, merge, push, and safe short-lifecycle branch cleanup for those queued tasks. The approval does not cover dependency, schema, migration, script, secret/env, real provider, Tencent Cloud, staging/prod, deployment, major permission model, or destructive data operations.

## Boundary

This is a documentation and agent-mechanism task. It must not implement runtime features.

This task must not:

- change dependencies, `package.json`, or lockfiles;
- read or output `.env.local`;
- change secrets or env files;
- change schema, migration, or scripts;
- create cloud resources;
- deploy;
- connect to `staging` or `prod`;
- call external providers;
- record secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, or private data.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-functional-completeness-gap-audit.md`

## AC-to-Runtime Matrix

| Acceptance criterion                                 | Runtime / mechanism surface                                        | Evidence required                                                                                     | Misclassification defense                                                                                       |
| ---------------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Agent resumes from repository state, not chat memory | `project-state.yaml`, `task-queue.yaml`, latest task plan/evidence | Evidence names read files and current branch/status                                                   | Closeout cannot rely on unrecorded conversation context                                                         |
| Each MVP gap task maps AC to working runtime         | Task plan and evidence matrix                                      | Matrix records route/service/UI, seed/fixture/mock status, downstream effect, audit/ai_call_log needs | Route existence, read-only UI, entry-only validation, fixture-only data, and mock-only behavior must be labeled |
| Each task records severity and staging decision      | Task evidence                                                      | P0/P1/P2/P3 and `stagingDecision` are present                                                         | No staging readiness claim from partial local happy path                                                        |
| Repository is clean before next task                 | Repository Hygiene Closeout Checklist                              | Git completion inventory, pushed branch result, deleted merged branch, clean status                   | No dirty files, stale branch, untracked residue, or mixed-task changes are carried forward                      |

## Implementation Plan

1. Add `docs/04-agent-system/sop/mvp-queue-runner.md` with queue runner rules for the 16 MVP gap tasks.
2. Add `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md` with a required closeout checklist template.
3. Update `docs/04-agent-system/sop/automation-loop.md` to point MVP gap work at the new SOP and checklist.
4. Add this mechanism-hardening task to `task-queue.yaml`, and make the first MVP gap task depend on it.
5. Update `project-state.yaml` after claim to point at this task.
6. Record validation output and repository hygiene evidence.

## Allowed Files

- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/mvp-queue-runner.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/05-execution-logs/task-plans/2026-05-24-phase-11-mvp-queue-runner-mechanism-hardening.md`
- `docs/05-execution-logs/evidence/2026-05-24-phase-11-mvp-queue-runner-mechanism-hardening.md`
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

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-11-mvp-queue-runner-mechanism-hardening`
- `Select-String -Path 'docs\04-agent-system\sop\mvp-queue-runner.md','docs\04-agent-system\sop\repository-hygiene-closeout-checklist.md' -Pattern 'AC-to-runtime|fixture-only|mock-only|read-only|entry-only|Repository Hygiene Closeout Checklist|stagingDecision'`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Risk Controls

- Continue to use one short-lifecycle branch, one task plan, one evidence file, and one focused implementation commit per task.
- Treat the user's queue-wide commit/merge/push/cleanup approval as operational approval only; it does not waive risk gates.
- Stop before any dependency, schema, migration, script, secret/env, real provider, Tencent Cloud, staging/prod, deployment, major permission model, or destructive data operation.
- Never record `.env.local` content, secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, generated plaintext `redeem_code` values, or private data.
