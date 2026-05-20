# Security Review: Phase 5 Knowledge Recommendation Baseline

## Metadata

- Task id: `phase-5-knowledge-recommendation-baseline`
- Branch: `codex/phase-5-knowledge-recommendation-baseline`
- Base: `master`
- Reviewer: Codex
- Review date: 2026-05-20
- Verdict: `APPROVE`

## Files Reviewed

- `src/server/services/knowledge-recommendation-service.ts`
- `src/server/services/knowledge-recommendation-service.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-knowledge-recommendation-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-knowledge-recommendation-baseline.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Risk Types Reviewed

- `api_contract`
- `kn_recommendation`
- `external_service`
- `knowledge_node`

## Abuse Cases Considered

- A disabled or non-recommendable `knowledge_node` is returned by the runner and attached to a question.
- A level-mismatched `knowledge_node` is returned by the runner and attached to a question.
- The knowledge tree is empty and the question save flow is blocked.
- The runner throws a provider-like error and blocks question save or publish.
- Raw prompt, question text, standard answer, provider payload, model output, provider error, or knowledge tree path is written into an AI call log draft.
- A future route exposes numeric database `id` values through recommendation output.

## Data Exposure Review

- Recommendation output uses `KnowledgeNodeSnapshot` objects with public ids, current path names, and glossary-aligned camelCase fields.
- AI call log drafts use `createAiCallLogRedactedSnapshots` and local redacted provider payload envelopes.
- The log draft does not store raw prompt, question text, standard answer, analysis, model output, provider payload, provider error, or knowledge tree path names.
- The service does not read or write secrets, environment variables, provider API keys, or provider URLs.

## Authorization Boundary Review

- This baseline adds no API route and no authenticated transport surface.
- The service assumes callers provide the already scoped current question and knowledge tree snapshots.
- Disabled, non-recommendable, profession-mismatched, and level-mismatched knowledge nodes are filtered before runner execution.
- No organization, student, employee, or authorization behavior is changed.

## API Contract Review

- No route handler was added or changed.
- Service-facing fields are camelCase.
- Numeric database `id` values are not accepted or returned.
- The result is non-blocking: empty trees return `recommendations: []`; runner failures return `recommendation_failed` with `recommendations: []`.

## Test Coverage And Accepted Gaps

- Unit tests cover eligible-node filtering, result capping, confidence normalization, empty-tree behavior, non-blocking runner failure, snapshot locking, and log redaction.
- Accepted gap: there is no real provider call, async queue, repository persistence, or route integration in this baseline by task boundary.
- Accepted gap: final teacher confirmation UI and persistence are deferred to later feature slices.

## Verdict

`APPROVE`: the implementation is within task scope, keeps provider and secret boundaries closed, does not introduce migrations or dependencies, and handles AI recommendation failures as non-blocking.
