# Record Org Auth Contract Security Merge Decision

**Date:** 2026-06-21
**Task id:** `record-org-auth-contract-security-merge-decision`
**Branch:** `codex/record-org-auth-contract-security-merge-decision`
**Status:** ready for closeout

## User Decision

The user selected option B for `org_auth` implementation sequencing:

- Merge contract design and security review preflight into one first package.
- Keep schema approval, migration, seed, database connection, service implementation, UI implementation, compatibility guard, and runtime verification as separate follow-up gates.
- This is a docs/state decision record only.

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
- `docs/02-architecture/interfaces/2026-06-21-org-auth-implementation-split.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- this task plan, evidence, and audit-review document.

Blocked work:

- Source, tests, schema, migration, seed, scripts, dependency files, package or lockfiles.
- Authorization runtime behavior, service/UI implementation, and database connection.
- Browser/dev-server/e2e runtime proof.
- `.env` or secret access.
- Provider calls, deploy, PR, force-push, payment, external service, or Cost Calibration Gate.

## Implementation Plan

1. Register a follow-up docs decision task in `task-queue.yaml` and `project-state.yaml`.
2. Add the option B decision to the discovered-issue closure batch approval decisions.
3. Update the org_auth implementation split document so the first package merges contract and security preflight.
4. Update the org_auth product decision follow-up packages to match the merged preflight path.
5. Run docs/static validation and Module Run v2 gates.
6. Update evidence and audit review before local commit.

## Risk Defense

- Keep schema approval independent and blocked.
- Keep cross-organization leakage, overlap, quota, cancellation, expiry, public identifier, and redaction risks in the merged preflight package.
- Do not create or approve runtime authorization behavior in this task.
- Keep evidence redacted and metadata-only.

## Validation Plan

- `git diff --check`
- Prettier check on changed docs/state files.
- Added-line unfinished-marker search.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId record-org-auth-contract-security-merge-decision`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId record-org-auth-contract-security-merge-decision -SkipRemoteAheadCheck`
