# 2026-07-08 Organization AI Generation RAG Scope Audit

Task id: `org-ai-generation-rag-scope-2026-07-08`

Branch: `codex/org-ai-generation-rag-scope`

## Adversarial Review

### Scope Creep

- Checked: no organization training draft creation, publish, employee answer, formal content adoption, Provider execution, DB access, schema, migration, seed, fixture, package, or lockfile change.
- Result: pass.

### Role And Edition Boundary

- Checked: change is in owner-preview grounding and local resource retrieval only. It does not grant standard roles AI capability and does not change authorization checks.
- Result: pass.

### RAG Scope Accuracy

- Checked: AI组卷 now carries the same selected knowledge-node public-id scope as AI出题.
- Checked: `subject` is a structured retrieval input, not only query text.
- Checked: `includeDescendants` is explicit in retrieval input.
- Checked: descendant matching is constrained to catalog entries that already declare ancestor public-id bindings.
- Residual: this branch intentionally does not infer descendants from the database knowledge tree.
- Result: pass with documented residual.

### Sensitive Information

- Checked: code and evidence do not expose credentials, env values, session/cookie/token/localStorage values, DB URLs, raw DB rows, Provider payloads, raw prompts, raw AI output, complete material/question/paper/chunk text, or internal numeric ids.
- Result: pass.

### Regression Risks

- Checked: no change to Provider instruction text or execution flow beyond grounding scope input.
- Checked: local resources without `subject` remain generic and still eligible for matching.
- Checked: exact knowledge-node filtering remains unchanged when `includeDescendants` is false.
- Checked: existing vector rebuild stale-marker tests remain green.
- Result: pass.

## Verification Summary

- RED targeted tests failed for expected missing scope behavior.
- GREEN targeted tests passed: 2 files / 13 tests.
- Adjacent regression tests passed: combined 6 files / 90 tests.
- `lint`: pass.
- `typecheck`: pass.
- `git diff --check`: pass.

## Decision

The branch is suitable for Module Run v2 hardening and closeout after state/evidence formatting and hardening checks pass.
