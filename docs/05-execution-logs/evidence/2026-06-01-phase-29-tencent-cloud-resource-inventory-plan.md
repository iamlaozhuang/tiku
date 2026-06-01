# Phase 29 Tencent Cloud Resource Inventory Plan Evidence

## Summary

- Result: pass.
- Scope: docs_only procurement planning.
- Changed surfaces: evidence only.
- Gates: resource categories mapped; no cloud console, procurement, deploy, or external service call.
- Forbidden scope (`forbiddenScope`): no staging/prod/cloud/deploy action, no Tencent Cloud resource creation/change, no secret/env read/change, no DB connection, no provider call, no package/schema/script/code/test changes.
- Residual gaps (`residualGaps`): actual SKU selection, price confirmation, tenant/account binding, and procurement require human approval.

## Procurement Inventory Matrix

| Category                                   | Staging purpose                                                                                    | Minimum planning requirement                                                                                                                                    | Approval owner input                                                                                                    | Future acceptance signal                                                                                      | Blocked action                                                         |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| PostgreSQL/pgvector or equivalent database | Isolated staging data store for app, Better Auth sessions, Drizzle migrations, and RAG vector data | PostgreSQL 16+ compatible service or equivalent with pgvector support, network isolation, backup/restore, connection pool strategy, and staging-only credential | Technical owner confirms DB product, pgvector support, region, backup retention, connection ownership, and cost ceiling | Future approved dry run proves reviewed migrations apply, pgvector capability exists, and prod is untouched   | No database instance creation, no connection, no migration, no raw SQL |
| Object storage                             | Store staging `paper_asset`, materials, and future resource files                                  | Bucket or strict prefix using `staging/{resource_type}/{profession}/{yyyymm}/{file_hash}.{extension}`; private-by-default access; lifecycle/retention policy    | Storage owner confirms bucket/prefix isolation, access policy, retention, and cost                                      | Future approved dry run uploads only synthetic object through approved app path and records redacted metadata | No bucket creation/change, no object upload                            |
| Application deployment runtime             | Host Next.js staging app for owner acceptance                                                      | Runtime compatible with Next.js 15, Node version policy, environment variable injection, build command, health check, logs                                      | Deployment owner confirms service type, region, scaling floor/ceiling, rollback strategy, and runtime owner             | Future approved dry run deploys a release candidate and passes health checks                                  | No deploy, no service creation/change                                  |
| Domain/TLS/callback URL                    | Provide stable staging URL and auth callback origin                                                | Dedicated staging domain/subdomain, TLS certificate owner, Better Auth callback/base URL, allowed CORS/callback origin list                                     | Domain owner confirms DNS/TLS ownership and callback approval                                                           | Future approved dry run verifies HTTPS and auth redirect/callback against staging-only URL                    | No DNS/TLS/callback change                                             |
| Logs/monitoring/alerting                   | Observe staging errors, audit events, AI call status, and deployment health                        | App logs, deployment health, DB metrics, storage errors, auth failures, `audit_log`, `ai_call_log` status, alert owner                                          | Incident owner confirms alert channels, severity policy, retention, and redaction                                       | Future approved dry run records alert test or monitoring dashboard evidence without secrets                   | No monitoring integration or external alert setup                      |
| Backup/recovery                            | Protect staging rehearsal data and migration rollback point                                        | DB backup point before migration, object storage version/retention policy, restore owner, recovery time objective                                               | Recovery owner confirms restore method, rollback owner, and rehearsal policy                                            | Future approved dry run records backup point and restore/rollback decision evidence                           | No backup execution, restore, reset, or destructive operation          |
| Account and permission boundary            | Keep staging resources separated from prod and least-privilege                                     | Dedicated Tencent Cloud project/account boundary or resource group, least-privilege roles, billing owner, emergency disable owner                               | Security/ops owner confirms role map, MFA/owner list, and change approver                                               | Future approved dry run records role assignment existence without account IDs or secrets                      | No account creation, permission change, or key creation                |

## Cross-Cutting Decisions Needed Before Purchase

- Target Tencent Cloud region and latency expectation for owner acceptance.
- Whether database is managed PostgreSQL with pgvector support or an equivalent self-managed option.
- Whether object storage uses a dedicated bucket or strict staging prefix; prod sharing must be read/write isolated if a prefix is considered.
- Whether application runtime is a managed web runtime, container runtime, or VM-backed service; no decision here authorizes deployment.
- Log retention duration and evidence redaction policy for staging.
- Backup retention and rollback owner for migration rehearsal.
- Billing owner, budget ceiling, and kill-switch owner for staging resources.

## Gate Status

- `deploy-and-cloud-change`: remains blocked; this inventory is not approval to purchase or create resources.
- `secret-env-change`: remains blocked; no variables or secrets were read, written, or created.
- `destructive-data-operation`: remains blocked; backup/restore is planning only.
- `real-provider-staging-redaction`: remains blocked; no provider resource or quota is enabled.

## Evidence Hygiene

No Tencent Cloud account identifiers, console payloads, DB URLs, credentials, tokens, provider payloads, raw prompts, raw student answers, raw model responses, plaintext `redeem_code`, or customer/customer-like private data are recorded.
