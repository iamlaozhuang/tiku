# Fresh Local Dev DB Validation Playbook

## Status

Active docs-only playbook.

## Purpose

Define the safe recovery path for future fresh local/dev DB validation work, especially AI scoring retry persistence and fresh DB e2e verification.

This playbook is not approval to read secrets, change environment files, connect to a database, run migrations, seed data, prepare validation data, execute e2e, call real providers, or perform destructive data operations. It defines the checklist a later approved task must follow.

## Non-Negotiable Boundaries

- `.env.local` is secret material. It may only be read or modified in a future task that explicitly approves secret-safe local/dev env handling. Evidence must never contain values, database URLs, tokens, credentials, headers, provider payloads, raw prompts, raw student answers, or raw model responses.
- `.env.example` must not be changed unless a separate approved task allows that exact file.
- Fresh DB validation must target `dev` only. `staging`, `prod`, cloud resources, deployment targets, external services, and real providers remain blocked unless separately approved.
- Reviewed migration uses the existing Drizzle migrate workflow only. `drizzle-kit push`, raw SQL, migration table repair, schema forcing, drop, truncate, reset, or other destructive operations are blocked by default.
- Seed/bootstrap may only run in a later task after approval, and only through existing repository mechanisms. Do not create or modify `scripts/**` as part of seed recovery unless a separate task approves script changes.
- Validation data prep may only run in a later task after approval, and only through local/dev APIs or existing local mechanisms with the minimum synthetic data required for the target verification.

## Fresh Local/Dev DB Target Confirmation

Before any future DB operation, the task must prove the target is safe without exposing secrets:

1. Confirm the task explicitly approves secret-safe `.env.local` handling and local/dev DB access.
2. Confirm the intended environment is `dev`, not `staging` or `prod`.
3. Confirm the target is fresh or disposable local/dev data by evidence that does not reveal a connection string, secret, or private data.
4. Confirm no destructive operation is needed to make the target fresh. If freshness requires drop, truncate, reset, delete, migration table repair, or raw SQL, stop and report a blocked gate.
5. Record only redacted, existence-level, or classification-level facts in evidence.

## Migration Rule

Future fresh local/dev DB verification may use reviewed migrations only when approved:

- Use the repository's existing Drizzle migrate path.
- Run from a clean branch or approved verification branch.
- Do not generate new migrations, edit schema, edit `drizzle/**`, or run `drizzle-kit push` unless a separate migration implementation task explicitly approves those files and actions.
- If migration fails due to drift, duplicate objects, missing migration metadata, or migration table repair needs, stop and report the blocked gate. Do not repair with raw SQL inside a verification task.

## Seed And Bootstrap Rule

Fresh empty DB e2e is not expected to pass until the required local/dev baseline data exists.

Seed/bootstrap is allowed only in a future approved task and must use existing local mechanisms. The task must record:

- approval scope and target environment classification;
- the mechanism used, without copying secrets or generated private data;
- whether the seed is idempotent;
- whether generated values are synthetic and safe for evidence;
- the exact validation command results, with secret-bearing output redacted or omitted.

If seed/bootstrap requires a new dependency, script change, schema change, raw SQL, destructive reset, or manual migration table repair, stop and report the relevant blocked gate.

## Validation Data Prep Rule

When later e2e or AI scoring retry persistence verification needs data beyond seed/bootstrap, prepare the smallest synthetic dataset through local/dev APIs or existing local mechanisms after approval.

Minimum data is task-dependent, but fresh DB e2e commonly needs:

- seed `user` accounts and sessions for the approved roles;
- business `paper` data with related `question`, `paper_section`, and `question_option` records where relevant;
- `mistake_book` records for student mistake-book flows;
- `ai_call_log` records or approved local/mock AI runtime actions for AI scoring retry persistence checks;
- any required `authorization`, `personal_auth`, `org_auth`, `organization`, or `employee` data for access-boundary flows.

Evidence may record counts, public identifiers when safe, route names, and pass/fail outcomes. Evidence must not record raw student answers, raw prompts, raw model responses, provider payloads, credentials, headers, or DB URLs.

## Fresh Empty DB E2E Prerequisites

A fresh empty DB is a migration target, not a complete product validation target. Before declaring fresh DB e2e readiness, a future task must confirm:

- reviewed migrations completed against the verified local/dev target;
- seed accounts exist for the roles used by e2e;
- required business `paper` and related content exist;
- `mistake_book` and `ai_call_log` prerequisites exist or are produced by approved local/mock flows;
- local/dev API validation data prep produced only the minimum synthetic data;
- no staging/prod/cloud/provider/external-service boundary was crossed.

If any prerequisite is missing and cannot be created through an approved safe mechanism, record the e2e as blocked or pending data prep. Do not treat the empty DB failure as a product regression without separating migration readiness from data readiness.

## Stop-And-Report Blocked Gates

Stop immediately and record a blocked gate if the work requires any of these:

- reading or changing `.env.local` without explicit secret-safe approval;
- modifying `.env.example`;
- package or lockfile changes;
- dependency changes;
- `scripts/**` changes;
- `src/**`, `tests/**`, `e2e/**`, `src/db/schema/**`, or `drizzle/**` changes outside an approved task;
- raw SQL;
- `drizzle-kit push`;
- drop, truncate, reset, delete, migration table repair, or other destructive data operation;
- staging, prod, cloud, deploy, real provider, or external service access;
- writing secrets, DB URLs, provider payloads, raw prompts, raw student answers, or raw model responses into evidence.

## Evidence Requirements

Every future task using this playbook must include:

- startup Git state, branch, master/origin alignment, local branches, and worktrees;
- allowedFiles and blockedFiles confirmation;
- target environment classification without secret values;
- command list and pass/fail/blocked results;
- explicit statement that `.env.local` values, DB URLs, credentials, provider payloads, raw prompts, raw student answers, and raw model responses were not recorded;
- residual gaps separated into migration readiness, seed/bootstrap readiness, validation data readiness, e2e readiness, and AI runtime readiness.
