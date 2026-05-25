# Task Plan: Phase 12 AI RAG Citation Local Integration

## Task

- id: `phase-12-repair-ai-rag-citation-local-integration`
- branch: `codex/phase-12-ai-rag-citation-local-integration`
- source: Phase 12 SSOT audit repair queue

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Scope

Connect local-only `rag_ready` resource evidence to local/mock AI citation paths where existing contracts permit. This task does not add provider calls, dependencies, schema, migrations, scripts, env changes, cloud resources, staging/prod access, deployments, or public storage URLs.

## SSOT Acceptance Focus

- RAG uses only published/RAG-ready resources.
- Disabled resources do not participate in retrieval.
- RAG retrieval uses profession/level and authorized resource filters before citations reach AI.
- AI output can attach citations only when `evidenceStatus` is sufficient.
- Weak/none evidence does not fabricate citations and records insufficient-evidence behavior.
- `ai_call_log` evidence remains redacted: no raw prompt, answer, provider payload, model response, raw chunk text, secret, token, or Authorization header.

## Implementation Approach

1. Add a local resource retrieval helper over the existing local resource catalog.
2. Feed that helper into local/mock `ai_explanation` and `ai_scoring` runtimes when question snapshots provide scope metadata.
3. Preserve existing empty-RAG fallback when no local RAG-ready resource or scope is available.
4. Extend allowed unit tests to prove citation attachment, authorization/status filtering, and redacted log snapshots.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-12-repair-ai-rag-citation-local-integration`
- `npm.cmd run test:unit -- tests/unit/phase-11-local-rag-mock-embedding-pipeline.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts tests/unit/phase-11-ai-knowledge-recommendation-review-loop.test.ts`
- `npm.cmd run build`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `git diff --check`

## Risk Controls

- No real provider calls.
- No `.env.local` read/output beyond existing local runtime behavior.
- No raw prompt, answer, model response, provider payload, retrieved chunk text, token, Authorization header, or secret in evidence.
- No package/lockfile, schema, migration, script, staging/prod, deploy, or cloud changes.
