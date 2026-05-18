# Security Review: phase-3-question-paper-contract-approval

## Metadata

- Task id: `phase-3-question-paper-contract-approval`
- Branch: `codex/phase-3-question-paper-contract-approval`
- Base: temporary stacked base `codex/phase-3-question-paper-planning`; final intended base `master`
- Reviewer: Codex
- Review date: 2026-05-19

## Files Reviewed

- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-3-question-paper-contract-approval.md`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/project-state.yaml`

## Risk Types Reviewed

- `schema`
- `migration`
- `authorization`
- `api_contract`
- `data_contract`
- `admin`

## Abuse Cases Considered

- A user guesses a `publicId` and attempts to access another content resource.
- A student accesses `paper_asset` metadata or object storage keys.
- An `ops_admin` mutates question or paper content without content role permission.
- A published paper changes after reports or answer records rely on the original version.
- A draft publish call skips score-total validation and creates inconsistent paper snapshots.
- A source `question` or `material` is edited after being referenced by a published `paper`.
- A route exposes internal numeric `id` in URL params or DTOs.
- A repository returns database rows directly to a route handler.

## Data Exposure Review

- The contract requires external URLs and DTOs to use `publicId`, not internal numeric `id`.
- Snapshot JSON explicitly excludes internal `id`, session data, admin phone numbers, and storage `object_key`.
- `paper_asset.object_key` is marked as admin-internal and never student-facing.
- Optional fields must use `null`; empty strings are not accepted as null substitutes.

## Authorization Boundary Review

- Admin/content APIs require authenticated admin context.
- `super_admin` and `content_admin` can manage question/paper content.
- `ops_admin` write access is denied for content authoring unless a later role decision expands it.
- Student-facing paper visibility is deferred to Phase 4 and must filter by effective `authorization`.
- `publicId` is explicitly not treated as an access-control mechanism.

## API Contract Review

- REST paths use `/api/v1/` with kebab-case plural nouns.
- Dynamic route params use public identifier names such as `{publicId}` or `{paperQuestionPublicId}`.
- Standard response shape remains `{ code, message, data, pagination? }`.
- DTO fields are camelCase.
- Route handlers remain thin adapters over service and repository boundaries.

## Test Coverage And Accepted Gaps

- This task is documentation and state only; no runtime code is changed.
- Validation uses document existence, required glossary term checks, naming scan, format check, and Git completion readiness.
- Runtime tests, schema typecheck, route tests, and publish validation unit tests are intentionally deferred to downstream implementation tasks.
- Drizzle migration generation is not approved in this task.

## Verdict

APPROVE

The contract is acceptable as a Phase 3 baseline because it defines the required security boundaries before implementation and does not introduce runtime behavior, schema files, migration files, dependencies, secrets, or external services.
