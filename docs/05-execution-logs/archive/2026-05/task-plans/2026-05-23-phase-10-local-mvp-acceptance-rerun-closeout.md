# Task Plan: phase-10-local-mvp-acceptance-rerun-closeout

## Metadata

- Task id: `phase-10-local-mvp-acceptance-rerun-closeout`
- Branch: `codex/phase-10-local-mvp-acceptance-rerun-closeout`
- Base branch: `master`
- Created at: `2026-05-23T21:27:03+08:00`
- Task plan policy: `required`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-rag-real-content-smoke-test.md`

## Scope

Allowed files for this task:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-10-local-mvp-acceptance-rerun-closeout.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-mvp-acceptance-rerun-closeout.md`
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

1. Create the short-lived branch and run `Test-TaskClaimReadiness.ps1` for the final task.
2. If the dependency `phase-10-local-rag-real-content-smoke-test` remains blocked, do not claim Phase 10 local release candidate acceptance.
3. Record a blocked closeout evidence file that distinguishes:
   - repository and local gate health,
   - successful earlier Phase 10 work,
   - the unresolved real-content RAG blocker,
   - the reason the final MVP acceptance rerun cannot honestly be marked closed.
4. Update `task-queue.yaml` to mark `phase-10-local-mvp-acceptance-rerun-closeout` as `blocked`.
5. Update `project-state.yaml` so the current task points to this final blocked closeout and the handoff points to the required follow-up.
6. Update `mvp-roadmap.md` with a Phase 10 closeout status noting that the phase is locally validated up to the real-content RAG boundary but not closed.
7. Run the final task validation commands where meaningful:
   - `Test-TaskClaimReadiness.ps1` is expected to fail after dependency check and is recorded as blocker evidence.
   - Docker, readiness, quality gate, build, E2E, naming, and Git inventory are run to show repository health.
8. Commit, merge to `master`, rerun necessary post-merge gates, push `origin/master`, and delete the short-lived branch if all changed files remain within scope.

## Risk Controls

- Do not call a real provider or rerun DeepSeek smoke.
- Do not read or print `.env.local` values.
- Do not output raw content, raw prompts, raw answers, model responses, provider payloads, answer keys, OCR text, or secrets.
- Do not connect staging/prod, deploy, or modify production resources.
- Do not fabricate the final acceptance result when the ordered Phase 10 dependency is blocked.

## Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-10-local-mvp-acceptance-rerun-closeout
docker compose ps
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
