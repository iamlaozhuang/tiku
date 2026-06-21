# Org Auth Schema Approval Package

**Date:** 2026-06-21
**Task id:** `org-auth-schema-approval-package`
**Branch:** `codex/org-auth-schema-approval-package`
**Status:** ready for closeout

## User Approval

The user selected option A for the next org_auth approval item: create a docs-only schema approval package for the future atomic scope child table.

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
- `docs/02-architecture/interfaces/2026-06-21-org-auth-scope-contract-security-preflight.md`
- `docs/02-architecture/interfaces/2026-06-21-org-auth-schema-approval-package.md`
- this task plan, evidence, and audit review.

Blocked work:

- Source, tests, schema source, migration, seed, scripts, dependency files, package or lockfiles.
- Database connection or data backfill.
- Authorization runtime behavior changes.
- Service/UI implementation.
- Browser/dev-server/e2e runtime proof.
- `.env` or secret access.
- Provider calls, deploy, PR, force-push, payment, external service, or Cost Calibration Gate.

## Implementation Plan

1. Register the approved docs-only schema package in `task-queue.yaml` and `project-state.yaml`.
2. Create a schema approval package documenting future `org_auth_scope` and `org_auth_scope_organization` table design.
3. Cross-link the package from the org_auth product decision, implementation split, and preflight documents.
4. Preserve all blocked boundaries for schema source edits, migrations, runtime, service/UI, database, Provider, and browser/e2e work.
5. Run docs/static validation and Module Run v2 gates.
6. Write evidence and audit review before local commit.

## Validation Plan

- `git diff --check`
- Prettier check on the nine scoped docs/state files.
- Added-line unfinished-marker search.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-auth-schema-approval-package`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId org-auth-schema-approval-package -SkipRemoteAheadCheck`
