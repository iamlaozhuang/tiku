# Acceptance Role Separated Account Seeded Local Or Owner Exclusion Scope Approval Plan

taskId: acceptance-role-separated-account-seeded-local-or-owner-exclusion-scope-approval-2026-06-23
status: closed
createdAt: "2026-06-23T06:55:40-07:00"
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
packageId: ROLE_SEPARATED_SEEDED_LOCAL_OR_OWNER_EXCLUSION_SCOPE_2026_06_23

## Purpose

Prepare an owner-facing approval package for the still-blocked role-separated account gate. The package asks laozhuang
to decide, role by role, whether the project should collect stronger seeded local account/runtime evidence, accept an
explicit MVP exclusion, or accept fixture-only/variance evidence for this acceptance phase.

This task prepares the package only. It does not approve or execute account creation, account disablement, credential
handling, database seed/write, schema migration, Provider, Cost Calibration, staging, production, payment, external
service, or final MVP Pass.

## Governance Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-06-23-role-separated-account-coverage-review.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-role-separated-account-coverage-review.md`

## Evidence Basis

- The coverage review keeps the role-separated account blocker `Blocked`.
- Eight mandatory rows remain unclosed: two partial-blocked learner rows and six blocked employee/admin/ops rows.
- Fixture evidence and a passing single-spec runtime run improve contract confidence, but they do not replace separated
  role runtime sessions unless laozhuang explicitly accepts that variance by role.
- No mandatory row has an implicit MVP exclusion.

## Package Design

The approval package should:

- list all eight mandatory role rows in plain language;
- state the recommended default for each row;
- provide explicit owner choices for seeded runtime evidence, fixture-only/variance acceptance, MVP exclusion, or keep
  blocked;
- keep account, credential, seed, database, env, Provider, staging, and final acceptance actions blocked;
- define the next task as a decision task that can record laozhuang's approved row-by-row scope, not execute the scope.

## Validation Plan

- Prepare the approval package under `docs/05-execution-logs/acceptance/`.
- Record evidence and audit review documents.
- Update `project-state.yaml` and `task-queue.yaml`.
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-role-separated-account-seeded-local-or-owner-exclusion-scope-approval-2026-06-23`

## Validation Result

The package is prepared and not yet approved for downstream execution. The next task remains blocked until laozhuang
explicitly approves `ROLE_SEPARATED_SEEDED_LOCAL_OR_OWNER_EXCLUSION_SCOPE_2026_06_23`.
