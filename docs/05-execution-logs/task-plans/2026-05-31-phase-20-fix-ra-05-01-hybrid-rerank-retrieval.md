# Phase 20 Fix RA-05-01 Hybrid Rerank Retrieval

## Summary

- Task: `phase-20-fix-ra-05-01-hybrid-rerank-retrieval`
- Branch: `codex/phase-20-fix-ra-05-01-hybrid-rerank-retrieval`
- Date: 2026-05-31
- Scope: local deterministic hybrid/rerank retrieval behavior.
- Explicitly out of scope: dependency changes, real provider calls, external vector database or cloud services, package or lockfile changes, env or secret access, schema/drizzle/migration changes.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Finding

Phase 18 finding `F-RA-05-01-001` records that local RAG retrieval uses deterministic fusion and fallback marker, but lacks explicit hybrid rerank behavior. Real vector/provider/rerank services remain blocked.

## Implementation Plan

1. Add RED unit coverage for opt-in local `hybrid_rerank` mode that reranks authorized candidates using local query relevance after authorization filtering.
2. Implement the smallest local deterministic rerank in `src/rag/retrieval.ts` without new dependencies or external services.
3. Preserve default `fusion_sort` behavior and existing tests.
4. Keep evidence redaction: summaries may include ids, hashes, counts, and mode only, not raw chunk text.
5. Record validation, security review, and forbidden-scope confirmation.

## Risk Controls

- `rag_runtime`: local deterministic scoring only; authorized filtering remains before ranking.
- `ai_runtime`: no model/provider call.
- `dependency_change` and `external_service_config`: explicitly not executed.
- `local_human_verification`: local-only validation; no staging/prod/cloud/deploy.
- `evidence_integrity`: no raw retrieved chunk text, raw prompts, raw answers, model output, provider payload, tokens, secrets, or env values in evidence.

## Validation Plan

- Targeted RED/GREEN unit test for hybrid rerank.
- Existing retrieval unit tests to prove fusion compatibility.
- Task validation commands from queue.
- Required local gates from `docs/03-standards/local-ci.md`.
- `npm.cmd run test:unit`
- `npm.cmd run test:e2e`
- `git diff --check`
- `Test-AgentSystemReadiness.ps1`
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `Test-NamingConventions.ps1`
- `Invoke-QualityGate.ps1`
- Build is not required unless frontend, route, rendering, or build config changes occur.
