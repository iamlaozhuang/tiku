# Phase 20 Fix RA-05-06 Vector Rebuild Stale Marker Plan

## Task

- Task id: `phase-20-fix-ra-05-06-vector-rebuild-stale-marker`
- Branch: `codex/phase-20-fix-ra-05-06-vector-rebuild-stale-marker`
- Source finding: `F-RA-05-06-001`
- Goal: complete the local deterministic/mock RAG representation for old-vector preservation, stale citation markers, and atomic switch semantics.

## Read Sources

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-05-27-phase-18-audit-ra-05-rag-knowledge.md`
- `docs/05-execution-logs/evidence/2026-05-27-phase-18-audit-ra-05-rag-knowledge.md`

## Human Approval

The user approved local implementation with `external_service_config` risk strictly bounded to local deterministic/mock RAG runtime and resource lifecycle evidence. Real vector provider, cloud vector store, staging/prod/cloud/external services, real provider calls, dependency changes, env/secret changes, schema/migration changes, deployment, destructive data operations, and `drizzle-kit push` remain forbidden.

## Allowed Scope

- `src/**`
- `tests/**`
- `e2e/**`
- `docs/04-agent-system/state/**`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- Necessary `docs/05-execution-logs/audits-reviews/**` evidence updates

## Blocked Scope

- `.env.local`
- `.env.example`
- `package.json`
- lockfiles
- dependency changes
- `src/db/schema/**`
- `drizzle/**`
- `scripts/**`
- cloud/deploy configuration
- staging/prod/real provider connections
- destructive data operations

## Implementation Plan

1. Add RED tests for local old-vector preservation after a `rag_ready` resource is edited.
2. Add RED tests for stale citation markers in local deterministic retrieval while a resource has unpublished vector changes.
3. Add RED tests for atomic switch semantics: successful rebuild replaces the active chunk snapshot, while failed rebuild preserves the last usable snapshot.
4. Implement the smallest local runtime changes needed:
   - Persist local active chunk snapshots in the local resource catalog.
   - Preserve active snapshots while marking edited vectors stale.
   - Prefer active snapshots for local retrieval when a resource is stale.
   - Add redaction-safe stale markers to citations and retrieval summaries.
   - Switch active snapshots only after a successful local rebuild result is built.
5. Run task validation and local CI gates, then record evidence.

## Risk Controls

- Keep changes local-only; do not connect to real vector providers.
- Use additive DTO fields only; do not break existing API envelopes.
- Do not store raw provider payloads or secrets.
- Do not alter database schema or migrations.
- Keep evidence redaction-safe: no raw full resource content, secrets, tokens, or environment values.
