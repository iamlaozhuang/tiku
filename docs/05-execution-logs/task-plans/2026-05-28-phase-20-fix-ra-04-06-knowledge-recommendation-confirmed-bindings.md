# Phase 20 Fix RA-04-06 Knowledge Recommendation Confirmed Bindings Plan

## Task

- Task id: `phase-20-fix-ra-04-06-knowledge-recommendation-confirmed-bindings`
- Branch: `codex/phase-20-fix-ra-04-06-knowledge-recommendation-confirmed-bindings`
- Scope: implementation
- Human approval: 2026-05-28 user approved local implementation under `database_migration` and local `ai_runtime` risk, limited to reusing landed `question` / `knowledge_node` binding where possible.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/02-architecture/interfaces/question-paper-contract.md`
- `docs/02-architecture/interfaces/admin-ops-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-18-audit-ra-04-ai-scoring-explanation-hint-model.md`

## Approval Boundary

Allowed:

- Create and use this short-lived branch.
- Implement the local confirmed `kn_recommendation` binding loop using existing `question` / `knowledge_node` binding infrastructure.
- Modify task-scoped `src/**`, `tests/**`, `e2e/**`, `docs/04-agent-system/state/**`, task plan, and task evidence.
- Commit, merge to `master`, validate on `master`, push `origin/master`, delete the short-lived branch, and update closeout evidence/state.

Blocked:

- New schema or migration files unless separately approved after stopping.
- `.env.local`, `.env.example`, package manifests, lockfiles, dependency changes.
- Staging/prod/cloud/deploy/real provider access.
- External service configuration changes.
- Destructive data operations and `drizzle-kit push`.

Stop condition:

- If implementation requires new schema/migration, dependency, secret/env, external service, real provider, deployment/cloud, or destructive data work, stop and request separate approval.

## Implementation Approach

1. Use TDD: first add a focused failing test proving that confirmed recommendation candidates update durable question `knowledgeNodePublicIds` through the landed binding path.
2. Inspect existing recommendation route/service, question service/repository, and RA-02-01 binding implementation before choosing the smallest implementation surface.
3. Prefer existing repository/service APIs and public identifiers; do not add schema, migrations, dependencies, env, provider, or cloud behavior.
4. Keep stale recommendation handling and redacted `ai_call_log` evidence intact.
5. Run task-declared local gates plus broader build/e2e gates before closeout.

## Risk Controls

- No raw prompts, raw model outputs, provider payloads, secrets, or env values in evidence.
- No real provider call; local deterministic/mock runtime only.
- No database schema/migration change in this task unless stopped and separately approved.
- Preserve API response envelope and camelCase DTO fields.
- Use public identifiers on external surfaces; keep numeric IDs internal.
