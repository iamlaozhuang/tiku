# Task Plan: advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck

## Scope

- Perform a readonly recheck of the organization-training publish-version route trusted-lineage runtime wiring after the
  TDD task closed.
- Confirm whether the runtime route factory now injects the repository trusted-lineage lookup.
- Confirm whether the default App Router runtime entrypoint has enough organization-admin actor context wiring to reach
  that lookup without test-only injection.
- If a remaining runtime actor-context gap is found, seed the next narrow TDD task only in docs/state.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd.md`

## Readonly Evidence Targets

- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/services/organization-training-service.ts`
- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`

## Allowed Changes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md`

## Blocked Gates

- No `.env*` read, output, or edit.
- No real DB command execution, direct row/private data access, or database URL exposure.
- No schema/drizzle edits, migration generation, or migration execution.
- No product source, test source, repository, mapper, contract, model, validator, app route, or script edits.
- No provider/model call, provider configuration, raw prompt, raw answer, or provider payload.
- No dependency, package, or lockfile change.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No quota/cost measurement or Cost Calibration Gate.
- No PR or force push.

## Execution Steps

1. Reconfirm repository readiness on `master`, fetch/prune, clean status, `HEAD == master == origin/master`, and no
   local/remote `codex/*` residual before creating a short branch.
2. Read the required governance, ADR, state, fast-lane, and previous runtime-wiring evidence/audit files.
3. Read the readonly source/test targets and compare actual runtime wiring against the prior TDD claim.
4. Record findings in evidence and audit.
5. Seed a pending narrow TDD task only if the default runtime route still lacks organization-admin actor context wiring.
6. Run declared local validation and closeout readiness gates.

## Validation Commands

```powershell
npm.cmd exec -- prettier --write docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md
npm.cmd exec -- prettier --check docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck.md
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-readonly-recheck -SkipRemoteAheadCheck
```
