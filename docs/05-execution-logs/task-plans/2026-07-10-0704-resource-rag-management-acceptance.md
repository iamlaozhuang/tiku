# 2026-07-10 0704 Resource RAG Management Acceptance Plan

## Scope

- taskId: `0704-resource-rag-management-acceptance-2026-07-10`
- branch: `codex/0704-resource-rag-management-acceptance`
- mode: validation-only localhost/source/test acceptance
- goal: prove resource lifecycle, `knowledge_node` binding, RAG eligibility, citation, and `evidence_status` boundaries without browser login, direct DB, Provider, staging/prod/deploy, env/secret, package, lockfile, schema, migration, or seed work.

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/ai-rag-contract.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/stories/epic-05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-content-resource-management-ui-ux-contract.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-07-08-knowledge-node-resource-ai-closure-plan.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent 2026-07-08 knowledge/resource/RAG and 2026-07-10 RAG citation smoke evidence/audit

## Readiness

- Private credential index preflight: metadata-only, pass, 9 core role labels found.
- Credential values output: none.
- Browser login, direct DB access, Provider execution, staging/prod/deploy/env/secret/Cost Calibration: blocked.

## Acceptance Targets

- `content_admin` and `super_admin` own first-release resource and `knowledge_node` write surfaces.
- `ops_admin`, organization admins, employees, learners, and unauthenticated users cannot write global resource or knowledge base state.
- Resource lifecycle exposes upload/draft/review/publish/rebuild/disable/enable states and keeps failed or unpublished resources out of new RAG use.
- Published and RAG-ready resources can be consumed only through authorized, redaction-safe citation metadata.
- `knowledge_node`, `resource`, `citation`, and `evidence_status` are carried through RAG-capable AI paths as structured categories.
- `evidence_status = none` does not fabricate citations; `weak` shows degradation or explicit confirmation behavior.
- Evidence excludes full resource, Markdown body, chunk text, raw Prompt, raw AI output, Provider payload, internal ids, credentials, sessions, DB rows, and plaintext `redeem_code`.

## Validation Plan

1. Inspect source and route/test markers for resource workspace ownership, write role separation, lifecycle state transitions, `knowledge_node` bindings, RAG retrieval filters, citation DTOs, and `evidence_status` handling.
2. Run focused tests for content resource management UI, resource/knowledge runtime, RAG retrieval governance, schema/model/mapper validators, and AI knowledge/citation integration.
3. Record only redacted role labels, route/control labels, state categories, command names, and test counts.
4. If a true product defect is found, stop this validation task, record redacted evidence, and open a separate repair branch before continuing the queue.

## Adversarial Review Checklist

- Role boundary: non-content roles do not retain global resource or knowledge-base write paths.
- Data boundary: direct files, Markdown bodies, chunks, embeddings, object storage paths, and raw content are not exposed to unauthorized surfaces or evidence.
- RAG boundary: disabled, unpublished, failed, or unauthorized resources do not enter new retrieval or prompt context.
- Citation boundary: visible references are redaction-safe citation metadata only.
- Evidence status boundary: server/system categories drive behavior; model/client output cannot fabricate `evidence_status`.
- Standard/advanced boundary: advanced AI consumption of resources does not grant standard users advanced AI capability or organization admins learner raw AI data.

## Planned Gates

- metadata-only private credential index preflight
- source marker summary checks
- focused `vitest` pack
- `corepack pnpm@10.26.1 prettier --write --ignore-unknown` on scoped docs
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- Module Run v2 pre-commit hardening
- Module Run v2 pre-push readiness
