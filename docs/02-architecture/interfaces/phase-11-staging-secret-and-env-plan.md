# Phase 11 Staging Secret And Env Plan

## Status

Planning artifact. No secret or environment variable is created, read, rotated, injected, changed, or committed by this document.

## Purpose

This plan defines the `staging` secret and environment variable boundary needed before any future deployment rehearsal. It turns ADR-004, ADR-005, and the Phase 11 resource plan into a reviewable inventory of names, sensitivity, ownership, injection rules, redaction rules, and approval gates.

This task is intentionally planning-only. It does not modify `.env.local`, `.env.example`, package files, lockfiles, runtime source, schema, migrations, scripts, cloud resources, DNS records, or provider configuration. It does not connect to `staging` or `prod`.

## External Readiness Context

Current recorded state from `2026-05-25`:

- Domain: `jiandingtiku.cn`.
- DNS resolution is not configured.
- ICP filing is pending.
- Cloud server has not been purchased.
- Database services have not been purchased.

Planning consequence:

- URL values below are placeholders until DNS, ICP filing, and infrastructure purchase are complete.
- No callback URL, base URL, database URL, object storage credential, or provider key can be verified in this task.
- Future implementation must update this plan or write a new evidence record when any external prerequisite changes.

## Secret And Env Inventory

| Name                               | Environment              | Sensitivity                         | Planned source                                       | Injection target                     | Evidence rule                                                                       | Implementation approval required         |
| ---------------------------------- | ------------------------ | ----------------------------------- | ---------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------- |
| `APP_ENV`                          | `staging`, `prod`        | non-secret                          | Deployment config                                    | App runtime                          | May record enum only                                                                | Yes, before env creation                 |
| `APP_BASE_URL`                     | `staging`, `prod`        | non-secret but environment-critical | Approved domain and DNS plan                         | App runtime and auth callback config | May record hostname only after DNS approval                                         | Yes, before DNS/callback use             |
| `DATABASE_URL`                     | `staging`, `prod`        | secret                              | Managed database credential source                   | App runtime server only              | Never record value, host with credentials, username, password, or connection string | Yes, before database purchase/connection |
| `BETTER_AUTH_SECRET`               | `staging`, `prod`        | secret                              | Secret manager or controlled deployment secret store | App runtime server only              | Never record value or derived hash                                                  | Yes, before secret generation            |
| `OBJECT_STORAGE_BUCKET`            | `staging`, `prod`        | non-secret but resource-sensitive   | Approved object storage resource plan                | App runtime server only              | May record bucket alias after approval; do not record private endpoint credentials  | Yes, before bucket creation              |
| `OBJECT_STORAGE_PREFIX`            | `staging`, `prod`        | non-secret                          | Object storage boundary                              | App runtime server only              | May record `staging/` or `prod/` prefix                                             | Yes, before object storage use           |
| `OBJECT_STORAGE_REGION`            | `staging`, `prod`        | non-secret                          | Approved region decision                             | App runtime server only              | May record region after approval                                                    | Yes, before bucket creation              |
| `OBJECT_STORAGE_ACCESS_KEY_ID`     | `staging`, `prod`        | secret                              | Secret manager or controlled deployment secret store | App runtime server only              | Never record value                                                                  | Yes, before credential creation          |
| `OBJECT_STORAGE_SECRET_ACCESS_KEY` | `staging`, `prod`        | secret                              | Secret manager or controlled deployment secret store | App runtime server only              | Never record value                                                                  | Yes, before credential creation          |
| `AI_PROVIDER_ENABLED`              | `staging`, `prod`        | non-secret                          | Provider and observability plan                      | App runtime server only              | May record boolean policy                                                           | Yes, before enabling real quota          |
| `AI_PROVIDER_NAME`                 | `staging`, `prod`        | non-secret                          | Provider and observability plan                      | App runtime server only              | May record approved provider name                                                   | Yes, before enabling real provider       |
| `ALIBABA_API_KEY`                  | `staging`, `prod`        | secret                              | Secret manager or controlled deployment secret store | App runtime server only              | Never record value, raw provider payload, prompt, or model response                 | Yes, before provider quota use           |
| `OPENAI_API_KEY`                   | `staging`, `prod`        | secret                              | Secret manager or controlled deployment secret store | App runtime server only              | Never record value, raw provider payload, prompt, or model response                 | Yes, before provider quota use           |
| `AI_REQUEST_DAILY_BUDGET`          | `staging`, `prod`        | non-secret cost-control             | Provider and observability plan                      | App runtime server only              | May record numeric policy after approval                                            | Yes, before enabling real provider       |
| `AI_REQUEST_PER_USER_LIMIT`        | `staging`, `prod`        | non-secret cost-control             | Provider and observability plan                      | App runtime server only              | May record numeric policy after approval                                            | Yes, before enabling real provider       |
| `WECHAT_MINI_PROGRAM_APP_ID`       | future `staging`, `prod` | non-secret but release-sensitive    | Future mini program release plan                     | API/runtime config                   | Do not record until mini program task exists                                        | Separate future approval                 |
| `WECHAT_MINI_PROGRAM_API_BASE_URL` | future `staging`, `prod` | non-secret but release-sensitive    | Future mini program release plan                     | Mini program and API config          | Do not record until mini program task exists                                        | Separate future approval                 |

## Placeholder URL Rules

Until DNS resolution and ICP filing are complete, URL planning uses placeholders only:

- `APP_BASE_URL` for `staging`: planned placeholder `https://staging.jiandingtiku.cn`.
- `APP_BASE_URL` for `prod`: planned placeholder `https://jiandingtiku.cn`.

These placeholders are not DNS, TLS, callback, deployment, or acceptance evidence. Future tasks must verify domain ownership, DNS records, TLS certificate coverage, and auth callback configuration before using them.

## Ownership Model

| Area                       | Owner role                              | Required control                                                                                                   |
| -------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Domain and DNS             | Product owner or infrastructure owner   | Domain filing and DNS changes require explicit approval and evidence                                               |
| Deployment env injection   | Infrastructure owner                    | Values injected only through approved deployment runtime, not committed files                                      |
| Database credentials       | Infrastructure owner                    | Separate `staging` and `prod` credentials; no local reuse                                                          |
| Auth secret                | Infrastructure owner                    | Separate secret per environment; rotation owner recorded before implementation                                     |
| Object storage credentials | Infrastructure owner                    | Least-privilege credential per environment and prefix                                                              |
| AI provider keys and quota | Product owner plus infrastructure owner | Disabled by default unless quota, model allowlist, logging, and cost alerting are approved                         |
| Evidence redaction         | Release owner                           | No secret, raw provider payload, raw prompt, raw answer, raw model response, database URL, or Authorization header |

## Rotation And Rollback Requirements

Future implementation must define:

- who can create each secret;
- who can rotate each secret;
- where each value is stored;
- how a rotated value is deployed;
- how a failed rotation is rolled back;
- how old credentials are revoked;
- how evidence proves rotation without exposing values.

Minimum rotation triggers:

- suspected exposure;
- team member access change;
- provider key leak or quota abuse;
- deployment runtime compromise;
- promotion from staging implementation planning to production planning.

## Redaction Rules

Evidence may include:

- variable names;
- sensitivity class;
- owner role;
- environment name;
- placeholder hostname;
- boolean or numeric policy after approval.

Evidence must not include:

- secret values;
- API keys;
- tokens;
- Authorization headers;
- database connection strings;
- object storage access keys;
- auth secret values or hashes;
- raw provider payloads;
- raw prompts;
- raw answers;
- raw model responses;
- full paper, textbook, OCR, or customer/customer-like private content.

## Implementation Gate

Before any secret/env implementation task starts, evidence must show:

- DNS and ICP readiness status;
- cloud server and database procurement status;
- approved secret storage location;
- approved deployment runtime;
- approved callback URL list;
- approved database and object storage resource identifiers, with no credentials;
- approved AI provider budget and logging policy if provider calls are enabled;
- explicit human approval for secret/env creation or modification.

## Non-Goals

- No `.env.local` read or write.
- No `.env.example` change.
- No real secret generation.
- No deployment configuration change.
- No staging/prod connection.
- No cloud resource creation or modification.
- No provider call.
- No database migration or schema change.
- No package, lockfile, runtime source, or script change.

## Exit Criteria

This planning task can close when:

- the inventory above exists;
- task plan and evidence record the planning-only boundary;
- queue and project state point to `phase-11-staging-secret-and-env-plan`;
- validation gates pass;
- the next implementation step remains explicitly blocked on future human approval and external readiness updates.
