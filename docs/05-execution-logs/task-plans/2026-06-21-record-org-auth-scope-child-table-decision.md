# Record Org Auth Scope Child Table Decision

**Date:** 2026-06-21
**Task id:** `record-org-auth-scope-child-table-decision`
**Branch:** `codex/record-org-auth-scope-child-table-decision`
**Status:** ready for closeout

## User Decision

The user selected option A for the `org_auth` schema-path approval discussion:

- Keep `org_auth` as the authorization bundle or purchase record.
- Use a reviewed atomic scope child table for future scoped authorization rows.
- Treat this as a planning decision only; do not implement schema, migration, seed, database access, contract/service/UI code, or runtime authorization changes.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Scope

Allowed edits:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/02-architecture/interfaces/2026-06-21-org-auth-implementation-split.md`
- this task plan, evidence, and audit-review document.

Blocked work:

- Source, tests, schema, migration, seed, scripts, dependency files, package or lockfiles.
- `.env` or secret access.
- Provider calls, prompt or provider payload exposure.
- Database connection, browser/dev-server/e2e runtime, deploy, PR, force-push, payment, external service, or Cost Calibration Gate.

## Implementation Plan

1. Register a follow-up docs decision task in `task-queue.yaml` and `project-state.yaml`.
2. Record the option A decision under the discovered-issue closure batch approval decisions.
3. Update the existing product decision document so future implementation uses the bundle plus atomic child-scope direction.
4. Update the implementation split document so schema work designs the selected child-scope-table path, while keeping all implementation gates blocked.
5. Run docs/static validation and Module Run v2 gates, then update evidence and audit review.

## Risk Defense

- Keep the decision text explicit that this is not schema approval.
- Use glossary terms `org_auth`, `organization`, `profession`, `level`, `subject`, `edition`, `quota`, and `audit_log`.
- Preserve ADR-002 layering: future code must still split route handlers, service, repository, model, contracts, validators, and mappers.
- Preserve ADR-004/005/006/007 boundaries for env, provider, deployment, dependency, schema, and edition-aware authorization.

## Validation Plan

- `git diff --check`
- Prettier check on changed docs/state files.
- Placeholder search for unfinished markers.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId record-org-auth-scope-child-table-decision`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId record-org-auth-scope-child-table-decision -SkipRemoteAheadCheck`
