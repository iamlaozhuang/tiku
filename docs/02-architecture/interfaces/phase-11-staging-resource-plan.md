# Phase 11 Staging Resource Plan

## Status

Planning artifact. No resource provisioning is approved by this document.

## Purpose

This plan turns the Phase 11 staging architecture boundary into a reviewable resource inventory. It defines what future `staging` resources must exist before a deployment rehearsal, while keeping implementation blocked until a later task receives explicit human approval.

This task does not create cloud resources, connect to `staging` or `prod`, read or change secrets, deploy application code, change dependencies, modify schema or migrations, or call real providers.

## Required Inputs

- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-11-staging-release-planning-contract.md`
- Latest local acceptance evidence under `docs/05-execution-logs/evidence/`

## Resource Inventory

| Resource category                 | Recommended staging shape                                                                               | Isolation requirement                                                                                                                      | Future approval before implementation                                          |
| --------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Application runtime               | One staging deployment target for the Next.js web app                                                   | Separate domain, callback origin, environment variables, logs, and release gate from `prod`                                                | Deploy approval, domain ownership approval, env approval                       |
| PostgreSQL and pgvector           | Dedicated staging PostgreSQL instance, or an explicitly isolated database namespace if cost requires it | No production clone by default; no shared writable database with `prod`; pgvector enabled before RAG acceptance                            | Cloud resource approval, migration approval, backup/restore approval           |
| Object storage                    | Dedicated staging bucket preferred; strict `staging/` prefix acceptable only with bucket policy review  | Object keys follow `{environment}/{resource_type}/{profession}/{yyyymm}/{file_hash}.{extension}` and never reuse a writable `prod/` prefix | Cloud resource approval, bucket policy approval, public URL approval if needed |
| Authentication                    | Staging-only base URL, callback URL, and `BETTER_AUTH_SECRET`                                           | No shared auth secret, callback URL, session store, or admin account credential with `prod`                                                | Secret/env approval and owner account approval                                 |
| AI provider controls              | Provider disabled by default or limited by staging-only quota, model allowlist, and request budget      | No production provider key; no raw prompt, raw answer, raw model response, or provider payload in evidence                                 | Provider quota approval and evidence redaction approval                        |
| Audit and `ai_call_log` retention | Staging retention window with safe review access for release acceptance                                 | No production logs copied into staging; no secrets, tokens, provider payloads, or raw customer-like content in retained evidence           | Retention policy approval                                                      |
| Seed and reset data               | Synthetic or reviewed test-only data with documented reset process                                      | No customer/customer-like private data; no full textbook, paper, OCR, raw prompt, or raw answer recorded                                   | Data handling approval before any real content import                          |
| Monitoring and incident ownership | Minimal staging health, error, build, database, and provider-failure signals                            | Separate from production alerting; no production incident claim based on staging only                                                      | Observability approval                                                         |

## Recommended Resource Sequence

1. Approve staging resource boundaries and ownership.
2. Define database instance or namespace, backup point, restore method, and pgvector enablement plan.
3. Define object storage bucket or prefix policy and object key convention.
4. Define auth domain, callback origin, and secret rotation ownership without recording secret values.
5. Define AI provider feature flags, quota caps, model allowlist, fallback behavior, and redaction rules.
6. Define seed/reset policy and allowed acceptance data classes.
7. Define monitoring, audit retention, and owner acceptance account process.
8. Only after the above are approved, create a separate implementation approval gate.

## Explicit Non-Goals

- No cloud resource creation or modification.
- No Tencent Cloud connection or console operation.
- No staging/prod database connection.
- No deployment.
- No secret/env creation, reading, rotation, or modification.
- No `.env.local` or `.env.example` change.
- No package, lockfile, runtime source, schema, migration, or script change.
- No real provider call.
- No production readiness or customer-network acceptance claim.

## Open Decisions For Future Tasks

- Whether staging uses a dedicated PostgreSQL instance or a cost-controlled isolated namespace.
- Whether object storage uses a dedicated bucket or strict prefix isolation.
- Whether AI provider calls are disabled by default for staging owner review or enabled under a small staging-only quota.
- Which owner account process is acceptable for staging acceptance without sharing production credentials.
- Which monitoring channel owns staging failures and rollback decisions.

## Current External Readiness Snapshot

Recorded on `2026-05-25` from user report:

- Domain: `jiandingtiku.cn`.
- Domain status: applied for.
- DNS resolution is not configured.
- ICP filing is pending.
- Cloud server: not purchased.
- Database services have not been purchased.

Planning impact:

- Do not start DNS cutover, callback verification, staging/prod deployment, cloud resource provisioning, database connection, object storage implementation, or real secret/env injection yet.
- The suitable next task remains planning-only `phase-11-staging-secret-and-env-plan`, because it can define names, owners, injection rules, placeholders, redaction boundaries, and approval gates without requiring purchased infrastructure.
- Update this snapshot when the domain filing, DNS, cloud server, or database status changes.

## Exit Criteria

This resource planning task can close when:

- this document exists and records the resource inventory;
- task queue and project state point to `phase-11-staging-resource-plan`;
- evidence records that no cloud, staging/prod, secret/env, deployment, dependency, schema, migration, script, or provider action occurred;
- validation gates pass;
- the next action is explicitly blocked on a future human approval gate.
