# Task Plan: phase-9-ai-knowledge-model-config-runtime

## Metadata

- Task id: `phase-9-ai-knowledge-model-config-runtime`
- Branch: `codex/phase-9-ai-knowledge-model-config-runtime`
- Date: `2026-05-23`
- Base branch: `master`
- Security review required: yes

## Readiness And Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/interfaces/phase-9-mvp-acceptance-contract.md`
- `docs/01-requirements/modules/04-ai-scoring.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-04-ai-scoring.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-05-23-phase-9-ai-scoring-explanation-hint-runtime.md`

## Claim Gate

`Test-TaskClaimReadiness.ps1 -TaskId phase-9-ai-knowledge-model-config-runtime` passed on branch `codex/phase-9-ai-knowledge-model-config-runtime`.

## Allowed Scope

Use only the task queue allowed files:

- this task plan, final evidence, and security review
- `src/app/api/v1/model-configs/**`
- `src/app/api/v1/questions/**`
- `src/server/contracts/**`
- `src/server/mappers/**`
- `src/server/repositories/**`
- `src/server/services/**`
- `src/server/validators/**`
- `tests/unit/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

Blocked files remain untouched: `package.json`, lockfiles, `.env.example`, and `drizzle/**`.

## Implementation Strategy

1. Add RED tests for:
   - `POST /api/v1/questions/{publicId}/recommend-knowledge-nodes` requiring admin session and content permission.
   - deterministic local `kn_recommendation` candidate generation with 1 to 5 active recommendable knowledge nodes.
   - redacted `ai_call_log` draft append and `question.recommend_knowledge_nodes` audit log append.
   - model config enable/disable runtime requiring `super_admin`, updating only by `publicId`, and writing redacted audit logs.
2. Reuse existing `knowledge-recommendation-service` for recommendation filtering, prompt snapshot, model config snapshot, and redacted `ai_call_log` payloads.
3. Add a local deterministic recommendation runner. It must not call a real AI provider or read provider credentials.
4. Extend the admin AI audit runtime repository and route handlers for model config enable/disable. API responses must remain `{ code, message, data, pagination? }` and must not expose API keys, secrets, raw prompts, raw model output, session tokens, or numeric IDs.
5. Wire the Next.js route files under allowed `model-configs/**` and `questions/**`.

## Scope Conflict And Risk Handling

- The requirement mentions asynchronous recommendation and writing question-to-knowledge-node bindings. The current queue blocks `drizzle/**` and schema changes, and the existing schema has no question knowledge-node binding or recommendation persistence table.
- This task will therefore implement a local deterministic runtime action that returns pending-confirmation candidates and records `ai_call_log` plus `audit_log`. It will not add migrations, hidden persistence, or expand beyond allowed files.
- Automatic async recommendation on first save remains a residual risk until a later schema/queue task approves persistence and queue infrastructure.

## Validation Commands

Required by task queue:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-TaskClaimReadiness.ps1 -TaskId phase-9-ai-knowledge-model-config-runtime
npm.cmd run test:unit
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1
npm.cmd run build
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Focused TDD commands will be recorded in evidence.
