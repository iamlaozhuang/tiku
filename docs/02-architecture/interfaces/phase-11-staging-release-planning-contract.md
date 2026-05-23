# Phase 11 Staging Release Planning Contract

## Status

Planning anchor for Phase 11.

## Purpose

Phase 11 defines the staging and release planning boundary after the Phase 10 local release candidate closeout.

This phase is intentionally planning-only unless later tasks receive explicit human approval. It prepares the decision surface for staging without creating cloud resources, connecting staging/prod systems, changing secrets, or deploying.

## Inputs

- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-10-local-release-candidate-contract.md`
- `docs/05-execution-logs/evidence/2026-05-23-phase-10-local-mvp-acceptance-rerun-closeout.md`
- Current MVP runtime, API, database, RAG, AI, audit, and local validation evidence.

## Environment Boundary

Phase 11 planning follows ADR-004:

- `dev`: local and developer-owned validation.
- `staging`: preview, owner acceptance, release-candidate validation, and deployment rehearsal.
- `prod`: real users and production data.

This planning task must not:

- create cloud resources;
- deploy to `staging` or `prod`;
- connect to staging or production databases;
- create object storage buckets or public object storage URLs;
- create, read, rotate, or commit staging/prod secrets;
- modify `.env.local`, `.env.example`, package files, lockfiles, runtime code, database schema, migrations, or deployment scripts;
- call real providers beyond already approved local `dev` smoke evidence;
- change production resources.

In evidence, this is recorded as: no cloud resources, no deployment, no staging/prod connection, no secret change, and human approval required before future implementation.

## Staging Design Checklist

Future staging implementation tasks must define and receive approval for:

- PostgreSQL instance or namespace, including pgvector support.
- Migration workflow, backup policy, rollback policy, and restore rehearsal.
- Auth base URL, callback URL, and staging-only `BETTER_AUTH_SECRET`.
- Object storage bucket or strict prefix using the `staging` environment prefix.
- AI provider feature flags, quota limits, allowed models, request limits, and failure handling.
- Audit log and `ai_call_log` retention policy.
- Deployment domain and TLS ownership.
- Seed/reset policy and explicit restrictions on production data import.
- Admin access model and owner acceptance account process.
- Evidence redaction rules for real content, provider calls, logs, and screenshots.
- Monitoring and incident rollback ownership.

## Production Readiness Checklist

Future prod planning must remain separate from staging planning and must define:

- production-only database and object storage;
- production-only secrets and provider credentials;
- migration approval, backup, and rollback runbooks;
- data retention and deletion policy;
- operational monitoring and alerting;
- access control and audit review process;
- incident response owner and escalation path;
- release promotion criteria from staging to prod.

No production implementation is approved by this Phase 11 planning task.

## Required Human Approvals

Separate explicit human approval is required before any future task that:

- provisions cloud resources;
- modifies cloud resources;
- deploys application code;
- adds, deletes, or changes secrets or environment variables;
- changes `.env.example`;
- adds dependencies or changes lockfiles;
- changes database schema or migrations;
- connects local code to staging/prod;
- imports real customer/customer-like data;
- enables real provider quota outside local `dev`;
- creates public object storage URLs.

The approval evidence must be written into the relevant task plan and evidence before implementation.

## Proposed Phase 11 Task Ordering

1. `phase-11-staging-release-planning`
2. `phase-11-staging-architecture-adr`
3. `phase-11-staging-resource-plan`
4. `phase-11-staging-secret-and-env-plan`
5. `phase-11-staging-migration-and-rollback-plan`
6. `phase-11-staging-provider-and-observability-plan`
7. `phase-11-staging-deployment-dry-run-plan`
8. `phase-11-staging-implementation-approval-gate`

Tasks after this planning task should remain unstarted until their specific allowed files, risk gates, and human approvals are recorded.

## Validation Expectations

Every Phase 11 planning task must include:

- task plan before implementation;
- evidence under `docs/05-execution-logs/evidence/`;
- `Test-TaskClaimReadiness.ps1`;
- `Test-AgentSystemReadiness.ps1`;
- `Invoke-QualityGate.ps1`;
- `Test-NamingConventions.ps1`;
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`;
- explicit statement that no cloud resources, no deployment, no staging/prod connection, and no secret changes occurred.

Runtime, deployment, migration, or cloud implementation tasks must add extra validation and approval gates appropriate to their risk.

## Non-Goals

- No staging/prod deployment.
- No cloud provisioning.
- No production release.
- No staging/prod credentials.
- No database migration or schema change.
- No dependency change.
- No object storage bucket or public URL.
- No WeChat mini program release track implementation.
- No customer-network acceptance claim.

## Exit Criteria

This planning task can close when:

- the Phase 11 contract exists;
- roadmap and queue state point to Phase 11 planning;
- evidence records the planning-only boundary and validation results;
- repository gates pass;
- next implementation action is explicitly blocked on future human approval.
