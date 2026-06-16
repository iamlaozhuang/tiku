# Task Plan: advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision

## Scope

- Task id: `advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision`
- Branch: `codex/advanced-organization-training-visible-scope-source-decision`
- Task kind: docs-only boundary decision.
- Goal: decide the trusted source for organization-admin visible organization scope before repository-backed publish resolver implementation resumes.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/sop/docs-only-fast-lane-governance.md`
- `docs/05-execution-logs/evidence/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-module-run-v2-docs-only-fast-lane-mechanism.md`
- `docs/05-execution-logs/task-plans/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-16-advanced-organization-training-publish-version-route-visible-organization-scope-repository-resolver-tdd.md`
- `src/db/schema/auth.ts`
- `src/server/repositories/auth-repository.ts`
- `src/server/models/auth.ts`
- `src/server/services/session-service.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/repositories/organization-training-repository.ts`

## Current Facts

- `admin` has no organization foreign key or membership table.
- `organization` has hierarchy through `parent_organization_id`.
- `employee` maps ordinary users to organizations and is not a platform admin scope source.
- `org_auth_organization` validates authorization-to-organization lineage, not actor visibility.
- `adminPublicId` and `adminRoles` prove platform admin session shape only.
- Prior decisions reject deriving visible scope from request-body `organizationPublicId`.

## Decision Approach

Evaluate these candidates:

1. Existing organization hierarchy only.
2. Existing `org_auth_organization` or purchaser organization lineage.
3. New schema-backed admin-to-organization assignment plus existing organization hierarchy.
4. Separate repository contract without a new durable source.

Expected safe boundary:

- `adminPublicId` maps to `admin.public_id`.
- Platform admin role is a role gate only.
- Visible organization scope must come from a durable admin-to-organization assignment source independent of the publish request.
- The hierarchy can expand assigned root organizations to visible descendants.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision`

## Blocked Gates

- No `.env*` read, output, or edit.
- No product source or test implementation.
- No real DB command execution and no row/private data access.
- No schema/drizzle edits, migration generation, or migration execution in this task.
- No provider/model call, provider configuration, raw prompt, raw answer, provider payload, quota/cost measurement, or Cost Calibration Gate.
- No dependency/package/lockfile changes.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No PR or force push.
