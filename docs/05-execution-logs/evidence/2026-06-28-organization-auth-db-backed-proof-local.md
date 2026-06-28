# Organization Auth DB-Backed Proof Local Evidence

## Summary

- Task id: `organization-auth-db-backed-proof-local-2026-06-28`
- Branch: `codex/org-auth-db-proof-20260628`
- Task kind: `local_db_read_only_authorization_proof`
- Result: `partial_blocked_by_local_schema_gap`
- Local validation level reached: `L3_local_repository_read_only_partial`
- Local DB target label: Docker Compose PostgreSQL service `tiku-postgres` / container `tiku-postgres-dev`
- Cost Calibration Gate remains blocked.
- Release readiness and final Pass are not claimed.

## Approval Boundary

Current user approved a separate local DB-backed organization authorization proof for `org_standard_admin` and `org_advanced_admin`, limited to an explicitly named local test-owned or approved local dev target. Evidence may record only roles, routes/services, statuses, counts, and redacted results.

## Requirement Mapping Result

- Mapping result: `local_db_read_only_authorization_proof`.
- ADR-007 and edition-aware authorization requirements require source `org_auth`, `edition`, `auth_upgrade`, and service-computed `effectiveEdition`.
- This proof checks whether the current local DB target can support that distinction for organization admins.

## Changed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/task-plans/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/acceptance/2026-06-28-organization-auth-db-backed-proof-local.md`

## Read-Only DB Proof

The DB proof command ran inside a read-only transaction against the named local target.

| Probe                                         | Redacted result         |
| --------------------------------------------- | ----------------------- |
| local DB target                               | pass named local target |
| `org_auth` table exists                       | true                    |
| `org_auth.edition` exists                     | false                   |
| `auth_upgrade` table exists                   | false                   |
| active `org_standard_admin` count             | 1                       |
| active `org_advanced_admin` count             | 1                       |
| `org_standard_admin` organization link count  | 1                       |
| `org_advanced_admin` organization link count  | 1                       |
| `org_standard_admin` linked active `org_auth` | 1                       |
| `org_advanced_admin` linked active `org_auth` | 1                       |
| `employee` link count                         | 0                       |

DB proof conclusion:

- The local DB target proves organization admin role rows, organization links, and `org_auth` status linkage exist.
- The local DB target does not prove standard/advanced `org_auth` source edition or `auth_upgrade`, because the current DB schema lacks those structures.
- Therefore the DB-backed organization authorization proof is partial and blocked by local schema/target gap.

## Focused Unit/Service Validation

Command:

```text
npm.cmd run test:unit -- src/server/services/edition-aware-authorization-service.test.ts src/server/services/effective-authorization-service.test.ts src/server/repositories/edition-aware-authorization-repository.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts
```

Result:

- Test files: 4 passed.
- Tests: 17 passed.

Service proof conclusion:

- Source-level services and contracts cover direct advanced `org_auth`, active `auth_upgrade`, fallback to standard, and organization workspace source contract behavior.
- This is a source/unit proof, not a DB-backed proof on the current local target.

## Forbidden-Action Checklist

| Action                                                  | Result           |
| ------------------------------------------------------- | ---------------- |
| Source/test/e2e modified                                | pass_not_touched |
| Schema/migration/seed modified or executed              | pass_not_touched |
| Package or lockfile changed                             | pass_not_touched |
| `.env*` changed or secret/connection string recorded    | pass_not_touched |
| Destructive DB write                                    | pass_not_run     |
| Browser/dev-server/e2e run                              | pass_not_run     |
| Provider call/configuration                             | pass_not_run     |
| Cost Calibration execution                              | pass_not_run     |
| Staging/prod/deploy/payment/OCR/export/external service | pass_not_run     |
| PR or force push                                        | pass_not_done    |
| Release readiness or final Pass claimed                 | pass_not_claimed |

## Validation

| Command                            | Result                             |
| ---------------------------------- | ---------------------------------- |
| `docker compose ps --format json`  | pass                               |
| Read-only local DB proof command   | pass_partial_blocked_by_schema_gap |
| Focused unit/service validation    | pass                               |
| Scoped Prettier write              | pass                               |
| Scoped Prettier check              | pass                               |
| `git diff --check`                 | pass                               |
| `Get-TikuProjectStatus.ps1`        | pass_idle_no_pending_task          |
| Module Run v2 pre-commit hardening | pass                               |

Module Run v2 hardening result:

- Mode: `hard_block`.
- Files scanned: 7.
- Scope scan: pass, all changed files are in this task's `allowedFiles`.
- Requirement SSOT gate: advisory skip for task kind `local_db_read_only_authorization_proof`.
- Result: pass.

Project status diagnostic result after closing task state:

- `nextActionDecision`: `no_pending_task`.
- `recommendedAction`: `idle_no_pending_task`.
- `activeQueueNonTerminalCount`: 3.
- `archiveCandidateCount`: 3.
- Cost Calibration Gate remains blocked.

## Redaction Statement

Evidence records only local target labels, role labels, table/column existence booleans, status labels, counts, command names, and pass/fail summaries. It contains no credentials, connection strings, secrets, tokens, cookies, localStorage values, Authorization headers, raw DB rows, internal ids, public id values, user email/phone values, organization names, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI output, plaintext `redeem_code`, employee subjective answers, or full `question`/`paper` content.

## Residual Gap

The next executable proof requires fresh approval for either:

- a schema/local dev DB alignment task that may introduce and apply the approved `edition`/`auth_upgrade` database structures; or
- a separate test-owned DB target that already contains those structures and safe test data.

This task does not approve that follow-up.
