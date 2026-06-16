# Task Plan: advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd

## Scope

- Wire the existing organization-training repository `lookupTrustedPersistenceLineage` function into the default publish
  route runtime handler path.
- Add a focused red-first unit test in `src/server/services/organization-training-route.test.ts`.
- Keep implementation limited to `src/server/services/organization-training-route.ts`.
- Update only the task state, evidence, and audit records required for Module Run v2 closeout.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-repository-lookup-tdd.md`

## TDD Plan

1. RED: Add a focused test proving the default runtime route handler factory passes the Postgres repository trusted
   lineage lookup into `createOrganizationTrainingRouteHandlers`.
2. Verify RED with:
   `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts`.
3. GREEN: Make the minimal route wiring change so the runtime handler uses the repository lookup.
4. Verify GREEN with the same focused route unit test.
5. Run the declared validation commands and Module Run v2 readiness scripts.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd.md`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`

## Blocked Gates

- No `.env*` read, output, or edit.
- No real DB command execution and no row/private data access.
- No repository, schema/drizzle, mapper, contract, model, validator, app route, broad service, dependency, package, or
  lockfile change.
- No provider/model call, provider configuration, provider payload, raw prompt, or raw answer.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service work.
- No quota/cost measurement or Cost Calibration Gate.
- No PR and no force push.

## Validation Plan

```powershell
npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-runtime-wiring-tdd -SkipRemoteAheadCheck
```
