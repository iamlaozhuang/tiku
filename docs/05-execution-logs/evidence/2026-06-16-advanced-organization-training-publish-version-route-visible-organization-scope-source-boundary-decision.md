# Evidence: advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision

## Module Run V2 Anchors

- Task id: `advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision`
- Branch: `codex/advanced-organization-training-visible-scope-source-decision`
- Head at evidence creation: `df19be75a64eabbd1f9c796b1b60e5167caa4f5e`
- Evidence created at: `2026-06-16T04:01:15-07:00`
- Task kind: docs-only boundary decision.
- Batch range: single docs-only boundary decision task; not a docs-only fast lane batch.
- localFullLoopGate: L1 docs-only boundary decision without real DB execution.
- threadRolloverGate: not required; current thread has enough context for this bounded task.
- automationHandoffPolicy: standing autonomy is materialized in this queued task; high-risk gates remain blocked.
- nextModuleRunCandidate:
  advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration
- nextTaskPolicy: seeded
- Cost Calibration Gate remains blocked.
- RED: PASS not applicable; this is a docs-only boundary decision with no production code or test edits.
- GREEN: PASS. Boundary decision recorded and next scoped schema task seeded; validation commands remain below.
- Commit: `df19be75a64eabbd1f9c796b1b60e5167caa4f5e` accepted baseline before this docs-only task; task commit follows
  this validation record.
- result: pass_docs_only_decision_schema_backed_admin_organization_scope_required

## Decision

Use a dedicated schema-backed `admin_organization` assignment source as the trusted root for organization-admin visible
organization scope.

The publish route visible organization scope resolver must not infer visibility from request body fields, platform admin
roles alone, ordinary employee organization linkage, or `org_auth_organization` authorization lineage.

## Boundary Rule

1. `adminPublicId` maps to `admin.public_id`; the admin row must be active.
2. Platform `admin_role` is a role gate only. It does not create organization visibility by itself.
3. `admin_organization` assignments link an admin to root organizations for organization-training publish visibility.
4. Existing `organization.parent_organization_id` hierarchy may expand assigned root organizations to active descendant
   organizations.
5. Missing admin assignment, inactive admin, inactive organization, or unresolved hierarchy must fail closed before
   trusted lineage lookup and before publish execution.
6. `org_auth_organization` remains the authorization lineage check after actor visibility is established; it is not an
   actor visibility source.

## Rejected Sources

- Request-body `publishInput.organizationPublicId`: rejected because it is the target being authorized, not proof of
  visibility.
- `adminRoles`: rejected as visibility source; roles prove platform admin shape only.
- `employee.organization_id`: rejected because employee linkage is ordinary user context, not platform admin scope.
- `org_auth_organization`: rejected as actor visibility source; it proves authorization-to-organization lineage only.
- Organization hierarchy alone: rejected because hierarchy can expand visibility only after a trusted assigned root
  organization is known.
- Repository contract without durable source: rejected because it would move the same missing-source problem behind an
  interface.

## Schema Source Shape For Next Task

- Table: `admin_organization`
- Required foreign keys: `admin_id -> admin.id`, `organization_id -> organization.id`
- Required uniqueness: one assignment per `(admin_id, organization_id)` pair.
- Required indexes: by `admin_id` and by `organization_id`.
- Public API exposure: none; do not expose numeric ids or assignment rows in external URLs.
- Runtime use: repository-backed resolver may read assignments and active organization hierarchy after the schema exists.

## Seeded Next Task

- `advanced-organization-training-publish-version-route-visible-organization-scope-admin-organization-schema-migration`

Purpose:

- Add the local schema/drizzle source for `admin_organization` assignments with schema tests and no real DB execution.

## Validation

Commands and results:

```powershell
git diff --check
```

- PASS.

```powershell
npm.cmd run lint
```

- PASS.

```powershell
npm.cmd run typecheck
```

- PASS.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

- PASS; inventory showed only this task's docs/state/plan/evidence/audit files changed.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision
```

- PASS; scope scan confirmed all 5 changed files match the task allowedFiles.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision
```

- PASS.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-visible-organization-scope-source-boundary-decision
```

- PASS; remote-ahead check was skipped because the short branch has no upstream, while `master` and `origin/master`
  remained aligned at `df19be75a64eabbd1f9c796b1b60e5167caa4f5e`.

## Blocked Gates Preserved

- No `.env*` read, output, or edit by the agent.
- No product source or test implementation.
- No schema/drizzle edits, migration generation, or migration execution in this task.
- No real DB command execution and no row/private data access.
- No provider/model call, provider configuration, raw prompt, raw answer, provider payload, quota/cost measurement, or
  Cost Calibration Gate.
- No dependency/package/lockfile changes.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service.
- No public identifier value list exposure beyond synthetic identifiers already present in docs/tests.
- No PR or force push.

## Taste Compliance Self-Check

- Standard API response: not applicable; no API/runtime code changed.
- Naming discipline: PASS; decision uses registered `admin`, `organization`, `org_auth`, and `authorization`
  terminology, with association table naming aligned to project convention.
- Public ID boundary: PASS; no real public identifier lists or internal row data are recorded.
- Layering: PASS; route/service/repository implementation remains blocked until the schema source exists.
- Dependency isolation: PASS; no package or lockfile changed.
- Schema and migration boundary: PASS for this task; schema changes are seeded into a separate scoped task.
- Evidence before conclusion: PASS; decision, next task policy, validation commands, and blocked gates are recorded before
  closeout.
