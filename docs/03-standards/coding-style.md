# 编码风格规范 (Coding Style)

## Status

Active.

## Purpose

Define local coding rules that complement `AGENTS.md` and the Code Taste Ten Commandments. This document focuses on day-to-day implementation details for agentic work.

## TypeScript And React

- Use TypeScript for all application code.
- Prefer explicit domain names from `docs/03-standards/glossary.yaml`; do not introduce unregistered abbreviations.
- Components, types, and classes use `PascalCase`.
- Variables, functions, hooks, and event handlers use `camelCase`.
- Hooks use `use` + `PascalCase`, for example `usePaperDetail`.
- Event handlers use `handle` + verb + noun, for example `handleSubmitAnswer`.
- Callback props use `on` + verb + noun, for example `onSubmitAnswer`.
- Keep UI components as stateless as practical; move data loading, branching business rules, and side effects into hooks, services, or route adapters.

## Server Code

- Follow ADR-002 layering: route handlers / server actions -> service -> repository -> model.
- Business rules belong in `src/server/services`.
- Database access belongs in `src/server/repositories`.
- API contracts belong in `src/server/contracts`.
- Database-to-API conversion belongs in `src/server/mappers`.
- Route handlers and Server Actions must not return database rows directly.

## Comments

- Do not write comments that repeat the code.
- Comments are allowed only for business context, cross-module invariants, operational constraints, or non-obvious tradeoffs.
- Remove commented-out code before committing.

## Naming Red Flags

Avoid vague names such as:

- `data`
- `res`
- `temp`
- `x`
- `info`
- `item` when the domain object has a known name

Use domain names such as `paper`, `question`, `answerRecord`, `modelConfig`, or `authorization`.

## Immutability

- Do not mutate React state arrays or objects in place.
- Use `map`, `filter`, object spread, array spread, or other immutable updates.
- Repository code may build local mutable query objects only when the mutation is not observable outside the function.

## Third-Party Boundaries

- Third-party naming stays inside adapters or wrapper modules.
- Feature code should import project-owned modules, not scatter provider SDK calls across pages or components.
- Any new dependency must pass `docs/04-agent-system/sop/dependency-introduction-gate.md`.
