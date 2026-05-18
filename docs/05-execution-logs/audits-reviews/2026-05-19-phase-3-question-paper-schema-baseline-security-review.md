# Phase 3 Question Paper Schema Baseline Security Review

## Scope

- Task: `phase-3-question-paper-schema-baseline`
- Branch: `codex/phase-3-question-paper-schema-baseline`
- Files reviewed:
  - `src/db/schema/paper.ts`
  - `src/db/schema/index.ts`
  - `src/server/models/paper.ts`

## Security-Relevant Changes

- Added internal numeric `id` columns for ORM relations and URL-safe `public_id` columns for externally addressable resources.
- Added `public_id` to `paper_question` because the approved API contract includes `{paperQuestionPublicId}`.
- Added admin ownership fields for source `material`, source `question`, `paper`, and `paper_asset` records.
- Added JSONB snapshot columns for `question_snapshot`, `material_snapshot`, and paper material grouping snapshots.
- Added lifecycle/status columns for disabled, locked, published, archived, and asset usage flows.

## Findings

- No dependency, lockfile, migration, environment, or deployment change was introduced.
- No `drizzle/**` migration file was generated.
- No runtime API, repository query, service authorization rule, or UI route was implemented in this task.
- URL-facing resources use `public_id`; internal `id` remains schema-only and is not exposed through routes.
- `paper_asset.object_key` exists in schema for traceability but must remain hidden from student-facing APIs in later mapper/contract tasks.
- Snapshot columns are untyped JSONB at schema level; subsequent validator/service tasks must enforce camelCase snapshot shape and exclude internal numeric `id`, session data, admin phone numbers, and `object_key`.

## Explicit Deferrals

- `question_knowledge_node` is deferred because the `knowledge_node` schema contract is not implemented yet.
- `question_tag` is deferred because the `tag` schema contract is not implemented yet.
- These deferrals follow `docs/02-architecture/interfaces/question-paper-contract.md`, which allows either validated foreign keys or explicit evidence when upstream schemas are absent.

## Gate Result

Pass with follow-up controls for later API/service tasks:

- Enforce admin role checks before any content-management write API.
- Enforce student `authorization` filtering before student-facing paper access.
- Enforce snapshot sanitization before paper publish.
- Keep migration generation behind a dedicated human-approved task.
