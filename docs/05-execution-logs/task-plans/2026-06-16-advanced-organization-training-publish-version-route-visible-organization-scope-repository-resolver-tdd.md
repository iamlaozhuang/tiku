# Task Plan: advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd

## Scope

- Task id: `advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd`
- Branch: `codex/advanced-organization-training-visible-scope-repository-resolver`
- Goal: add repository-backed visible organization scope resolver wiring for the organization-training publish route only if current source facts prove a safe resolver source.
- Guarded stop clause: if existing schema/repository facts are insufficient to define the resolver safely, stop and seed a docs-only boundary decision instead of guessing.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-readonly-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-resolver-contract-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-runtime-boundary-decision.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-decision.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-actor-contract-readonly-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-org-admin-context-runtime-wiring-readonly-recheck.md`
- `src/server/services/organization-training-route.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/services/organization-training-route.test.ts`
- `src/server/repositories/organization-training-repository.test.ts`
- `src/server/services/session-service.ts`
- `src/server/services/auth-service.ts`
- `src/server/repositories/auth-repository.ts`
- `src/server/models/auth.ts`
- `src/db/schema/auth.ts`

## Source Sufficiency Check

Before writing any production code or tests, confirm whether current source has a trusted source for:

1. `adminPublicId` to an organization-admin actor boundary.
2. organization-admin actor to visible organization public ids.
3. visible organization scope that is independent of `publishInput.organizationPublicId`.

Current findings:

- `admin` stores `public_id`, auth user linkage, phone, name, role, and status, but no organization binding.
- `organization` stores hierarchy through `parent_organization_id`, but no admin ownership or membership relation.
- `employee` maps ordinary users to one organization, not platform admins to visible organizations.
- `org_auth_organization` maps org authorization to organizations, but does not prove actor visibility.
- `AuthUserAccessRow` exposes `admin_public_id` and `admin_roles`, while employee organization metadata is separate.
- Prior boundary decisions explicitly reject deriving visible scope from platform admin roles plus requested organization public id.

## Decision

Do not implement a repository-backed visible organization scope resolver in this task. The current source is insufficient to define it safely without inventing an authorization model.

Close this task as a guarded stop and seed a docs-only boundary decision to decide the trusted visible organization scope source before repository implementation resumes.

## Validation Plan

- `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd`

## Blocked Gates

- No `.env*` read, output, or edit.
- No real DB command execution and no row/private data access.
- No product source/test implementation if source sufficiency fails.
- No schema/drizzle/migration changes.
- No model, mapper, validator, contract, or app route changes.
- No dependency/package/lockfile changes.
- No provider/model calls, provider configuration, raw prompt, raw answer, provider payload, quota/cost measurement, or Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No PR or force push.
