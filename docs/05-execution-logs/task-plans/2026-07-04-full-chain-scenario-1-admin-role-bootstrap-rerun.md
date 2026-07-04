# 2026-07-04 Full-chain Scenario 1 Admin Role Bootstrap Rerun

## Task

- Task id: `full-chain-scenario-1-admin-role-bootstrap-rerun-2026-07-04`
- Branch: `codex/full-chain-scenario-1-admin-role-bootstrap-rerun-2026-07-04`
- Goal: rerun Scenario 1 after the governed admin-account creation repair, then prove `super_admin` creates `ops_admin` and `content_admin` through the product runtime flow.
- Preflight result: blocked before runtime because the required private account input mapping for the two scenario-created admin selectors is not complete.

## Approval And Boundary

- Approval source: `current_user_approved_full_chain_centralized_local_continuity_authorization_2026_07_04`.
- Covered in this task: Scenario 1 preflight, redacted private-input presence check, stop-on-fail, redacted evidence/audit, commit, fast-forward merge to `master`, push `origin/master`, delete merged short branch, and split provisioning task.
- Not executed in this task: dev server, browser, e2e, product login, DB connection, DB read/write, source/test change, schema/migration/seed, Provider, staging/prod/cloud/deploy/payment/external service, Cost Calibration, release readiness, final Pass, or production usability claim.

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

Full-chain Scenario 1 SSOT:

- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-goal-control-and-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-7-track-matrix.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-dependency-dag.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-isolated-db-account-plan.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-centralized-approval-and-continuity-addendum.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-1-admin-account-creation-flow-repair.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-1-admin-account-creation-flow-repair.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`

Runtime source and harness references:

- `src/app/(auth)/login/page.tsx`
- `src/app/(admin)/ops/users/page.tsx`
- `src/features/admin/content-admin-runtime.tsx`
- `e2e/credential-backed-8-role-local-acceptance.spec.ts`
- `e2e/local-full-loop-baseline-accounts-auth-db.spec.ts`

Private-input presence check:

- Bootstrap credential source: selector and required field presence only.
- Full-chain private account plan: selector and required field presence only.
- Prior role-separated local accounts file: structure-reference eligibility only.

## Preflight Method

1. Confirm current branch and worktree cleanliness.
2. Confirm Scenario 1 restart depends on the closed source repair.
3. Confirm bootstrap selector presence without printing account values.
4. Confirm `fc_ops_admin_created_by_super_admin` and `fc_content_admin_created_by_super_admin` have mapped private account inputs.
5. Stop before runtime if either target selector lacks required account input mapping.

## Block Decision

The required target selectors are present as plan labels, but the private account input mapping needed to create the two scenario-owned admin accounts is incomplete. The prior role-separated local account file remains structure reference only and is not accepted as an unmapped credential source.

## Next Task

- Split provisioning task: `full-chain-scenario-1-admin-input-provisioning-2026-07-04`.
- Provisioning task must map or create private account inputs outside the repository for:
  - `fc_ops_admin_created_by_super_admin`
  - `fc_content_admin_created_by_super_admin`
- Provisioning task must not write account values, phone numbers, passwords, emails, connection strings, tokens, sessions, cookies, raw DB rows, internal ids, or private fixture contents to repository evidence.

## Validation

- `npm.cmd exec -- prettier --write --ignore-unknown <changed governance files>`
- `npm.cmd exec -- prettier --check --ignore-unknown <changed governance files>`
- `git diff --check`
- `git diff --name-only -- <blocked paths>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-chain-scenario-1-admin-role-bootstrap-rerun-2026-07-04`

## Evidence Redaction

Evidence may record only task id, branch, route/surface label, selector label, role label, aggregate counts, command names, pass/fail/block, and redacted summary.

Evidence must not record account values, passwords, phone numbers, email addresses, connection strings, tokens, sessions, cookies, `localStorage`, Authorization headers, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payloads, raw prompts, raw AI I/O, full material/question/paper content, plaintext card values, or private fixture contents.
