# 2026-07-08 Organization AI Generation RAG Scope

## Task

- id: `org-ai-generation-rag-scope-2026-07-08`
- branch: `codex/org-ai-generation-rag-scope`
- approval: `current_user_approved_five_stage_org_ai_training_loop_contract_to_regression_2026_07_08`
- stage: `2 / 5`

## Scope

Only align local owner-preview RAG scope resolution for organization/content AI出题 and AI组卷.

Allowed:

- Carry `subject`, selected `knowledgeNodePublicIds`, and `includeDescendants` into the local RAG retrieval scope.
- Make AI组卷 use the same structured knowledge-node scope as AI出题.
- Add focused unit coverage for request-to-RAG scope and local resource filtering behavior.

Blocked:

- No Provider execution.
- No DB connection or DB mutation.
- No schema, migration, seed, or fixture change.
- No organization training publish/materialization change.
- No formal `question`, `paper`, `mock_exam`, `exam_report`, or `mistake_book` write.
- No package or lockfile change.
- No env, secret, credential, cookie, token, raw Provider payload, raw prompt, raw AI output, raw DB row, or complete material/question/paper evidence.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/05-rag-knowledge.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.ts`
- `src/server/services/rag-resource-knowledge-runtime.ts`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts`
- `src/server/services/rag-retrieval-service.ts`
- `src/server/repositories/content-knowledge-node-runtime-repository.ts`
- `src/server/services/ai-generation-knowledge-node-options-route.ts`

## Requirement Mapping Result

- Mapped to `docs/01-requirements/modules/05-rag-knowledge.md`: RAG retrieval must scope by profession and level, must not fabricate citations, and must preserve insufficient-evidence semantics.
- Mapped to `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`: `org_advanced_admin` AI generation output remains organization-owned and evidence must stay redacted.
- Mapped to `docs/01-requirements/advanced-edition/modules/04-organization-training.md` only as downstream boundary context; this phase does not modify organization training drafts, publish, employee answer, or analytics.
- Mapped to `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`: this is the RAG-scope preparation step before draft materialization and publish loop work.
- Mapped to `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`: AI组卷 scope must use structured knowledge coverage and subject/scope parameters before local paper assembly.
- No unresolved requirement conflict was found for carrying existing UI/API parameters into local owner-preview RAG retrieval. Runtime descendant expansion from the database knowledge tree remains outside this branch and requires separate approval if needed.

## Implementation Plan

1. Add failing unit tests:
   - owner-preview grounding passes selected knowledge-node public ids for AI组卷, not only AI出题.
   - local resource RAG retrieval can include descendant-bound resource bindings when `includeDescendants` is enabled.
2. Add a small RAG scope value object near the local resource retrieval input.
3. Keep exact-node behavior unchanged when `includeDescendants` is false.
4. Preserve current no-scope behavior when no selected knowledge nodes exist.
5. Run focused tests, lint, typecheck, `git diff --check`, Module Run v2 hardening and pre-push readiness.

## Risk Controls

- Do not invent knowledge-tree DB traversal in this branch. If runtime descendant resolution needs DB-only tree data, stop and split a separately approved task.
- Local catalog descendant matching may only use already-present resource knowledge-node bindings and selected public ids.
- Evidence records command status and file-level symbols only; no raw content.
