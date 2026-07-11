# 2026-07-10 0704 Code Readonly Preview Risk Assessment Plan

## Task

- taskId: `0704-code-readonly-preview-risk-assessment-2026-07-10`
- branch: `codex/0704-code-readonly-preview-risk-assessment`
- taskKind: `docs_code_readonly_preview_risk_assessment`
- mode: product code read-only, docs/state/evidence writable

## Objective

Assess whether the current code implementation has enough engineering confidence to enter online preview preparation. The result must be one of:

- `code_ready_for_preview_preparation`
- `defer_code_review_findings`
- `block_preview_preparation`

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-localhost-acceptance-summary-archive.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-project-reality-preview-readiness-assessment.md`

## Code Read Surface

Read-only source/test/config surface:

- `src/app/api/v1/**`
- `src/server/services/**`
- `src/server/repositories/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/mappers/**`
- `src/features/**`
- `tests/**`
- safe package/config/script metadata without reading env or secret values

## Assessment Dimensions

Score every dimension as `pass`, `defer`, or `block`:

1. Authorization and edition boundary
2. Role and route boundary
3. Multitenancy and organization boundary
4. Data-domain separation
5. AI/RAG safety boundary
6. Log and privacy boundary
7. Exception and degradation behavior
8. API contract consistency
9. Input validation and safety
10. Frontend state completeness
11. Config and environment assumptions
12. Data model and migration consistency
13. Test coverage credibility
14. Build and runtime risk
15. Dependency and supply-chain risk

## Validation Commands

- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- targeted unit tests selected from the code-risk dimensions
- `git diff --check`
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness with remote-ahead skip

## Boundaries

This task must not:

- modify source, tests, package/lock, schema, migration, seed, scripts, or env files;
- read `.env`, secrets, token, cookie, session, DB URL, or provider credentials;
- connect to DB;
- run browser login, screenshots, trace, or raw DOM inspection;
- execute Provider, staging, production, deployment, Cost Calibration, or external services;
- output credentials, raw DB rows, internal ids, raw prompt, raw AI output, full question/paper/material/resource/chunk, employee raw answer, or plaintext `redeem_code`.

## Deliverables

- `docs/05-execution-logs/acceptance/2026-07-10-0704-code-readonly-preview-risk-assessment.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-code-readonly-preview-risk-assessment-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-code-readonly-preview-risk-assessment-audit.md`
