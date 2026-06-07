# Phase 5 Knowledge Recommendation Baseline Task Plan

## Task

- Task id: `phase-5-knowledge-recommendation-baseline`
- Branch: `codex/phase-5-knowledge-recommendation-baseline`
- Phase: `phase-5-ai-rag`
- Source stories:
  - `docs/01-requirements/stories/epic-04-ai-scoring.md#us-04-06-ai-知识点推荐`
  - `docs/01-requirements/stories/epic-05-rag-knowledge.md#us-05-08-知识点树管理`

## Required Standards Read

- `AGENTS.md`
- `docs/03-standards/doc-management.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/skill-dispatch-matrix.md`
- `docs/04-agent-system/sop/dependency-introduction-gate.md`
- `docs/03-standards/git-workflow.md`
- `docs/03-standards/ui-code.md`
- `docs/03-standards/glossary.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/milestones-goals/mvp-roadmap.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-ai-explanation-and-hint-baseline.md`

## Scope

Implement a provider-free `kn_recommendation` baseline service that recommends candidate `knowledge_node` snapshots for a question. The service is pure server-side logic with injectable runner/fallback behavior and no real model provider integration.

## Allowed Files

- `docs/05-execution-logs/task-plans/2026-05-20-phase-5-knowledge-recommendation-baseline.md`
- `docs/05-execution-logs/evidence/2026-05-20-phase-5-knowledge-recommendation-baseline.md`
- `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-knowledge-recommendation-baseline-security-review.md`
- `src/ai/**`
- `src/app/api/v1/questions/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/models/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Blocked Files And Boundaries

- Do not change `package.json`, `pnpm-lock.yaml`, `package-lock.json`, `drizzle/**`, or `.env.example`.
- Do not add dependencies, CLIs, SDKs, test frameworks, provider packages, or lockfile changes.
- Do not add database migrations or change generated migration state.
- Do not introduce pgvector, embedding storage, vector columns, or real embedding calls.
- Do not write real secrets, provider keys, provider URLs, or environment variables.
- Do not connect to a real model provider.
- Do not expose numeric database `id` values in URLs or API DTOs.

## Implementation Design

- Add `src/server/services/knowledge-recommendation-service.ts`.
- Add `src/server/services/knowledge-recommendation-service.test.ts`.
- Reuse `KnowledgeNodeSnapshot`, `ModelConfigSnapshot`, and `createAiCallLogRedactedSnapshots` from `src/server/models/ai-rag.ts`.
- Keep prompt template locking local to the service input using `promptTemplateKey`, `version`, and `templateHash`.
- Accept the current knowledge tree as snapshots; filter to active, recommendable, profession-compatible, and level-compatible nodes before calling the runner.
- Return `[]` when the current knowledge tree has no eligible nodes.
- Limit returned recommendations to zero to five items.
- Use confidence values `high`, `medium`, and `low`.
- Preserve current knowledge node path snapshots in the result so historical report analysis can use a fixed snapshot.
- Return non-blocking `recommendation_failed` results when the runner throws, so question save/publish flows are not blocked.
- Produce AI call log drafts with redacted prompt, question/request context, model output, provider payload, provider error, and knowledge tree snapshots.

## TDD Plan

1. Write failing tests for the service import and contract.
2. Run `npm.cmd run test:unit -- src/server/services/knowledge-recommendation-service.test.ts` and record RED.
3. Implement the minimum service to satisfy the tests.
4. Rerun the focused test and record GREEN.
5. Run the full validation commands from the queue and record evidence.

## Security Review Plan

Create `docs/05-execution-logs/audits-reviews/2026-05-20-phase-5-knowledge-recommendation-baseline-security-review.md` before merge. The review must cover:

- API contract and `kn_recommendation` boundaries.
- Knowledge node filtering for disabled and non-recommendable nodes.
- Snapshot behavior for current knowledge node paths.
- Non-blocking failure behavior for question save and publish flows.
- Redaction of question text, prompt, model output, provider payloads, errors, and knowledge tree details.
- Confirmation that no real provider, secret, dependency, migration, pgvector, or embedding storage was introduced.

## Validation Commands

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-5-knowledge-recommendation-baseline`
- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `npm.cmd run build`

## Risk Controls

- Dependency risk: no package or lockfile edits.
- Secret risk: provider-facing values remain snapshots only; no secrets or environment changes.
- Authorization/data risk: no API route is required for this baseline; service input uses already scoped question and knowledge tree snapshots.
- Logging risk: all AI call log drafts use redacted snapshots only and do not include raw question text, model output, provider payload, or knowledge tree content.
- Knowledge tree risk: stopped or non-recommendable nodes are filtered out before recommendation; empty trees produce a successful empty result.
