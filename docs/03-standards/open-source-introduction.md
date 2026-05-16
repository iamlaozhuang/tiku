# Open-Source Resource Introduction Standard

## Purpose

Define how Tiku may use open-source packages, starter repositories, copied components, examples, and reference implementations during semi-automated development.

Open-source resources are allowed when they reduce delivery risk without weakening project ownership, naming discipline, deployment control, or future maintainability.

## Default Policy

Use open-source resources in this order of preference:

1. Learn from documentation or source as a reference.
2. Use a small package behind a project-owned adapter.
3. Copy a small component or utility only when its license allows it and the copied code becomes project-maintained.
4. Avoid forking or importing large starters unless a separate architecture decision approves it.

ADR-001 already sets the default for starter repositories: reference patterns only, no direct fork.

## Timing Rules

Do not introduce a dependency because it may be useful later. Introduce it only when an active queue task needs it and the task can validate it.

Typical timing:

- Auth dependencies land with user and authorization tasks.
- ORM, database driver, and migration tooling land with DB/schema tasks.
- UI component additions land with concrete page or component tasks.
- AI provider packages land with AI/RAG tasks.
- Markdown or rich text packages land with question, analysis, or report rendering tasks.
- Cloud SDKs land with deployment, storage, or operations tasks.

## Required Review

Before adding, removing, upgrading, or copying third-party maintained code, complete the dependency introduction gate and record:

- Exact package, repository, or copied component source.
- Version or commit reference.
- License and whether it is compatible with project use.
- Maintenance signal such as recent releases, issue activity, or ecosystem adoption.
- Security signal such as known vulnerabilities, archived status, or risky install scripts.
- Runtime, bundle, or operational impact.
- Windows 11, Codex desktop, Docker, Tencent Cloud, and modern Chromium compatibility when relevant.
- Import or ownership boundary inside the Tiku codebase.
- Alternative considered and rejection reason.
- Human approval evidence.

## Encapsulation Rules

Business code must depend on project-owned boundaries, not raw third-party APIs.

Examples:

- Auth packages are wrapped by auth services and adapters.
- AI providers are wrapped by AI provider adapters.
- RAG packages are wrapped by RAG services.
- Storage SDKs are wrapped by storage adapters.
- UI library primitives are exposed through project components.
- Markdown rendering is wrapped by project content-rendering components.

Third-party naming stays inside these boundaries. Project-facing names follow `AGENTS.md` and `docs/03-standards/glossary.yaml`.

## Starter Repository Rules

Starter repositories may be used for:

- Reading integration patterns.
- Comparing directory layouts.
- Checking common configuration examples.
- Extracting small, license-compatible ideas into project-owned implementation.

Starter repositories must not be used for:

- Direct full-project fork.
- Bulk copy without license and ownership review.
- Replacing the queued architecture.
- Importing unrelated features to save time.

## Validation Rules

Every accepted open-source introduction must include validation evidence appropriate to the change:

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test`
- `npm.cmd run build` when runtime or frontend bundling is affected
- Targeted browser or API verification when user-facing behavior is affected

If a validation gate is unavailable, record the missing gate explicitly instead of claiming full coverage.
