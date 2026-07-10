# 2026-07-10 0704 RAG Citation Smoke Plan

## Task

- Task id: `0704-rag-citation-smoke-2026-07-10`
- Branch: `codex/0704-rag-citation-smoke`
- Goal: validate current `knowledge_node`, resource citation, citation count, and `evidence_status` propagation with targeted local contract smoke only.

## Read Gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-generation-rag-scope.md`
- `docs/05-execution-logs/evidence/2026-07-08-knowledge-node-ai-final-regression-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-08-knowledge-node-ai-cross-role-regression-evidence.md`
- Relevant source/test entrypoints under `src/server/services/*rag*`, route-integrated provider services, and knowledge-node regression tests.

## Boundary

- No product source or test source change is planned.
- No Provider execution, Provider configuration read/write, raw prompt, raw AI output, browser, screenshot, raw DOM, dev server, direct DB connection, DB mutation, schema, migration, seed, dependency, package, lockfile, staging/prod/deploy, or Cost Calibration.
- Private credential files are used only for redacted readiness preflight. Evidence records role labels and readiness categories only.
- Evidence must not include credentials, sessions, cookies, tokens, localStorage, Authorization headers, env values, DB URL, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, complete question/paper/material/resource/chunk content, or employee raw answers.

## Validation Plan

1. Run redacted 9-role readiness preflight from the canonical private catalog.
2. Run targeted contract smoke:
   - `tests/unit/knowledge-node-ai-cross-role-regression.test.ts`
   - `tests/unit/knowledge-node-ai-final-regression.test.ts`
   - `src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`
   - `tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts`
   - `src/server/services/route-integrated-provider-instruction-service.test.ts`
   - `src/server/services/route-integrated-provider-execution-service.test.ts`
   - `src/server/services/admin-ai-generation-local-contract-route.test.ts`
   - `src/server/services/ai-paper-route-source-resolution-service.test.ts`
   - `tests/unit/ai-generation-knowledge-node-options-route.test.ts`
   - `src/server/services/personal-ai-generation-request-route.test.ts`
   - `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts`
3. Update redacted evidence and adversarial audit.
4. Run scoped Prettier, `git diff --check`, blocked path diff guard, lint, typecheck, and Module Run v2 pre-commit/pre-push.

## Adversarial Review Focus

- Standard roles must not gain advanced AI/RAG generation capability.
- Admin workspaces must not leak learner AI raw results, raw chunks, raw prompts, or Provider payloads.
- `evidence_status = none` must remain a block/insufficient category for adoption-sensitive flows.
- Citation DTOs exposed outside internal AI context must remain redacted to resource title/path/status/count categories, not raw chunk text.
- AI组卷 structured preview must keep knowledge coverage and paper-structure constraints without embedding final question text.
