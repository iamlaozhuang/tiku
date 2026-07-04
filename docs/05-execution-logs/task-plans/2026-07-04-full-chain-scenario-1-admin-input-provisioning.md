# 2026-07-04 Full-chain Scenario 1 Admin Input Provisioning

## Task

- Task id: `full-chain-scenario-1-admin-input-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-1-admin-input-provisioning-2026-07-04`
- Goal: provision warehouse-external private account inputs for Scenario 1 `ops_admin` and `content_admin` creation.
- Restart point: after closeout, rerun Scenario 1 from the affected private-input node.

## Approval And Boundary

- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`.
- Covered: local private input generation or mapping outside the repository, selector-scoped field-presence verification, redacted evidence/audit, commit, fast-forward merge to `master`, push `origin/master`, delete merged short branch, and Scenario 1 affected-node rerun.
- Not covered: repository secret values, dev server, browser, e2e, DB connection, DB read/write, source/test change, schema/migration/seed, Provider, staging/prod/cloud/deploy/payment/external service, Cost Calibration, release readiness, final Pass, or production usability claim.

## Read Gate

Governance and architecture:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Full-chain and provisioning SSOT:

- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-role-bootstrap-rerun.md`

Private structure read:

- `full-chain-isolated-db-account-plan-2026-07-04` structure and selector presence only.
- `full-chain-isolated-db-bootstrap-super-admin-credential-2026-07-04` selector/field-presence only.
- `role-separated-local-accounts-2026-06-23` structure-reference eligibility only.

## Implementation Plan

1. Append or update a private Scenario 1 input section in the warehouse-external full-chain account plan.
2. Provide private values for `fc_ops_admin_created_by_super_admin` and `fc_content_admin_created_by_super_admin` only.
3. Ensure the target selectors have role label, display name, login identity, and secret fields present.
4. Check generated or mapped login identities for uniqueness within the known private selector set.
5. Output only redacted field-presence and collision count summaries.
6. Write repository evidence and audit with selector labels, role labels, counts, command labels, and pass/fail/block only.

## Validation

- `powershell.exe -NoProfile -Command "<private input provisioning script with redacted output>"`
- `powershell.exe -NoProfile -Command "<redacted private input field-presence verification>"`
- `npm.cmd exec -- prettier --write --ignore-unknown <changed governance files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed governance files>`
- `git diff --check`
- `git diff --name-only -- <blocked repo paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-1-admin-input-provisioning-2026-07-04`

## Stop Rules

Stop and split a new repair/provisioning task if provisioning requires repository secret values, DB mutation, schema/migration/seed, Provider/staging/prod/Cost, source/test repair, dependency/lockfile change, permission weakening, repository fixture expansion, or any evidence redaction risk.

## Evidence Redaction

Evidence may record only task id, branch, selector labels, role labels, field-presence counts, command names, pass/fail/block, and redacted summary.

Evidence must not record account values, passwords, phone numbers, email addresses, connection strings, tokens, sessions, cookies, `localStorage`, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw prompts, raw AI I/O, full material/question/paper content, plaintext card values, or private fixture contents.
