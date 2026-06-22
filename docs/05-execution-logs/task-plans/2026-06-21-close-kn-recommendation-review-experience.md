# Close Kn Recommendation Review Experience Plan

## Task

- Task id: `close-kn-recommendation-review-experience`
- Branch: `codex/close-kn-recommendation-review-experience`
- Base: `f5d17b6ef17d88a6fa39f10a948b8f508e1d5153`
- Scope: make the content_admin `kn_recommendation` review panel visibly tied to the target `question` and expose a local review audit summary for accepted, discarded, and pending recommendations.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/glossary.yaml`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-21-admin-experience-gap-closure-plan.md`

## Implementation Plan

1. Add a failing focused UI test requiring the review panel to show target `question` publicId, accepted/discarded/pending counts, and per-review local audit traces.
2. Keep Provider, prompt payload, env, schema, migration, dependency, browser, dev-server, and e2e work blocked.
3. Implement only the minimal React state/view changes needed to pass the UI test, using existing recommendation and `PATCH /api/v1/questions/{publicId}` behavior.
4. Validate existing service redaction and audit boundaries with `tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts`.
5. Run focused unit, lint, typecheck, diff, Prettier check, Module Run v2 precommit, and prepush readiness.

## Risk Controls

- No real AI Provider call; existing local deterministic recommendation path only in unit tests.
- No prompt/provider payload, raw generated content, private answer, full question content, internal numeric id, secret, token, or database URL in evidence.
- Discard remains a local review state in this task; no new API route or database write is introduced.
- Browser/dev-server/e2e runtime proof remains blocked by the current user boundary.
