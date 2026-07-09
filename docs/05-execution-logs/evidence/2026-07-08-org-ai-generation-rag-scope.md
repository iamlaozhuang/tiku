# 2026-07-08 Organization AI Generation RAG Scope Evidence

Task id: `org-ai-generation-rag-scope-2026-07-08`

Branch: `codex/org-ai-generation-rag-scope`

Result: source validation pass, closeout pending at initial evidence creation.

## Scope

Implemented local owner-preview RAG scope alignment only:

- AI出题 and AI组卷 grounding now both pass selected knowledge-node public ids.
- Grounding passes `subject` and `includeDescendants` to local resource retrieval.
- Local resource retrieval can filter by optional local resource `subject`.
- Local resource retrieval can include resources that explicitly declare selected-node ancestor bindings when `includeDescendants` is enabled.

## Requirement Mapping Result

- Mapped to `docs/01-requirements/modules/05-rag-knowledge.md` for scoped RAG retrieval and non-fabricated citation behavior.
- Mapped to `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md` for organization-owned AI generation and redacted evidence boundaries.
- Mapped to `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md` as the RAG-scope preparation step before enterprise training draft materialization.
- Mapped to `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md` for AI组卷 structured knowledge coverage and local assembly preparation.
- Organization training publish/materialization remains out of scope for this stage.

## RED Evidence

Command:

```text
corepack pnpm@10.26.1 exec vitest run src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts
```

Status: expected fail before implementation.

Redacted failure summary:

- owner-preview grounding input lacked `subject`.
- AI组卷 grounding did not carry selected knowledge-node public ids.
- local retrieval did not match explicitly declared descendant knowledge-node ancestor bindings.

## GREEN Evidence

Command:

```text
corepack pnpm@10.26.1 exec vitest run src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts
```

Status: pass.

Summary: 2 files / 13 tests passed.

Command:

```text
corepack pnpm@10.26.1 exec vitest run src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts tests/unit/phase-20-ra-05-06-vector-rebuild-stale-marker.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts
```

Status: pass.

Summary: 6 files / 90 tests passed.

Command:

```text
corepack pnpm@10.26.1 run lint
```

Status: pass.

Command:

```text
corepack pnpm@10.26.1 run typecheck
```

Status: pass.

Command:

```text
git diff --check
```

Status: pass.

Command:

```text
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-ai-generation-rag-scope-2026-07-08
```

Status: pass.

## Boundary Evidence

- Provider call executed: no.
- Direct DB connection executed: no.
- DB mutation executed: no.
- Schema, migration, seed, or fixture changed: no.
- Package or lockfile changed: no.
- Organization training publish/materialization changed: no.
- Formal content write path changed: no.
- Browser/runtime screenshot/DOM/localStorage/session capture: no.
- Sensitive values, raw Provider payloads, raw prompts, raw AI output, raw DB rows, internal numeric ids, complete material/question/paper/chunk content recorded: no.

## Residual Boundary

This branch does not invent knowledge-tree traversal. Descendant matching is only applied when the local resource catalog already provides explicit ancestor public-id bindings. If runtime tree expansion from selected nodes is required, it must be handled in a separate approved branch with repository and DB-read boundaries reviewed first.
