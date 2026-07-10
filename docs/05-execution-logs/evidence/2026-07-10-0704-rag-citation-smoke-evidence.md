# 2026-07-10 0704 RAG Citation Smoke Evidence

Task id: `0704-rag-citation-smoke-2026-07-10`

Branch: `codex/0704-rag-citation-smoke`

## Scope

Validation-only targeted contract smoke for current `knowledge_node`, RAG resource citation, citation count, and
`evidence_status` propagation. This run did not repeat closed full AI generation chains.

## Redacted Readiness Preflight

| Role label                  | Readiness category    |
| --------------------------- | --------------------- |
| `super_admin`               | `ready_0704_verified` |
| `ops_admin`                 | `ready_0704_verified` |
| `content_admin`             | `ready_0704_verified` |
| `personal_standard_student` | `ready_0704_verified` |
| `personal_advanced_student` | `ready_0704_verified` |
| `org_standard_admin`        | `ready_0704_verified` |
| `org_advanced_admin`        | `ready_0704_verified` |
| `org_standard_employee`     | `ready_0704_verified` |
| `org_advanced_employee`     | `ready_0704_verified` |

## Smoke Result

Command:

```text
corepack pnpm@10.26.1 exec vitest run tests/unit/knowledge-node-ai-cross-role-regression.test.ts tests/unit/knowledge-node-ai-final-regression.test.ts src/server/services/owner-preview-qwen-visible-ai-runtime-control.test.ts tests/unit/phase-11-resource-knowledge-base-publish-index-loop.test.ts src/server/services/route-integrated-provider-instruction-service.test.ts src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/ai-paper-route-source-resolution-service.test.ts tests/unit/ai-generation-knowledge-node-options-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts
```

Result: pass, 11 files / 153 tests.

## Coverage Categories

| Category                                                                                                         | Status |
| ---------------------------------------------------------------------------------------------------------------- | ------ |
| Approved advanced AI roles share structured `knowledge_node` scope normalization                                 | pass   |
| Standard organization AI route boundary remains unavailable/denied                                               | pass   |
| Content and operations admin workspaces remain separated                                                         | pass   |
| Owner-preview RAG grounding passes task type, profession, level, subject, selected node ids, and descendant flag | pass   |
| Local RAG retrieval filters by `rag_ready`, subject, and declared knowledge-node scope                           | pass   |
| External citation source DTO excludes raw chunk text and text hashes                                             | pass   |
| Route-integrated instruction/output contract preserves citation and knowledge coverage constraints               | pass   |
| Visible generated-content draft acceptability requires sufficient evidence and parsed structured preview         | pass   |
| AI组卷 structured preview keeps `knowledgeCoverage` and `paperStructure` validation                              | pass   |

## Validation

| Command                               | Result          |
| ------------------------------------- | --------------- |
| targeted RAG/citation smoke           | pass            |
| scoped Prettier write                 | pass            |
| scoped Prettier check                 | pass            |
| `git diff --check`                    | pass            |
| blocked path diff guard               | pass, no output |
| `corepack pnpm@10.26.1 run lint`      | pass            |
| `corepack pnpm@10.26.1 run typecheck` | pass            |
| Module Run v2 pre-commit hardening    | pass            |
| Module Run v2 pre-push readiness      | pass            |

## Safety

- Provider call executed: no.
- Browser, screenshot, trace, or raw DOM executed: no.
- Direct DB connection or DB mutation executed: no.
- Schema, migration, seed, source, test, package, or lockfile changed: no.
- Staging/prod/deploy/payment/Cost Calibration executed: no.
- Evidence contains no credentials, session, cookie, token, env value, DB URL, raw DB rows, internal numeric ids, Provider payload, raw prompt, raw AI output, full question, full paper, full material, full resource, full chunk, plaintext `redeem_code`, or employee raw answer.
