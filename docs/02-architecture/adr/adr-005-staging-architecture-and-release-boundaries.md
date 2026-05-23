# ADR-005: Staging Architecture and Release Boundaries

## Status

Accepted

## Date

2026-05-23

## Related

- adr-001-tech-stack-selection.md
- adr-002-runtime-architecture-and-multi-client-contract.md
- adr-003-workplace-desktop-web-compatibility.md
- adr-004-environment-isolation-and-release-boundaries.md
- ../interfaces/phase-11-staging-release-planning-contract.md

## Context

Phase 10 closed the local release candidate hardening track. Phase 11 prepares the staging and release decision surface before any cloud, secret, deployment, provider, migration, or production work begins.

ADR-004 already defines the environment model:

```text
dev      local and developer-owned validation
staging  preview, owner acceptance, release-candidate validation, and deployment rehearsal
prod     real users and production data
```

The next decision needed is how staging is allowed to exist architecturally without accidentally becoming production, sharing production resources, or authorizing implementation work.

This ADR is planning-only. It creates no cloud resources, performs no deployment, connects to no staging/prod service, reads or changes no secret, and modifies no runtime, schema, migration, package, lockfile, script, or environment file.

## Decision

Tiku will treat `staging` as a release-candidate rehearsal environment with strict isolation from `prod`.

The `staging` architecture is approved only as a design boundary until a later task receives explicit human approval for implementation. Future implementation must keep these environment boundaries:

- `dev` remains local and developer-owned.
- `staging` is for preview, owner acceptance, deployment rehearsal, migration rehearsal, rollback rehearsal, and release-candidate validation.
- `prod` is for real users and production data only.

`staging` must not be promoted into production by changing configuration in place. Promotion from `staging` to `prod` is a release decision that requires a separate production plan, explicit human approval, and production-only resources.

## Resource Boundary

Future `staging` design tasks must define each resource category before provisioning:

- PostgreSQL database instance or namespace, including pgvector support and connection ownership.
- Object storage bucket or strict `staging` path prefix following `{environment}/{resource_type}/{profession}/{yyyymm}/{file_hash}.{extension}`.
- Auth base URL, callback URL, and staging-only `BETTER_AUTH_SECRET`.
- AI provider feature flags, quota limits, allowed models, request limits, fallback behavior, and disabled-by-default controls where cost or data exposure is a concern.
- Audit log and `ai_call_log` retention policy.
- Deployment domain, TLS ownership, and allowed callback origins.
- Admin access model, owner acceptance accounts, and reset/seed process.
- Monitoring signals, incident owner, rollback owner, and evidence redaction rules.

These categories are design inputs, not approvals to create resources.

## Data Boundary

`staging` must use separated data from `prod`.

Allowed data sources for `staging`:

- synthetic seed data;
- redacted sample metadata already allowed by evidence;
- manually reviewed acceptance data that contains no production secrets and no private customer/customer-like content;
- future imported content only after a task-specific plan records human approval and redaction requirements.

Forbidden data flows:

- no production database clone into `staging` without a separate approved data handling plan;
- no production object storage reuse through writable shared prefixes;
- no production provider payload, raw prompt, raw answer, raw model response, Authorization header, API key, secret, token, password, or database URL in evidence;
- no external URL that exposes auto-increment primary keys.

## Migration And Rollback Boundary

Before any `staging` migration task can run, a later plan must define:

- migration source branch and reviewed migration files;
- backup point, restore method, and owner;
- forward migration command and rollback decision point;
- restore rehearsal or rollback rehearsal evidence;
- drift check between reviewed schema and target database;
- rule that `drizzle-kit push` remains forbidden.

Before any `prod` migration task can run, a separate production plan must add production backup, restore, incident, and approval gates. `staging` migration success is necessary but not sufficient for `prod`.

## Deployment Boundary

Future `staging` deployment dry-run planning may define deployment topology, domain, health checks, and verification commands, but this ADR does not approve deployment.

Any future deployment task must record human approval before it:

- creates or modifies cloud resources;
- deploys application code;
- changes environment variables or secrets;
- connects local code to `staging` or `prod`;
- creates public object storage URLs;
- enables real provider quota outside approved local `dev` smoke evidence.

## Release Gates

`staging` can be considered a release-candidate gate only when future approved tasks provide evidence for:

- isolated staging resources;
- secret/env separation;
- migration and rollback rehearsal;
- provider quota and observability plan;
- sanitized logs and evidence;
- owner acceptance flow;
- git inventory showing only allowed task files;
- explicit statement that `prod` is untouched.

`prod` release remains out of scope until a separate production readiness contract is created.

## Non-Goals

- No cloud resources.
- No deployment.
- No staging/prod connection.
- No secret/env creation, reading, rotation, or modification.
- No `.env.local` or `.env.example` change.
- No dependency, package, lockfile, runtime, schema, migration, or script change.
- No provider call.
- No production readiness claim.
- No customer-network acceptance claim.

## Consequences

- Staging work is split into smaller planning tasks before implementation.
- Resource, secret, migration, provider, observability, deployment, and approval concerns remain independently reviewable.
- Production cannot be inferred from staging success.
- Future implementation tasks must carry narrower allowedFiles, blockedFiles, validation commands, and human approval evidence.
