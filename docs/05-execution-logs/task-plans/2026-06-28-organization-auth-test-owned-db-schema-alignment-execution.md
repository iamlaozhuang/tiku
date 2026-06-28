# Organization Auth Test-Owned DB Schema Alignment Execution Plan

## Task

- Task id: `organization-auth-test-owned-db-schema-alignment-execution-2026-06-28`
- Branch: `codex/org-auth-db-schema-alignment-20260628`
- Task kind: `local_dev_schema_alignment_execution`
- Approval: current user fresh approval on 2026-06-28 for one local test-owned or disposable local dev organization authorization DB/schema alignment execution task.

## Required Reading

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
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/repository-hygiene-closeout-checklist.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/04-agent-system/sop/advanced-edition-cost-calibration-blocked-gate.md`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/traceability/edition-aware-authorization-acceptance-matrix.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md`

## Requirement Decision Map

| Decision                     | Active rule for this execution                                                                                                       |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| ADR-007 source of truth      | Source authorizations store original `edition`; `effectiveEdition` is derived and must not overwrite source `edition`.               |
| Existing unversioned data    | Existing authorization without explicit `edition` is interpreted as `standard`; migration may record explicit default `standard`.    |
| Organization direct advanced | Direct `org_auth.edition = advanced` must evaluate as advanced while the source authorization is valid.                              |
| Organization upgrade         | Active `auth_upgrade` can elevate a standard `org_auth`; revoked or expired upgrade falls back to standard.                          |
| Scope boundary               | Multi-scope `org_auth_scope`, quota defaults, payment, Provider, Cost Calibration, staging/prod, and final Pass remain out of scope. |

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-auth-db-backed-proof-local.md`
- `docs/05-execution-logs/evidence/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md`
- `docs/05-execution-logs/audits-reviews/2026-06-28-organization-auth-test-owned-db-schema-alignment-planning.md`

These execution logs are history and blocker evidence only. Requirements are mapped through the SSOT files above.

## Conflict Check

No requirement conflict found. Requirements and ADRs require `org_auth.edition` and `auth_upgrade`; prior local DB evidence found the current local target missing both. The repository already contains the reviewed migration `drizzle/20260621024911_add_edition_aware_authorization.sql`, so this execution should prefer applying the existing migration to the named local dev/disposable target over generating a new migration unless inspection proves the reviewed migration cannot be used.

## Allowed Scope

- Update task/state/docs/evidence/audit/acceptance files for this task.
- Use existing reviewed migration files to align the explicitly named local dev/disposable target.
- Run redacted metadata/aggregate DB proof for table/column existence, role labels, route/service labels, status counts, and pass/fail summaries.
- Use a transaction-scoped, test-owned synthetic DB fixture for aggregate proof only when existing local data cannot prove direct advanced, active upgrade, and expired/revoked fallback. The transaction must end with `ROLLBACK`.
- Run focused unit/service tests for edition-aware authorization.
- Run scoped Prettier, `git diff --check`, `Get-TikuProjectStatus`, and Module Run v2 capability/pre-commit/pre-push gates.
- Commit locally, fast-forward merge to `master`, push `origin/master`, and clean up the short branch after gates pass.

## Blocked Scope

- No staging/prod/cloud/deploy.
- No Provider, Cost Calibration, payment, OCR, export, or external-service action.
- No PR and no force push.
- No release readiness or final Pass claim.
- No `drizzle-kit push`.
- No package, lockfile, or `.env*` changes.
- No shared or production-like destructive DB action.
- No browser, dev-server, or e2e runtime in this task.
- No evidence containing credentials, connection strings, secrets, tokens, cookies, localStorage, Authorization headers, raw DB rows, internal ids, public id lists, organization names, user email or phone, plaintext `redeem_code`, raw DOM, screenshots, traces, Provider payloads, prompts, raw AI output, employee subjective answers, or complete `question` or `paper` content.

## Implementation Approach

1. Record the task in `task-queue.yaml` and `project-state.yaml` with durable approval boundary and redaction rules.
2. Run a red metadata proof against the named local target to confirm the current gap or already-aligned state.
3. If the target still lacks `org_auth.edition` or `auth_upgrade`, apply the existing reviewed migration path for local dev/disposable DB only. Do not generate a new migration unless the reviewed migration is absent or invalid.
4. Run green metadata proof for `org_auth.edition`, `auth_upgrade`, and relevant enum/table/column existence.
5. Run a redacted aggregate behavior proof for organization authorization contexts: standard fallback, direct advanced, active upgrade advanced, expired/revoked upgrade fallback, and standard/advanced organization admin context counts. If a synthetic fixture is required, run it inside one transaction and roll it back after aggregate output.
6. Run focused unit/service tests that cover edition-aware effective authorization and organization source contract.
7. Write evidence, audit review, and acceptance notes with redacted summaries only.
8. Run quality gates and close out through approved local commit, fast-forward merge, push, and branch cleanup.

## Risk Defenses

- Target label only in evidence; no connection string or credentials.
- Use reviewed migration file; avoid raw ad hoc schema drift repairs.
- If migration application needs destructive repair, stop and record blocker.
- If any proof would need raw rows or private identifiers, stop and reduce to counts or booleans.
- Treat local validation as local only; do not claim staging/prod/provider/payment/release readiness.

## Validation Commands

- `docker compose ps --format json`
- redacted local DB metadata proof command
- local reviewed migration application command, only if red proof shows the gap still exists
- redacted local DB aggregate behavior proof command
- `npm.cmd run test:unit -- src/server/services/edition-aware-authorization-service.test.ts src/server/services/effective-authorization-service.test.ts src/server/repositories/edition-aware-authorization-repository.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId organization-auth-test-owned-db-schema-alignment-execution-2026-06-28 -Capability schemaMigration -Intent use_capability`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-auth-test-owned-db-schema-alignment-execution-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-auth-test-owned-db-schema-alignment-execution-2026-06-28 -SkipRemoteAheadCheck`

## Stop Conditions

- The target is not clearly local/dev/disposable.
- Migration requires `drizzle-kit push`, package changes, `.env*` changes, staging/prod access, or destructive repair on a shared target.
- Evidence would require sensitive values or raw rows.
- Focused tests or hard gates fail and cannot be fixed within allowed scope.
- Git state becomes ambiguous or includes unrelated changes.
