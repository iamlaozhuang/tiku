# Phase 11 Cloud Adapter Readiness Contract

## Status

Planning artifact. No cloud resource, object storage bucket, COS configuration, secret, environment variable, deployment, staging connection, or prod connection is created or changed by this document.

## Purpose

This contract defines how the new local file storage adapter, local text parser, and local mock RAG pipeline can later hand off to a reviewed object storage adapter and cloud vector/provider stack without blocking local development or weakening deployment boundaries.

The current local implementation is intentionally useful before cloud readiness:

- local file storage adapter writes to ignored `.runtime/uploads/dev/...`;
- local parser handles controlled `.txt` and `.md` files only;
- local mock RAG embedding is deterministic and provider-free;
- local evidence records metadata, hashes, counts, statuses, publicIds, and ignored runtime paths only when safe.

## Current External Readiness

Recorded on `2026-05-25` from user report:

- Domain `jiandingtiku.cn` has been applied for.
- DNS resolution is not configured.
- ICP filing is pending.
- Cloud server has not been purchased.
- Database service has not been purchased.
- Phase 11 staging implementation planning remains paused.

## Adapter Boundary

| Capability    | Local/dev now                                                                | Future staging/prod adapter                                                                                                                          | Required approval before implementation                                     |
| ------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| File storage  | `local file storage adapter` writes under ignored `.runtime/uploads/dev/...` | `object storage adapter` using approved bucket/prefix, likely COS or compatible storage                                                              | Cloud resource approval, bucket/prefix policy approval, env/secret approval |
| Object key    | `dev/paper-asset/{profession}/{yyyymm}/{hash}.{ext}`                         | `{environment}/{resource_type}/{profession}/{yyyymm}/{file_hash}.{extension}` with `staging` or `prod` prefix                                        | Object key contract approval                                                |
| Public access | none; no public URL                                                          | public URL only if product/security approve it, otherwise signed/private access                                                                      | Explicit public URL approval                                                |
| Parser        | `.txt` and `.md` only, no OCR                                                | cloud parser/OCR only after data handling and cost approval                                                                                          | OCR/parser approval, content handling approval                              |
| RAG embedding | deterministic `local_mock` only                                              | provider/vector adapter only after budget, model, log redaction, and quota approval                                                                  | Provider/vector approval                                                    |
| Evidence      | redacted metadata only                                                       | redacted metadata only; no secret, raw prompt, raw answer, raw model response, provider payload, full paper, textbook, OCR, or customer-like content | Evidence redaction approval                                                 |

## Required Cloud Adapter Interface

Any future object storage adapter must provide a small boundary compatible with the local adapter:

- `putObject(input)`: stores bytes and returns metadata.
- `getObject(input)`: reads bytes for server-side parser/indexing only.
- `deleteObject(input)`: removes an object when the owning `paper_asset` or `resource` is deleted or disabled.
- `createObjectKey(input)`: enforces `{environment}/{resource_type}/{profession}/{yyyymm}/{file_hash}.{extension}`.
- `toEvidenceSummary(input)`: returns redacted metadata without credentials, local absolute paths, signed URLs, Authorization headers, raw content, or provider payloads.

Required metadata:

- `environment`: `dev`, `staging`, or `prod`.
- `resourceType`: `paper-asset`, `material`, or `resource`.
- `profession`.
- `fileName`.
- `objectKey`.
- `contentType`.
- `fileSizeByte`.
- `fileHash`.
- `storageProvider`: `local`, `cos`, or a future approved adapter key.
- `accessMode`: `private`, `signed`, or `public` after explicit approval.

## Staging Preconditions

Before any staging implementation task starts, evidence must show:

- DNS and ICP readiness status has changed enough to support staging callback planning.
- Cloud server and database procurement status is approved.
- Object storage bucket or prefix policy is approved.
- Secret storage location is approved.
- Env var names and injection owner are approved.
- No `prod` bucket, prefix, database, auth secret, provider key, or public URL is reused.
- AI/provider budget, retry policy, and redaction policy are approved if provider calls are enabled.

## Prod Preconditions

Before any prod implementation or cutover task starts, evidence must show:

- staging adapter has passed local-to-staging acceptance;
- object storage access policy has been reviewed;
- backup/restore and delete behavior are documented;
- prod secret generation and rotation owner are approved;
- public URL behavior is approved or explicitly disabled;
- no staging data, secret, callback URL, or provider key is reused in prod.

## Non-Goals

- No COS console action.
- No object storage bucket or prefix creation.
- No public URL creation.
- No staging/prod connection.
- No deployment.
- No secret or env creation, reading, output, or mutation.
- No `.env.local` or `.env.example` change.
- No dependency, package, lockfile, schema, migration, script, or runtime source change.
- No real provider call.

## Next Implementation Gate

The local-first work can continue without blocking deployment because it is isolated under `dev` runtime storage and deterministic mock boundaries. Cloud implementation remains blocked until a future task has explicit human approval for:

- object storage adapter implementation;
- COS or compatible provider selection;
- staging env/secret injection;
- public URL policy;
- database and vector storage readiness;
- deployment target and rollback plan.
