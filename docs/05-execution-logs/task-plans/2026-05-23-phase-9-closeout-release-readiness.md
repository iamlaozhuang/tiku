# Task Plan: phase-9-closeout-release-readiness

## Metadata

- Task id: `phase-9-closeout-release-readiness`
- Branch: `codex/phase-9-closeout-release-readiness`
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
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-mvp-acceptance-browser-api-verification.md`

## Allowed Scope

Only these files may be changed:

- `docs/05-execution-logs/task-plans/2026-05-23-phase-9-closeout-release-readiness.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-closeout-release-readiness.md`
- `e2e/local-business-flow.spec.ts`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Scope expansion:

- Human approval: user replied "同意" after the blocker was reported and the recommended action was to allow `e2e/local-business-flow.spec.ts` for the recorded E2E transition-abort failure.
- Purpose: update only the existing Playwright expected-transition-abort filter for `/api/v1/users?`.
- No dependency, runtime, API, schema, environment, production-resource, or source application change is approved by this expansion.

Blocked files remain unchanged:

- `package.json`
- `pnpm-lock.yaml`
- `package-lock.json`
- `.env.example`
- `src/**`
- `drizzle/**`

## Implementation Approach

1. Confirm the claim gate passes for `phase-9-closeout-release-readiness`.
2. Review Phase 9 task statuses, the MVP acceptance contract, latest browser/API verification evidence, and the roadmap's Phase 9 section.
3. Create closeout evidence that summarizes:
   - Phase 9 completion state.
   - Required verification results.
   - Residual risks and explicit release readiness conclusion.
   - Non-goals and environment boundaries: no production resources, no real AI provider, no credentials, no dependency changes.
4. Update `project-state.yaml` to make this task the current closed Phase 9 closeout record after validation.
5. Update `task-queue.yaml` to mark this task closed after validation evidence is recorded.
6. Update `mvp-roadmap.md` only if needed for the Phase 9 closeout conclusion.
7. Run every validation command declared by the task queue and record results in evidence.
8. Commit the task, merge it back to `master`, run the necessary post-merge gates on `master`, update closeout evidence with merge/push details if needed, then push `origin/master` and remove the short-lived local branch.
9. If the recorded E2E transition-abort blocker is hit, apply the approved minimal E2E allowlist fix, then rerun the declared gates before closing the task.

## Risk Controls

- No runtime, schema, dependency, environment, or production-resource changes.
- No real AI provider, production credential, production database, production object storage, deployment, or PR creation.
- No secrets, session tokens, passwords, API keys, raw prompts, raw answers, or raw model responses in evidence.
- If a release-blocking risk is found, record it in evidence and do not expand allowed files.
- Keep roadmap changes limited to Phase 9 closeout status.

## Required Validation Commands

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-closeout-release-readiness
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
npm.cmd run test:e2e
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```
