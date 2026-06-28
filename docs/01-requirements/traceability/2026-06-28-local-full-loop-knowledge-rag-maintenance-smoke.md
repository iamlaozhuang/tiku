# Local Full Loop Knowledge RAG Maintenance Smoke Traceability

## Task

- Task id: `local-full-loop-knowledge-rag-maintenance-smoke-2026-06-28`
- Sprint: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-full-loop-rag-20260628`
- Result: `pass_local_full_loop_knowledge_rag_maintenance_smoke`

## Requirement Sources

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-acceleration-planning-state-queue.md`
- `docs/01-requirements/traceability/2026-06-28-local-full-loop-baseline-accounts-auth-db.md`

## Coverage Map

| Requirement surface          | Local evidence                                                                                                                           |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Knowledge base baseline      | Local dev seed now maintains enabled `marketing` and `monopoly` knowledge bases by profession.                                           |
| Knowledge node maintenance   | `content_admin` localhost API smoke creates and lists a `knowledge_node` for `marketing`.                                                |
| Resource maintenance         | Local Markdown resource upload returns draft status through `/api/v1/resources`.                                                         |
| Resource publish lifecycle   | Resource publish route returns published status through localhost API.                                                                   |
| Local RAG indexing lifecycle | Resource vector rebuild returns `rag_ready` and a positive redacted chunk count.                                                         |
| Resource list visibility     | Resource list route finds the target resource as `rag_ready` without exposing raw runtime payload.                                       |
| RAG retrieval governance     | Existing focused RAG unit coverage remains green for chunking, publish/index loop, retrieval filtering, and redacted citation summaries. |
| API contract and redaction   | Smoke asserts standard API envelope, camelCase JSON keys, no raw `id` key, and no raw runtime payload in responses.                      |

## Implementation Summary

- Added deterministic local dev seed coverage for `knowledge_base` rows required by knowledge node and resource flows.
- Made `knowledge_base` seed upsert idempotent by `profession`, matching the existing database uniqueness contract.
- Added a scoped localhost e2e smoke for `content_admin` knowledge node creation, resource upload, publish, vector rebuild, and list visibility.
- Reused existing local deterministic RAG unit tests; no new Provider path, schema migration, dependency, package, lockfile, `.env*`, staging/prod, or Cost Calibration work.

## Residual Scope

- This task proves local knowledge/RAG maintenance and local deterministic retrieval readiness only.
- AI question generation, AI paper composition, student answer flow, AI explanation, organization training, analytics, and organization AI generation remain successor tasks.
- No release readiness, production readiness, final Pass, pricing, quota default, or Cost Calibration decision is claimed.
