# Unified Standard MVP AI/RAG Governed Code Audit Review

## Review Decision

APPROVE WITH FINDINGS. The read-only audit completed within the approved scope. Findings must be carried forward to
later scoped remediation, implementation, or audit-expansion tasks; this task does not approve fixes.

## Scope Review

- Task id: `unified-standard-mvp-ai-rag-governed-code-audit`
- Scope: read-only code audit for standard AI scoring/explanation/hint, knowledge recommendation, RAG knowledge-base,
  and provider-gate boundaries.
- Approved writes:
  - `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
  - `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
  - `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Findings

### P1: Scoped AI/RAG service layering is not represented

- Reference: queued `src/server/services/ai-scoring/**`, `src/server/services/rag-knowledge/**`,
  `src/server/repositories/rag-knowledge/**`, `src/server/contracts/rag-knowledge/**`,
  `src/server/mappers/rag-knowledge/**`, and `src/server/validators/rag-knowledge/**` directories are missing.
- Risk: ADR-002 ownership boundaries for `ai_scoring`, `ai_explanation`, `ai_hint`, `kn_recommendation`,
  `knowledge_base`, `chunk`, `embedding`, `citation`, and `evidence_status` cannot be confirmed from the approved
  scoped modules.
- Boundary: service, repository, contract, mapper, validator, route, schema, provider, RAG, and UI work remain blocked.

### P1: Mock provider constructs raw provider payload fields without a visible redaction boundary

- Reference: `src/ai/mock-provider.ts:16`, `src/ai/mock-provider.ts:17`, and
  `src/ai/mock-provider.ts:46` through `src/ai/mock-provider.ts:53`.
- Risk: if the mock provider shape is reused by runtime logging, tests, or future provider adapters without a hard
  redaction boundary, raw prompt, answer, secret-like, provider request, or provider response data could leak into logs
  or evidence.
- Boundary: provider adapter changes, logging changes, prompt rewrites, secret remediation, tests, provider calls,
  env/secret access, and implementation remain blocked.

### P2: AI function naming differs between prompt registry and admin AI/log UI

- Reference: `src/ai/prompts/templates.ts:16`, `src/ai/prompts/templates.ts:31`,
  `src/ai/prompts/templates.ts:47`,
  `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx:63`,
  `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx:82`,
  `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx:114`, and
  `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx:472`.
- Risk: prompt template, model configuration, AI call log, and UI filtering may drift if both naming styles are accepted
  without an explicit mapper.
- Boundary: enum, contract, mapper, UI, prompt template, and migration changes remain blocked.

### P1: RAG retrieval, rerank, evidence status, and authorization filtering cannot be verified in scope

- Reference: queued RAG layer directories are missing; `src/app/(admin)/ops/resources/page.tsx:1` and
  `src/app/(admin)/content/knowledge-nodes/page.tsx:1` delegate out of scope; the content ops baseline only updates UI
  state for vector rebuild confirmation.
- Risk: hybrid keyword/vector retrieval, rerank fallback, Top 3 citation selection, `evidence_status`, resource state
  transitions, private file access, authorization filters, and vector rebuild behavior cannot be confirmed.
- Boundary: feature-module inspection outside scope, vector provider work, RAG execution, storage, schema/migration,
  file access, env/secret, provider, and implementation remain blocked.

### P2: Admin AI model configuration is visible only as a frontend runtime surface

- Reference: `src/app/(admin)/ops/ai-audit-logs/page.tsx:4` and
  `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx:347` through
  `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx:477`.
- Risk: frontend model-config and log surfaces are visible, but backend authorization, storage encryption, audit
  logging, redaction, provider execution blocking, cost calculation, and secret lifecycle cannot be verified from this
  task scope.
- Boundary: provider configuration read, env/secret read, provider/model request, API inspection outside scope,
  implementation, quota use, and cost calibration remain blocked.

### P3: Advanced AI generation route remains outside standard MVP AI/RAG scope

- Reference: `src/app/(student)/ai-generation/page.tsx:1`.
- Risk: route presence must not be treated as standard MVP AI generation approval, provider execution approval, or
  standard MVP AI/RAG coverage.
- Boundary: advanced AI generation, provider, quota, Cost Calibration, and feature inspection remain blocked.

## Boundary Checks

- No source code was modified.
- No tests, e2e, scripts, schema, migration, package, lockfile, env, secret, provider configuration, deploy, payment, or
  external-service file was modified.
- No real provider call, model request, RAG execution, vector provider work, quota use, PR, force-push, or deployment was
  executed.
- Cost Calibration Gate remains blocked.
- No task after this task was claimed.

## Validation Review

- `git diff --check`: pass.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `Test-GitCompletionReadiness.ps1 -BaseBranch master`: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-mvp-ai-rag-governed-code-audit`: pass.
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-mvp-ai-rag-governed-code-audit`: pass.
