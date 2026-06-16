# Evidence: advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision`
- Task kind: docs-only boundary decision.
- Batch range: single fresh-approved docs-only boundary decision after
  `advanced-organization-training-publish-version-route-flow-readonly-recheck`.
- Branch: `codex/advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision`
- Baseline: `master == origin/master == 9f55ea73a176bc13772e85c0a9dee5dbf2a094a7`
- Commit: `9f55ea73a176bc13772e85c0a9dee5dbf2a094a7` accepted pre-closeout baseline; the local task
  commit will be recorded by Git history after closeout gates.
- Approval: current 2026-06-15 Codex thread, explicit user approval.
- localFullLoopGate: route unit test, scoped organization training unit tests, diff check, lint, typecheck,
  GitCompletionReadiness, PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to docs/state/evidence/audit.
- automationHandoffPolicy: continue only after clean fast-forward merge, push, short-branch deletion, fetch prune,
  and clean final git state.
- nextModuleRunCandidate: `advanced-organization-training-publish-version-route-org-admin-actor-boundary-readonly-audit`
- Cost Calibration Gate remains blocked.
- Result: pass_docs_only_boundary_decision_with_org_admin_actor_needs_recheck
- Next recommended task:
  `advanced-organization-training-publish-version-route-org-admin-actor-boundary-readonly-audit`

## RED / GREEN

RED: not applicable for this docs-only boundary decision. No runtime code was changed and no implementation test was
introduced.

GREEN: pass. This task only updates state, queue, task plan, evidence, and audit files.

## Readiness Gate

```powershell
git switch master
git fetch --prune origin
git status --short --branch
git rev-parse HEAD master origin/master
git branch --list "codex/*"
git branch -r --list "origin/codex/*"
```

Result: PASS before branch creation.

- `HEAD == master == origin/master == 9f55ea73a176bc13772e85c0a9dee5dbf2a094a7`.
- Worktree was clean.
- No local or remote `codex/*` branches were present.
- Short branch created:
  `codex/advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision`.

## Scope Reviewed

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- Prior route-flow evidence and audit for
  `advanced-organization-training-publish-version-route-flow-readonly-recheck`
- `src/app/api/v1/organization-trainings/[publicId]/publish/route.ts`
- `src/server/services/organization-training-route.ts`
- `src/server/services/organization-training-service.ts`
- `src/server/repositories/organization-training-repository.ts`
- `src/server/contracts/effective-authorization-contract.ts`
- `src/server/services/effective-authorization-service.ts`
- `src/server/repositories/effective-authorization-repository.ts`
- `src/server/services/student-authorization-redeem-runtime.ts`
- `src/server/repositories/student-authorization-redeem-runtime-repository.ts`
- `src/server/auth/session-cookie.ts`
- Representative session/user/admin route resolver patterns under `src/server/services`

## Boundary Decision

APPROVE the trusted lineage direction, but do not approve a direct runtime implementation yet.

The trusted lineage source belongs behind a dedicated server-side lineage resolver/repository boundary that is wired by
the runtime route helper. The App Route should stay thin. The route helper may own request parsing, path/body mismatch
blocking, redacted envelopes, and dependency wiring, but it must not accept internal numeric lineage from client input
and must not move persistence queries into the App Route file.

The future resolver may consume:

- authenticated session/user/admin context from existing server-side session utilities;
- public publish metadata already validated by the route/service boundary;
- repository-verified organization/auth scope rows resolved server-side.

The future resolver must not consume as authoritative:

- client-supplied numeric ids;
- public `capabilityContext` alone;
- effective authorization DTOs as a source for internal ids;
- UI state, query strings, or request body fields that are not rechecked against persistence.

## Current Source Evidence

- The publish App Route is a thin POST export that delegates to `createOrganizationTrainingRuntimeRouteHandlers`.
- `createOrganizationTrainingRouteHandlers` validates JSON, blocks path/body `draftPublicId` mismatch, calls
  `resolvePersistenceLineage`, and returns lineage-unavailable before invoking `publishVersion` when the resolver
  returns `null`.
- The default runtime resolver returns `null`, so the current runtime route stays intentionally lineage-blocked.
- `OrganizationTrainingService.publishVersion` requires positive internal `organizationId` and `orgAuthId` before
  passing the write payload to the store.
- `OrganizationTrainingPublishedVersionDto` and the mapper remain metadata-only and omit internal numeric lineage.
- Effective authorization contracts expose public authorization metadata/capabilities, not the internal
  organization/auth numeric lineage needed by the publish store.
- Existing student/effective authorization repository code can resolve org authorization rows from authenticated user
  context, but the public effective authorization DTO is intentionally not a lineage carrier.
- Existing admin/session patterns expose platform admin roles and session user context, but this docs-only pass did not
  find a narrow, already-proven organization-admin visible-scope primitive dedicated to organization training publish.

## needs_recheck

- Organization training requirements require an organization admin with valid `org_auth`.
- The trusted lineage boundary is clear, but the organization-admin actor and visible organization scope source is not
  yet narrow enough to implement a usable publish route without an additional readonly audit.
- A direct TDD implementation task is therefore not named in this closeout. The next task should first verify whether
  the current session/admin/auth contracts already provide a trustworthy organization-admin actor and visible
  organization scope source, or whether a separate actor-context contract decision is required.

## Follow-up Task Seeded

Seeded pending task:
`advanced-organization-training-publish-version-route-org-admin-actor-boundary-readonly-audit`.

That task remains docs-only and must run before any trusted-lineage resolver implementation task.

## Validation

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-route.test.ts"
```

Result: PASS. Vitest reported 1 file passed and 7 tests passed.

```powershell
npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/repositories/organization-training-repository.test.ts" "src/server/mappers/organization-training-mapper.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts" "src/db/schema/organization-training.test.ts"
```

Result: PASS. Vitest reported 6 files passed and 33 tests passed.

```powershell
git diff --check
```

Result: PASS.

```powershell
npm.cmd run lint
```

Result: PASS. ESLint completed successfully.

```powershell
npm.cmd run typecheck
```

Result: PASS. `tsc --noEmit` completed successfully.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: PASS. Git completion readiness inventory completed.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision
```

Result: PASS after evidence finalization rerun. Pre-commit hardening passed for the allowed docs/state/log files.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision
```

Result: PASS after evidence finalization rerun. Module closeout readiness passed.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-route-trusted-lineage-boundary-decision
```

Result: PASS after evidence finalization rerun. Pre-push readiness passed.

## Blocked Gates Preserved

- blocked remainder: runtime trusted-lineage implementation, organization-admin actor implementation, DB execution,
  provider/model work, browser/e2e/dev-server work, deploy/payment/external-service work, formal content write, and
  formal target write remain blocked.
- No environment file read/write/output.
- No DB access and no direct row/private data read.
- No migration generation, migration execution, schema/drizzle edits, or destructive database operation.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No package, lockfile, dependency, scripts, route runtime, service, repository, mapper, contract, model, validator, or UI implementation changes.
- No formal content write and no formal target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, command results, and redacted conclusions only. It does not record secret,
token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data, private data,
employee answer text, or public identifier value lists.
