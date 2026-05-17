# Dependency Introduction Gate

## Status

Draft for Phase 0

## Purpose

Define the approval and documentation gate for dependency changes. Tiku keeps dependency changes deliberate because each package affects security, bundle size, operations, and long-term maintenance.

This gate is complemented by `docs/03-standards/open-source-introduction.md`, which also covers starter repositories, copied components, source references, timing, and ownership boundaries.

## Approval Requirement

Adding, removing, or upgrading a dependency requires human approval before the package file or lockfile is changed.

This applies to:

- Runtime dependencies.
- Development dependencies.
- Transitive dependency overrides.
- CLI tools introduced through package scripts.
- Third-party components copied into the repository when they behave as maintained external dependencies.

## Required Record Fields

Every dependency plan must record:

- Package name.
- Version range.
- Change type: add, remove, or upgrade.
- Purpose.
- Import boundary.
- License compatibility.
- Alternative considered.
- Reason the alternative was rejected.
- Abandonment risk.
- Security or maintenance risk.
- Windows, Codex desktop, Docker, Tencent Cloud, or browser compatibility impact when relevant.
- Bundle or runtime impact when relevant.
- Validation command.
- Human approval evidence.

Approval evidence must be explicit and traceable. The phrase `human approval` should appear in the record so the gate can be searched reliably.

## Encapsulation

Business-contract dependencies must be wrapped behind project-owned modules before they are used by feature code.

Examples:

- Auth provider calls stay behind project auth services and adapters.
- AI model provider calls stay behind AI service modules.
- RAG libraries stay behind project RAG services.
- Storage SDKs stay behind storage adapters.
- UI component libraries are exposed through project components rather than scattered direct imports.

The wrapper must express the Tiku business contract. Feature code should depend on project-owned names and types, not third-party API shapes.

## Naming

Third-party naming stays inside adapters. Project-facing names must follow `docs/03-standards/glossary.yaml` and `AGENTS.md`.

Rules:

- Database identifiers use `snake_case`.
- API JSON fields use `camelCase`.
- REST paths use kebab-case plural nouns under `/api/v1/`.
- Do not expose third-party naming that conflicts with Tiku terms.
- Do not introduce unregistered abbreviations.
- Use aliases at the adapter boundary when external packages use conflicting names.

No dependency change may bypass this gate to save implementation time.

## Commit Isolation

- Dependency add, remove, or upgrade work must close as its own task-scoped commit whenever the repository state is committed.
- Dependency commits must not include feature implementation, route handlers, schema changes, generated migrations, or unrelated formatting churn.
- Feature tasks that depend on a newly approved dependency must start from a clean branch or worktree after the dependency commit has been merged or explicitly chosen as the branch base.
- If a dependency change cannot be committed independently, stop and record the blocker in evidence before continuing feature work.
