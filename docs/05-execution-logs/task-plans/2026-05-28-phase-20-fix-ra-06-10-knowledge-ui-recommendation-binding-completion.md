# Phase 20 Fix RA-06-10 Knowledge UI Recommendation Binding Completion Plan

## Task

- Task id: `phase-20-fix-ra-06-10-knowledge-ui-recommendation-binding-completion`
- Branch: `codex/phase-20-fix-ra-06-10-knowledge-ui-recommendation-binding-completion`
- Scope: implementation
- Human approval: 2026-05-28 user approved local UI/runtime/test/evidence implementation for knowledge tree and question admin recommendation correction with durable binding.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-06-admin-ops-logs-permissions.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-18-audit-ra-06-admin-ops-logs-permissions.md`
- `docs/05-execution-logs/task-plans/2026-05-28-phase-20-fix-ra-04-06-knowledge-recommendation-confirmed-bindings.md`
- `docs/05-execution-logs/evidence/phase-20-fix-ra-04-06-knowledge-recommendation-confirmed-bindings.md`

## Approval Boundary

Allowed:

- Create and use this short-lived branch.
- Modify task-scoped `src/**`, `tests/**`, `e2e/**`, `docs/04-agent-system/state/**`, task plan, and task evidence.
- Complete the local knowledge tree / question admin UI and runtime evidence loop for recommendation correction and durable question-to-`knowledge_node` binding.
- Commit, merge to `master`, validate on `master`, push `origin/master`, delete the short-lived branch, and update closeout evidence/state.

Blocked:

- `.env.local`, `.env.example`, package manifests, lockfiles, dependency changes.
- `src/db/schema/**`, `drizzle/**`, schema or migration work.
- Auth permission model changes.
- Staging/prod/cloud/deploy/real provider access.
- External service configuration changes.
- Destructive data operations and `drizzle-kit push`.

Stop condition:

- If implementation requires auth permission model, schema/migration, dependency, secret/env, external service, real provider, deploy/cloud, or destructive data work, stop and request separate approval.

## Implementation Approach

1. Use TDD: first add focused failing coverage for the knowledge tree UI showing the durable recommendation binding loop is now connected to the question admin review path instead of being an unproven local-only gap.
2. Reuse the RA-04-06 durable `PATCH /api/v1/questions/{publicId}` binding path and the existing knowledge node list DTO. Do not add schema, migration, dependency, env, provider, or cloud behavior.
3. Keep the knowledge node UI desktop-first and publicId-safe: no numeric internal ids, no secrets, no raw provider payloads.
4. Add only the smallest runtime/UI surface needed to make the knowledge tree UI expose recommendation binding readiness and a direct local handoff route into question review.
5. Run focused unit tests first, then full local CI, e2e, build, readiness, naming, and git inventory gates before closeout.

## Risk Controls

- No raw prompts, raw model outputs, provider payloads, secrets, env values, credentials, or full private content in evidence.
- No real provider call; local UI/runtime only.
- No database schema/migration change.
- Preserve standard API envelope and camelCase DTO fields.
- Use public identifiers only on external and UI surfaces.
