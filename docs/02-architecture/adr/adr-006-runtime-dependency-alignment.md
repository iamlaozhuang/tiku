# ADR-006: Runtime Dependency Alignment

## Status

Accepted

## Date

2026-06-12

## Related

- adr-001-tech-stack-selection.md
- adr-002-runtime-architecture-and-multi-client-contract.md
- adr-004-environment-isolation-and-release-boundaries.md
- adr-005-staging-architecture-and-release-boundaries.md
- ../../04-agent-system/sop/dependency-introduction-gate.md
- ../../05-execution-logs/evidence/2026-06-12-health-audit-local-baseline.md

## Context

ADR-001 selected the initial technology stack on 2026-05-14, including Next.js 15, React-based UI, Better Auth, Drizzle ORM, Vercel AI SDK, LangChain text splitters, Markdown rendering packages, PostgreSQL, and pgvector.

The current repository runtime has evolved since that selection. The implementation now uses Next.js 16 and React 19, while several AI/RAG/Markdown packages from ADR-001 are not yet present in `package.json`.

The project needs a current baseline that distinguishes:

- accepted historical direction from ADR-001;
- packages that are actually installed today;
- planned but deferred dependencies that still require dependency gate approval before introduction.

This ADR records current reality only. It does not add, remove, upgrade, or downgrade any package.

## Current Package Baseline

As of 2026-06-12, `package.json` records this local runtime baseline:

| Area                    | Current package state                                                                                                                  |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Framework               | `next` 16.2.6                                                                                                                          |
| React runtime           | `react` 19.2.4 and `react-dom` 19.2.4                                                                                                  |
| Auth                    | `better-auth` ^1.6.11 and `@better-auth/drizzle-adapter` ^1.6.11                                                                       |
| ORM and database driver | `drizzle-orm` ^0.45.2, `drizzle-kit` ^0.31.10, `postgres` ^3.4.9                                                                       |
| UI and styling          | `@base-ui/react` ^1.4.1, `shadcn` ^4.7.0, `tailwindcss` ^4, `@tailwindcss/postcss` ^4, `tw-animate-css` ^1.4.0, `lucide-react` ^1.14.0 |
| Testing                 | `vitest` ^4.1.6, `@playwright/test` ^1.60.0, Testing Library packages, `jsdom` ^29.1.1                                                 |
| Tooling                 | TypeScript ^5, ESLint ^9, `eslint-config-next` 16.2.6, Prettier ^3.8.3                                                                 |

## Deferred Dependency Baseline

The following ADR-001 items are still architectural direction, but they are not installed in the current package baseline:

| Area                        | Deferred packages or resources                                                    | Current decision                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| AI SDK                      | `ai`, `@ai-sdk/alibaba`, `@ai-sdk/openai-compatible`, optional official providers | Deferred until an approved provider integration task passes dependency introduction gate and provider/env gates.              |
| RAG text splitting          | `@langchain/textsplitters`                                                        | Deferred until a scoped knowledge base/RAG implementation task is approved.                                                   |
| Markdown and math rendering | `react-markdown`, `remark-math`, `remark-gfm`, `rehype-katex`, `katex`            | Deferred until a scoped rich text rendering task is approved.                                                                 |
| pgvector                    | PostgreSQL extension, not an npm package                                          | Remains an infrastructure/database capability. Enabling it requires a separate schema/database/environment plan and approval. |

## Decision

The current implementation baseline is accepted as:

- Next.js 16.2.6 with React 19.2.4;
- Better Auth 1.6.x with Drizzle adapter;
- Drizzle ORM 0.45.x and drizzle-kit 0.31.x;
- Tailwind CSS 4-based styling;
- local unit and Playwright tooling as recorded in `package.json`.

ADR-001 remains the historical technology stack selection. ADR-006 is the current runtime dependency alignment record for implementation and audit work after 2026-06-12.

Future tasks must treat absent ADR-001 packages as deferred, not as silently missing implementation. Introducing any deferred package requires:

- an explicit queued task;
- allowed files that include `package.json` and the relevant lockfile;
- dependency introduction gate evidence with human approval;
- validation evidence after install;
- separate provider/env/schema/deploy approval when those capabilities are involved.

## Consequences

- Health audits and closeout reports can cite ADR-006 when comparing implementation reality against architecture decisions.
- The project can continue on Next.js 16/React 19 without rewriting ADR-001.
- AI/RAG/Markdown work remains independently reviewable and cannot be bundled into unrelated repair tasks.
- Dependency, provider, env, schema, migration, deploy, payment, and external-service gates remain blocked unless a later task explicitly approves them.

## Non-Goals

- No package or lockfile change.
- No dependency installation.
- No provider call or provider configuration.
- No `.env.local` or `.env.example` change.
- No schema, migration, database, pgvector, staging, production, deploy, payment, or external-service work.
- No claim that AI/RAG/Markdown runtime features are complete.
