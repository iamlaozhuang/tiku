# unified-repair-rag-knowledge-layering-retrieval-governance Task Plan

## Task

- Task id: `unified-repair-rag-knowledge-layering-retrieval-governance`
- Branch: `codex/unified-repair-rag-knowledge-layering-retrieval-governance`
- Date: 2026-06-14
- Mode: strict serial repair task

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-ai-rag-governed-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-code-audit-findings-rollup-and-repair-queue-seeding.md`

## Scope

Allowed implementation surfaces are limited to:

- `src/app/(admin)/ops/resources/**`
- `src/app/(admin)/content/knowledge-nodes/**`
- `src/server/services/rag-knowledge/**`
- `src/server/repositories/rag-knowledge/**`
- `src/server/contracts/rag-knowledge/**`
- `src/server/mappers/rag-knowledge/**`
- `src/server/validators/rag-knowledge/**`
- `tests/unit/rag-knowledge/**`

Governance outputs are limited to state, queue, task plan, evidence, and audit/review files.

## Blocked Boundaries

- No `.env.local`, `.env.*`, secret, provider configuration, token, or database URL access.
- No real provider/model request, quota use, prompt/answer payload, vector provider execution, storage/file access, or RAG execution.
- No schema, migration, `src/db/schema/**`, or `drizzle/**` edits.
- No dependency, `package.json`, or lockfile edits.
- No e2e, staging/prod/cloud/deploy, payment, external-service, PR, force-push, or Cost Calibration work.
- If implementation requires a blocked surface, stop and record evidence instead of widening scope.

## TDD Plan

1. Add `tests/unit/rag-knowledge/rag-layering-retrieval-governance.test.ts` first.
2. RED assertions:
   - scoped `rag-knowledge` contract/service/repository/mapper/validator modules exist and expose a retrieval governance boundary;
   - retrieval requests require profession, level, authorized resources, resource status, and allowed AI function context before producing citation-safe metadata;
   - evidence output contains `evidenceStatus`, Top 3 citation source metadata, stale citation markers, and redacted evidence summary without raw chunk text, private file URL, embedding vectors, provider payload, prompt, answer, secret, token, database URL, or row data;
   - blocked provider/vector/storage/schema execution is represented as a blocked handoff instead of performing work.
3. Run the target unit test and record the expected RED failure.
4. Implement the minimum scoped contract/service/repository/mapper/validator needed for GREEN.
5. Re-run the target unit test and required validation commands.

## Validation Commands

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit -- tests/unit/rag-knowledge/rag-layering-retrieval-governance.test.ts`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-repair-rag-knowledge-layering-retrieval-governance`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-repair-rag-knowledge-layering-retrieval-governance`

## Risk Defense

- Keep route-facing behavior behind thin scoped services per ADR-002.
- Reuse existing public identifier and camelCase DTO patterns; do not expose numeric ids.
- Preserve standard `{ code, message, data, pagination? }` API response shape for handler-level returns.
- Keep evidence redacted: only command names, pass/fail state, counts, sanitized citation metadata, and hashes.
- Do not touch existing root RAG/provider/schema/storage files unless they are within the task allowedFiles.
