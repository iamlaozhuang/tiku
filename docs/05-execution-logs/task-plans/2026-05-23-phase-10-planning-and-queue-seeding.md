# Task Plan: phase-10-planning-and-queue-seeding

## Metadata

- Task id: `phase-10-planning-and-queue-seeding`
- Branch: `codex/phase-10-local-rc-planning`
- Base branch: `master`
- Created at: `2026-05-23T00:00:00+08:00`
- Task plan policy: `required`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-closeout-release-readiness.md`

## Scope

Allowed files for this planning task:

- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-planning-and-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-planning-and-queue-seeding.md`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `.env.local`
- `src/**`
- `drizzle/**`

## Implementation Approach

1. Create a Phase 10 local release candidate hardening contract that keeps all work inside the local `dev` environment.
2. Define security and privacy rules for future real `model_provider` credentials and real `paper`/`material`/`resource` inputs:
   - No API keys, secrets, session tokens, passwords, raw prompts, raw answers, raw model responses, or long content excerpts in Git, evidence, screenshots, logs, or chat.
   - Real credentials are supplied by the user locally through uncommitted `.env.local` only.
   - Real content is processed locally and summarized in evidence without large verbatim extracts.
3. Seed the Phase 10 task queue with small, dependency-ordered local tasks:
   - planning and queue seeding.
   - fresh checkout readiness.
   - local database rebuild, migration, and seed rehearsal.
   - local real content import dry run.
   - local real AI provider safety plan.
   - local real AI provider smoke test.
   - local RAG with real content smoke test.
   - local MVP acceptance rerun and closeout.
4. Update roadmap and project state to point at Phase 10 only after the queue is seeded.
5. Run local gates and write evidence.

## Risk Controls

- This planning task does not introduce dependencies.
- This planning task does not modify runtime code, database schema, migrations, environment examples, or production resources.
- Future real provider work must require explicit human approval and must not record API keys or secrets.
- Future real content work must keep source files local unless a later task explicitly approves a sanitized fixture or metadata-only artifact.
- No deployment, PR, staging, prod, object storage, or cloud resource change is included.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-planning-and-queue-seeding
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
