# Task Plan: Admin Organization Visible Scope Repository Resolver Readonly Recheck

## Module Run V2 Anchors

- Task id: `advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-readonly-recheck`
- Branch: `codex/admin-organization-visible-scope-resolver-recheck`
- Baseline: `master == origin/master == 3fe4eee04cbb9cd08288f64b629cdeb0eed5271b`
- Task kind: `readonly_recheck`
- localFullLoopGate: `L1`
- Batch range: single readonly recheck; no docs-only fast lane batch id is used for this task.
- threadRolloverGate: not required; current thread has enough context to complete local closeout.
- automationHandoffPolicy: no automation handoff; close out in the current thread.
- Cost Calibration Gate remains blocked.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- Previous task plan/evidence/audit for `advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-tdd`
- Readonly source files named by the queued task.

## Scope

Review the closed TDD implementation for the `admin_organization`-backed visible organization scope resolver and runtime publish route wiring.

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- this task evidence
- this task audit review

Readonly surfaces:

- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/db/schema/auth.ts`

## Review Checklist

- Confirm route runtime resolver uses the repository-backed visible organization scope lookup.
- Confirm blank or missing admin public id fails closed without unnecessary repository queries.
- Confirm active `admin_organization` assignments are used as the trusted source for visible root organizations.
- Confirm visible organization scope expands active descendants and excludes inactive organizations.
- Confirm tests cover repository lookup, blank admin id behavior, route default resolver wiring, and fail-closed behavior.
- Confirm no product source, tests, scripts, schema/drizzle, package/lockfile, `.env*`, DB/provider/e2e/browser/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate work is performed.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-readonly-recheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-repository-resolver-readonly-recheck`

## Risk Controls

- `.env*` files are not read, summarized, output, or edited.
- No real DB command is executed and no row/private data is accessed.
- No provider/model call, quota/cost measurement, or Cost Calibration Gate execution.
- No dev server, Browser, Playwright, or e2e execution.
- No schema/drizzle, dependency, package, lockfile, source, test, script, deploy, payment, external-service, PR, or force-push work.
