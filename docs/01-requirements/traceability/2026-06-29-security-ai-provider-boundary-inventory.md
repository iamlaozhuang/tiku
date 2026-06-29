# Security AI Provider Boundary Inventory Traceability

- Task id: `security-ai-provider-boundary-inventory-2026-06-29`
- Branch: `codex/security-ai-provider-boundary-inventory-20260629`
- Scope: source-read-only AI/Provider boundary inventory
- Provider budget: zero
- Status: closed_pending_validation

## Governance Boundary

| Boundary                                      | Status       | Evidence                                                                          |
| --------------------------------------------- | ------------ | --------------------------------------------------------------------------------- |
| Task materialized before inventory writes     | pass         | state, queue, and task plan created before scoped inventory docs                  |
| Source/test modification                      | not executed | docs/state-only inventory task                                                    |
| Provider/AI execution                         | not executed | no Provider call, no runtime Provider configuration, no prompt or payload capture |
| DB/schema/migration/seed                      | not executed | source-read-only inventory only                                                   |
| Browser/dev server/runtime                    | not executed | blocked by task boundary                                                          |
| Dependency/package/lockfile                   | not executed | blocked by task boundary                                                          |
| Release readiness/final Pass/Cost Calibration | not executed | all gates remain blocked                                                          |
| Sensitive evidence capture                    | not executed | evidence records paths, counts, boundary labels, and redacted summaries only      |

## Surface Index

| Surface                        | Count | Inventory Use                                              |
| ------------------------------ | ----: | ---------------------------------------------------------- |
| `src/ai/**`                    |     3 | prompt template and mock Provider module path index only   |
| `src/rag/**`                   |     4 | RAG module path index only                                 |
| `src/server/services/**`       |   260 | selected AI/Provider boundary services and focused tests   |
| `src/app/api/v1/**`            |   116 | route path inventory for AI/model/prompt/provider surfaces |
| `tests/unit/ai/**`             |     1 | Provider redaction contract unit surface                   |
| controlled runner path matches |    10 | route/runtime bridge gate coverage review                  |

## Findings Matrix

| Id                  | Risk Family                                       | Severity | Status                     | Evidence Summary                                                                                                                                                                                      | Follow-up                                                                               |
| ------------------- | ------------------------------------------------- | -------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| ai-provider-inv-001 | Provider execution without explicit gate          | medium   | covered_watch              | Default route-integrated Provider outcome is blocked; controlled runner paths require explicit local switch and injected control; existing focused tests cover default blocked and fake-runner paths. | No duplicate repair task seeded; monitor through future AI runtime tasks.               |
| ai-provider-inv-002 | Provider error snapshot redaction                 | medium   | closed_existing_regression | Existing `verify-ai-provider-error-snapshot-redaction-2026-06-29` evidence and acceptance are pass; no raw Provider error/prompt/payload evidence recorded here.                                      | None.                                                                                   |
| ai-provider-inv-003 | Provider payload/prompt/raw AI IO evidence        | medium   | covered_watch              | Redaction helpers and Provider redaction contract paths exist; inventory recorded only function/path/status categories, not prompt text or payload values.                                            | None unless future task changes AI call logging.                                        |
| ai-provider-inv-004 | Model config runtime metadata boundary            | low      | monitor                    | Redacted metadata snapshot path exposes metadata labels only; naming around provider metadata remains a low-severity watch item, not a confirmed secret exposure.                                     | Optional future naming-hardening review if product owners want clearer metadata labels. |
| ai-provider-inv-005 | Historical Provider smoke / Cost Calibration docs | medium   | blocked_by_current_goal    | Historical evidence exists, but current goal forbids resuming Provider smoke, Cost Calibration, release readiness, or final Pass.                                                                     | None in this goal.                                                                      |

## Next Recommended Task

The next smallest safe security task is the already queued
`security-db-schema-migration-risk-inventory-2026-06-29`.

It must be separately materialized before execution and must remain source/read-only with no DB connection, no migration,
no seed, no schema change, no release gate, and no sensitive evidence capture.
