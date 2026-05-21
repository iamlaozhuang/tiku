# ADR-004: Environment Isolation and Release Boundaries

## Status

Accepted

## Date

2026-05-21

## Related

- adr-001-tech-stack-selection.md
- adr-002-runtime-architecture-and-multi-client-contract.md
- adr-003-workplace-desktop-web-compatibility.md

## Context

Tiku is developed as a Next.js and TypeScript monolith with PostgreSQL, pgvector, Drizzle ORM, Better Auth, and future Tencent Cloud deployment.

The project also expects a future WeChat Mini Program client. That client will consume stable REST API boundaries and will need different API endpoints and release tracks across development, preview, and production.

Local development is currently being established from a clean machine. The project needs an environment model before Tencent Cloud deployment so secrets, databases, object storage, authentication callbacks, AI provider usage, audit logs, and future mini program configuration do not leak across stages.

## Decision

Tiku will use three isolated environments:

```text
dev      local and developer-owned development
staging  preview, acceptance, and release-candidate validation
prod     production
```

The user-facing Chinese label for `staging` may be "预览环境", but configuration names, storage path prefixes, and environment identifiers use `staging`.

Each environment must have isolated:

- PostgreSQL database instance or database namespace.
- `BETTER_AUTH_SECRET`.
- Auth callback/base URL configuration.
- Object storage bucket or strict path prefix.
- AI provider credentials, quotas, or feature flags.
- Audit log and AI call log retention policy.
- Deployment domain.
- Mini Program API base URL and release track configuration when the mini program is introduced.

The local `dev` baseline uses Docker Compose PostgreSQL + pgvector and a local-only `.env.local`.

The `staging` and `prod` environments must be designed before Tencent Cloud deployment work starts. This ADR does not create Tencent Cloud resources.

## Environment Contract

### `dev`

Purpose:

- Developer local validation.
- Schema and migration workflow rehearsal.
- Unit, e2e, and build verification before preview deployment.

Rules:

- Use local Docker PostgreSQL + pgvector by default.
- Use `.env.local`, which is never committed.
- Use local-only secrets.
- Do not connect local code to production or staging databases unless a separate emergency diagnostic plan is approved.

### `staging`

Purpose:

- Preview environment for owner review, acceptance testing, and deployment rehearsal.
- Future mini program trial or experience-version API target.

Rules:

- Use separate database and storage from production.
- Use separate auth secret and callback URLs.
- Use separate AI provider quota or disabled-by-default AI features if provider cost is a concern.
- Reset or seed data may be allowed through a documented process.
- Must not be used as production.

### `prod`

Purpose:

- Real users and production data.

Rules:

- Use production-only secrets.
- Use production-only database and object storage.
- Use explicit migration, backup, and rollback procedures.
- Never share provider keys, auth secrets, or writable storage prefixes with `dev` or `staging`.
- Deployment, migration, and rollback require explicit human approval.

## Configuration Naming

Use environment values:

```text
dev
staging
prod
```

Recommended future environment variables:

```env
APP_ENV=dev|staging|prod
APP_BASE_URL=
DATABASE_URL=
BETTER_AUTH_SECRET=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_PREFIX=
AI_PROVIDER_ENABLED=
ALIBABA_API_KEY=
OPENAI_API_KEY=
WECHAT_MINI_PROGRAM_APP_ID=
WECHAT_MINI_PROGRAM_API_BASE_URL=
```

Do not add these variables to `.env.example` until the implementation task needs them and the naming is reviewed.

## Object Storage Boundary

Object storage paths follow the existing project convention:

```text
{environment}/{resource_type}/{profession}/{yyyymm}/{file_hash}.{extension}
```

Allowed environment prefixes:

```text
dev
staging
prod
```

## Migration Boundary

Migration workflow is environment-aware:

- `dev`: generate, review, and migrate locally.
- `staging`: apply reviewed migrations before acceptance validation.
- `prod`: apply only after backup and rollback plan approval.

`drizzle-kit push` remains forbidden in all environments.

## Mini Program Boundary

Future WeChat Mini Program work must:

- Use REST APIs under the approved `/api/v1/` boundary.
- Keep separate API base URLs for `dev`, `staging`, and `prod`.
- Avoid sharing production credentials with development or preview builds.
- Treat mini program release promotion separately from Web deployment.

## Consequences

- Environment setup has more upfront structure.
- Deployment work must explicitly model Tencent Cloud resources instead of inferring them from local Docker.
- Local development can validate database and migration behavior without risking shared data.
- Staging becomes the owner acceptance gate before production.
- Future mini program configuration can be added without rewriting API boundaries.
