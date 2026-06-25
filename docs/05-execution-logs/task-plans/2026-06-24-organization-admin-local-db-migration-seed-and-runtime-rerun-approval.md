# Task Plan: organization-admin-local-db-migration-seed-and-runtime-rerun-approval-2026-06-24

## Scope

- Task id: `organization-admin-local-db-migration-seed-and-runtime-rerun-approval-2026-06-24`.
- Branch: `codex/org-admin-local-db-runtime-rerun-20260625`.
- Approval source: current user message on 2026-06-25 approving the next task with closeout.
- Goal: apply the already-reviewed local Drizzle migration and existing local dev seed, then rerun organization admin
  runtime acceptance on localhost for `org_standard_admin` and `org_advanced_admin`.
- Non-goal: no source edit, migration edit, seed source edit, dependency edit, `.env*` edit/read/disclosure, Provider,
  Cost Calibration, staging/prod, payment, external service, PR, force push, or final standard/advanced MVP Pass.

## SSOT Read List

- `AGENTS.md`.
- `docs/03-standards/code-taste-ten-commandments.md`.
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`.
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`.
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`.
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`.
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`.
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`.
- `docs/04-agent-system/operating-manual.md`.
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`.
- `docs/04-agent-system/sop/task-lifecycle-governance.md`.
- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/01-requirements/00-index.md`.
- `docs/01-requirements/modules/01-user-auth.md`.
- `docs/01-requirements/modules/06-admin-ops.md`.
- `docs/01-requirements/advanced-edition/00-index.md`.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`.
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`.
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`.
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`.
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`.
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`.
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`.
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-role-persistence-schema-seed-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-workspace-runtime-regression-repair.md`.

## Requirement Mapping Result

| Requirement source                      | Task interpretation                                                                                                  |
| --------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| ADR-002 runtime architecture            | Runtime proof must use real local sessions and persisted role/account mapping, not source-only assertions.           |
| ADR-004/ADR-005 environment isolation   | Migration, seed, and browser observation are limited to the local development database and localhost browser target. |
| ADR-007 authorization SSOT              | Role identity comes from persisted admin role data; organization authorization/edition remains separate.             |
| 2026-06-24 role-separated MVP alignment | `org_standard_admin` and `org_advanced_admin` require distinct runtime workspace behavior from `ops_admin`.          |

## Role Mapping Result

| Role                 | Expected runtime behavior                                                                                 |
| -------------------- | --------------------------------------------------------------------------------------------------------- |
| `org_standard_admin` | Lands in organization workspace; may see standard organization admin summaries; no advanced AI/training.  |
| `org_advanced_admin` | Lands in organization workspace; may see enterprise training, analytics, AI question, and AI paper entry. |
| `ops_admin`          | Out of scope for this task; must not be used as a stand-in for organization admin rows.                   |

## Acceptance Mapping Result

- Local migration acceptance: existing reviewed migration applies locally without `drizzle-kit push` or destructive DB
  operations.
- Local seed acceptance: existing dev seed writes deterministic organization admin fixtures without exposing credential
  values in evidence.
- Runtime acceptance: owner-entered login proves `org_standard_admin` and `org_advanced_admin` route to organization
  workspace, enforce allow/deny boundaries, and expose visible Chinese UI labels.
- Non-acceptance: this task does not claim standard/advanced MVP final Pass and does not validate Provider, cost,
  staging/prod, payment, or external services.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`.
- `docs/04-agent-system/state/task-queue.yaml`.
- `docs/05-execution-logs/task-plans/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.
- `docs/05-execution-logs/evidence/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.
- `docs/05-execution-logs/audits-reviews/2026-06-24-organization-admin-local-db-migration-seed-and-runtime-rerun-approval.md`.

## Allowed Runtime And Database Scope

- Run local capability gates for `schemaMigration` and `localFullFlowGate`.
- Run `npx.cmd drizzle-kit migrate` against the already configured local development database.
- Run `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`.
- Observe only `http://127.0.0.1:3000` or `http://localhost:3000` browser routes.
- Owner manually enters credentials; Codex may navigate and observe visible UI but must not read credential documents,
  inspect cookies/storage, or type credential values.

## Blocked Scope

- Editing or disclosing `.env*`.
- Recording DB URLs, secrets, tokens, raw DB rows, password hashes, cookies, storage/session content, screenshots,
  traces, HTML dumps, Authorization headers, raw Provider payloads, raw prompts, or plaintext `redeem_code` values.
- `drizzle-kit push`, destructive database operations, staging/prod targets, Provider calls/configuration, Cost
  Calibration, payment/external services, dependency or lockfile changes, PR creation, force push, and final MVP Pass.

## Execution Steps

1. Format and validate the task packet.
2. Run local capability gates for schema migration and localhost-only full flow.
3. Execute the existing reviewed local migration.
4. Execute the existing local dev seed.
5. Ask the owner to manually log in as `org_standard_admin`, then observe workspace landing, route boundaries, and
   visible Chinese UI.
6. Ask the owner to manually log in as `org_advanced_admin`, then observe workspace landing, route boundaries, and
   visible Chinese UI.
7. Record redacted evidence and audit review.
8. Run closeout gates, commit, fast-forward merge to `master`, push `origin/master`, and delete the short branch.

## Stop Conditions

- Stop and record blocked if migration or seed fails.
- Stop and convert to a separate source repair task if either organization admin runtime row fails after migration/seed.
- Stop if browser validation would require Codex to read/enter credentials or inspect session storage/cookies.
- Stop if any command targets staging/prod, Provider, payment, external services, or requires `.env*` editing/disclosure.
