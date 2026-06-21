# Record Enterprise Training Admin First Decision

**Date:** 2026-06-21
**Task id:** `record-enterprise-training-admin-first-decision`
**Branch:** `codex/record-enterprise-training-admin-first-decision`
**Status:** ready for closeout

## User Decision

The user selected option B for advanced enterprise and employee training path closure:

- A later separately scoped org_admin `organization_training` content-management local implementation candidate may be considered first.
- Employee training answer flow, employee privacy, organization analytics, Provider-backed generation, and runtime proof remain blocked.
- This is a docs/state decision record only and does not approve immediate source implementation.

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
- `docs/01-requirements/advanced-edition/2026-06-21-enterprise-training-path-closure-plan.md`
- this task plan, evidence, and audit-review document.

Blocked work:

- Source, tests, schema, migration, seed, scripts, dependency files, package or lockfiles.
- Employee answer flow, employee privacy implementation, organization analytics implementation, and runtime proof.
- `org_auth` runtime behavior changes.
- Browser/dev-server/e2e runtime proof.
- `.env` or secret access.
- Provider calls, database connection, deploy, PR, force-push, payment, external service, or Cost Calibration Gate.

## Implementation Plan

1. Register a follow-up docs decision task in `task-queue.yaml` and `project-state.yaml`.
2. Add the option B decision to the discovered-issue closure batch approval decisions.
3. Update the enterprise training path closure plan so org_admin content management is the first local implementation candidate.
4. Preserve blockers for employee training, analytics, Provider, runtime proof, schema, database, and org_auth runtime changes.
5. Run docs/static validation and Module Run v2 gates.
6. Update evidence and audit review before local commit.

## Risk Defense

- Do not seed or modify source implementation in this decision-record task.
- Keep runtime closure blocked.
- Preserve organization_training separation from formal `question`, `paper`, `practice`, and `mock_exam`.
- Keep employee answer text and analytics behind privacy review.

## Validation Plan

- `git diff --check`
- Prettier check on changed docs/state files.
- Added-line unfinished-marker search.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId record-enterprise-training-admin-first-decision`
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId record-enterprise-training-admin-first-decision -SkipRemoteAheadCheck`
