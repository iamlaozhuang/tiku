# ADR-002: Runtime Architecture and Multi-Client Contract

## Status

Accepted

## Date

2026-05-15

## Related

- adr-001-tech-stack-selection.md

## Context

Tiku is a Next.js and TypeScript monolith. The Web application is the first client and remains the primary delivery target for the MVP.

Future WeChat Mini Program support requires a stable REST API boundary. Server Actions are valuable for Web interactions, but they are insufficient as the sole runtime boundary for non-Web clients because Mini Program clients cannot directly share the same React and Next.js action surface.

The runtime architecture must keep the Next.js monolith selected in ADR-001 while preserving a clean client boundary for future multi-client work.

## Decision

Tiku will use this runtime layering:

```text
route handlers / server actions -> service -> repository -> model
```

The layer ownership rules are:

- `src/app/api/v1/*` exposes REST route handlers for external clients, for example `src/app/api/v1/papers/route.ts` and `src/app/api/v1/mock-exams/[publicId]/submit/route.ts`.
- Formal paper lifecycle has one canonical REST family: `/api/v1/papers`. Do not publish an `exam-papers` alias with a separate contract or adapter stack.
- Route handlers and Server Actions are thin adapters only. They validate transport input, call services, map service results to API response contracts, and return the standard transport response.
- Business logic belongs in `src/server/services`.
- Database access belongs in `src/server/repositories`.
- Drizzle schema remains in `src/db/schema/`, as selected by ADR-001 and `drizzle.config.ts`.
- `src/server/models` may hold domain models, type mappings, or schema export adapters. It is not the ORM schema source.
- Schema definitions for the ORM are sourced only from `src/db/schema/`.
- Shared validation belongs in `src/server/validators`.
- API response contract definitions belong in `src/server/contracts`.
- Database row to API JSON conversion belongs in `src/server/mappers`.
- Route handlers and Server Actions must not return database rows directly.

## API Contract

AGENTS.md is the normative source for API naming and response constraints. All REST APIs must follow the project contract:

- API paths use `/api/v1/`.
- Paths use kebab-case plural nouns.
- JSON fields use camelCase.
- Responses use `{ code, message, data, pagination? }`.
- Time values use ISO 8601 format, for example `2026-05-12T12:00:00Z`.
- Optional fields return `null` and are not omitted.
- Empty lists return `[]`.
- Pagination uses `page`, `pageSize`, `sortBy`, and `sortOrder`.
- Resource nesting is limited to at most two levels.
- Actions use verb subpaths, for example `POST /api/v1/mock-exams/{publicId}/submit`.
- External URLs do not expose auto-increment primary keys.

## Consequences

- Server entrypoints share the service layer through route handlers and Server Actions.
- Web and mini program clients only consume allowed transport boundaries such as REST APIs or approved Web entrypoints.
- API route handlers and Server Actions remain thin adapters over the same service layer.
- More files are required than a pure Server Actions implementation.
- Future multi-client work is protected by a stable REST boundary.
- Business rules are easier to validate because they live in services instead of client-specific entrypoints.
- Repository ownership keeps Drizzle queries isolated from route handlers and UI-facing wrappers.
- Server-side response mapping prevents database naming conventions from leaking into API JSON fields.
