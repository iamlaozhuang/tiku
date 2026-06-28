# Organization Auth DB-Backed Proof Local

## Task

- Task id: `organization-auth-db-backed-proof-local-2026-06-28`
- Branch: `codex/org-auth-db-proof-20260628`
- Task kind: `local_db_read_only_authorization_proof`
- Execution profile: `local_dev_db_read_only_redacted_proof`
- Approval source: current user approval on 2026-06-28 for a separate local DB-backed organization authorization proof.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-28-high-risk-gate-decision-approval-package-after-organization-workspace-ux.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Source Read-Only Context

- `package.json`
- `src/server/services/effective-authorization-service.ts`
- `src/server/repositories/effective-authorization-repository.ts`
- `src/server/services/edition-aware-authorization-service.ts`
- `src/server/repositories/edition-aware-authorization-repository.ts`
- `src/server/services/organization-auth-service.ts`
- `src/server/repositories/organization-auth-repository.ts`

## Requirement Decision Map

- ADR-007: source `edition` and `auth_upgrade` are source-of-truth inputs; `effectiveEdition` is service-computed and must not be inferred from UI visibility.
- Edition-aware authorization requirements: active `org_auth` may be standard or advanced; active standard `org_auth` can become advanced through governed `auth_upgrade`.
- Role-separated alignment: `org_standard_admin` and `org_advanced_admin` must be organization-scoped roles with different allowed organization workspace capabilities.
- High-risk gate package Option A: DB-backed authorization proof is now approved only for a clearly named local target and redacted evidence.

## Requirement Mapping

- Mapping result: `local_db_read_only_authorization_proof`.
- This task proves whether local dev DB data and service/repository authorization calculation distinguish standard and advanced organization authorization contexts.
- This task does not prove staging/prod, Provider, Cost Calibration, payment, OCR, export, external service, release readiness, or final Pass.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-high-risk-gate-decision-approval-package-after-organization-workspace-ux.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-high-risk-gate-decision-approval-package-after-organization-workspace-ux.md`

## Conflict Check

- No requirement conflict found for the task boundary.
- Local UX evidence is not sufficient for authorization closure; this task adds only local DB-backed proof.
- DB access is limited to the named local Docker Compose PostgreSQL service `tiku-postgres` / container `tiku-postgres-dev`.
- If the local DB proof requires schema changes, seeds, destructive operations, `.env*` output, browser runtime, Provider, Cost Calibration, staging/prod, or external-service work, stop and record a blocker.

## Scope

Allowed file changes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/task-plans/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-auth-db-backed-proof-local.md`

Read-only runtime/code inspection:

- source, tests, e2e, and scripts may be read to understand service/repository contracts, but must not be changed.

Approved runtime:

- read-only connection/query against the local Docker Compose PostgreSQL target `tiku-postgres` / `tiku-postgres-dev`;
- service/repository validation if it can run locally without DB writes, browser, dev server, e2e, schema, migration, seed, Provider, Cost Calibration, or external-service calls.

Blocked files and actions:

- source, tests, e2e, scripts, schema, drizzle, migration, seed edits;
- `package.json`, lockfiles, `.env*` edits or secret output;
- destructive DB writes, schema writes, migrations, seeds, `drizzle-kit push`;
- browser, dev server, e2e;
- Provider call or configuration;
- Cost Calibration;
- staging/prod/deploy, payment, OCR, export, external service;
- PR, force push, release readiness, final Pass.

## Implementation Approach

1. Register the task in queue/state after this plan exists.
2. Locate the local DB-backed authorization query path and verify the local DB target without printing secrets.
3. Execute read-only DB probes that summarize counts and status by role/edition/source only.
4. If service/repository read-only validation is available without writes, run the focused unit/service command and record only pass/fail and counts.
5. Write redacted traceability, evidence, audit review, and acceptance.
6. Run scoped Prettier, `git diff --check`, `Get-TikuProjectStatus.ps1`, and Module Run v2 pre-commit hardening.
7. Local commit may be prepared if all gates pass; merge/push/cleanup are not approved by this task and must wait for fresh approval.

## Evidence Redaction

Evidence may record:

- role labels;
- route or service labels;
- local target label;
- status labels;
- row counts;
- pass/fail summaries;
- blocked residual gaps.

Evidence must not record:

- credentials, connection strings, secrets, tokens, cookies, localStorage values, Authorization headers;
- raw DB rows, internal ids, public id values, user email/phone, organization names, raw DOM, screenshots, traces;
- Provider payloads, prompts, raw AI output;
- plaintext `redeem_code`, employee subjective answers, or full `question`/`paper` content.

## Validation Commands

- `docker compose ps --format json`
- redacted read-only local DB proof command against `tiku-postgres`
- optional focused unit/service command if no DB write/browser/provider scope is required
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-auth-db-backed-proof-local-2026-06-28`

## Stop Conditions

- Local DB target is not clearly named or healthy.
- DB proof requires writes, seed, migration, schema change, destructive query, or raw row evidence.
- DB access requires printing a connection string or secret.
- Service validation requires browser/dev-server/e2e, Provider, Cost Calibration, staging/prod, payment, OCR, export, or external-service work.
- Changed files exceed docs/state/evidence scope.
