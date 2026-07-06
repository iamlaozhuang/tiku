# 2026-07-06 0704 Local Grounding Materialization Replay Audit Review

## Review Scope

- Task: `0704-local-grounding-materialization-replay-2026-07-06`
- Review mode: adversarial local replay audit.
- Scope: local `.runtime/uploads` resource materialization and exact no-Provider grounding resolver validation.
- Non-scope: source repair, DB mutation, Provider execution, browser walkthrough, staging/prod, deploy, Cost Calibration, release readiness, production usability.

## Findings

### Finding 1: Missing local materialization was reproducible

- Severity: acceptance blocker for fresh local Provider-enabled generation, not a source-code defect by itself.
- Evidence: initial `.runtime/uploads` file count was `0`; catalog was absent.
- Impact: owner-preview grounding has no local `rag_ready` resources to retrieve, so generation can block before Provider credentials are relevant.
- Current status: closed for local replay. The replay materialized `5` `rag_ready` resources and `5` active chunks under `.runtime/uploads/dev/resource/`.

### Finding 2: Catalog enum mismatch would silently invalidate replay resources

- Severity: high for evidence reliability.
- Evidence: first replay artifact used a non-project `resourceType`; the exact runtime normalizer dropped those entries and both exact resolver queries returned `evidenceStatus=none`.
- Root cause: local artifact schema mismatch, not confirmed product source logic failure.
- Current status: closed locally. Catalog entries now use the project enum `knowledge_doc`, and the exact resolver returns `sufficient` for both AI出题 and AI组卷 query labels.

## Validated Outcome

| Query label              | Status       | Citation count | Max score |
| ------------------------ | ------------ | -------------- | --------- |
| `ai_question_generation` | `sufficient` | `3`            | `1`       |
| `ai_paper_generation`    | `sufficient` | `3`            | `1`       |

The validation imported the real `buildLocalResourceRagRetrievalResult` function through temporary Vitest files. Temporary files were removed after execution.

## Residual Risk

- `.runtime` is a local untracked artifact. A fresh checkout or cleaned runtime directory will need materialization again.
- This replay did not call Provider and does not prove structured preview parsing, generated quantity, or closed-loop business actions.
- This replay did not start localhost, run browser matrix, or mutate the 0704 DB.
- Runtime-only metadata tokens were added to align with the current deterministic local retriever; this is acceptable for local replay but should not be interpreted as production RAG corpus quality.

## Boundary Confirmation

- Source changed: false.
- Test source changed permanently: false.
- Dependency changed: false.
- Package/lockfile changed: false.
- DB mutation executed: false.
- Provider call executed: false.
- Env/secret changed: false.
- Staging/prod/deploy executed: false.
- Cost Calibration executed or claimed: false.
- Raw fixture/content/chunk/provider/prompt/AI output recorded: false.

## Review Conclusion

Local grounding materialization replay is credible for the narrow no-Provider resolver question: with a valid local `knowledge_doc` catalog, the current resolver can produce sufficient grounding for the 0704 marketing level 3 AI出题 and AI组卷 queries.

It is not a release or Provider-readiness conclusion.
