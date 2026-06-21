# 2026-06-21 Edition-Aware Authorization Schema Migration Approval Packet

## Purpose

Define the minimum task-level approval package required before any edition-aware authorization schema or migration work
may execute.

This document is not a schema implementation plan approval. It does not modify `src/db/schema/**`, create or edit
`drizzle/**`, run migrations, run `drizzle-kit generate`, read database rows, or access env/secret values.

## Current Read-Only Schema Context

Read-only inspection found the current authorization schema has:

- `redeem_code` with `public_id`, `code_hash`, `code_display`, `profession`, `level`, `duration_day`,
  `redeem_deadline_at`, `status`, `used_by_user_id`, `used_at`, and `generation_group_id`.
- `personal_auth` with a required `redeem_code_id`, `profession`, `level`, date range, and `status`.
- `org_auth` with organization purchaser, scope type, `profession`, `level`, account quota, date range, and `status`.
- No source authorization `edition` column on `personal_auth` or `org_auth`.
- No `redeem_code_type` or equivalent kind column on `redeem_code`.
- No `auth_upgrade` table.

## Candidate Future Schema Changes

A later schema execution task may propose these changes, subject to fresh approval:

1. Add an authorization edition model with first-release values `standard` and `advanced`.
2. Add source `edition` to `personal_auth` and `org_auth`, defaulting existing unversioned data to `standard`.
3. Add `redeem_code_type` to `redeem_code` with first-release values:
   - `personal_standard_activation`;
   - `personal_advanced_activation`;
   - `edition_upgrade`.
4. Add an `auth_upgrade` table that records standard-to-advanced upgrades without overwriting source authorization.
5. Link personal upgrades to `personal_auth`; link organization manual upgrades to `org_auth`.
6. Preserve audit and operations metadata without storing plaintext `redeem_code`, raw row dumps, provider payloads, raw
   prompts, raw generated AI content, or secret material in evidence.

## Candidate `auth_upgrade` Boundary

The future `auth_upgrade` schema should be reviewed for these columns or equivalent normalized fields:

- `id`, `public_id`;
- source authorization discriminator and source id, constrained so exactly one source authorization is targeted;
- `target_edition`, initially only `advanced`;
- `source_type`, with first-release sources such as `redeem_code` and `ops_manual`;
- nullable `redeem_code_id` for personal `edition_upgrade`;
- nullable operations metadata for organization manual upgrade, such as external reference, operations note, operator,
  and audit reference;
- `starts_at`, `expires_at`, `revoked_at`, `revoked_by_admin_id`, `status`;
- `created_at`, `updated_at`.

Exact column names, enum names, indexes, uniqueness constraints, and foreign-key policies must be finalized in the
future schema execution task before edits.

## Required Future Fresh Approval

Before schema execution, the user must explicitly approve a task that names:

- exact branch name;
- exact allowed files including `src/db/schema/auth.ts`, relevant schema tests, generated `drizzle/**` files, and task
  evidence/audit files;
- exact blocked files;
- whether `auth_upgrade` references `audit_log` by internal id, public id, or both;
- migration file naming and rollback expectation;
- whether local Docker database migration execution is allowed;
- command list, including capability gate, focused schema tests, `drizzle-kit generate`, `lint`, `typecheck`,
  `git diff --check`, hardening, and closeout readiness;
- redacted evidence boundary;
- stop conditions.

## Future Validation Commands

These commands are approved as the expected validation surface only after future schema execution approval:

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2LocalCapabilityGate.ps1 -TaskId edition-aware-authorization-schema-migration-approval-packet -Capability schemaMigration -Intent use_capability`
- `npm.cmd run test:unit -- src/db/schema/auth.test.ts src/db/schema/system.test.ts`
- `npx.cmd drizzle-kit generate`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId edition-aware-authorization-schema-migration-approval-packet`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId edition-aware-authorization-schema-migration-approval-packet`

## Rollback Expectations

The future schema execution task must define rollback before editing schema:

- how to revert the TypeScript schema change;
- how to remove or supersede generated migration files before they are applied;
- how to stop if `drizzle-kit generate` produces unrelated drift;
- whether local migration execution is allowed and, if so, how local data is disposable and recoverable;
- why staging/prod rollback is out of scope unless separately approved.

## Explicit Non-Approval

This approval package does not approve:

- editing `src/db/schema/**`;
- creating or changing `drizzle/**`;
- running `drizzle-kit generate`;
- running migrations or database reads/writes;
- changing API, service, repository, UI, tests, e2e, scripts, dependencies, env files, provider configuration, payment,
  deployment, PR, force-push, destructive database, or Cost Calibration Gate.

Cost Calibration Gate remains blocked.
