# Security AI Model Config Fallback Order Limit Repair Traceability

- Task id: `security-ai-model-config-fallback-order-limit-repair-2026-06-29`
- Finding id: `db-query-002`
- Branch: `codex/security-ai-fallback-order-limit-20260629`
- Status: implementation complete, validation in progress
- Cost Calibration Gate remains blocked.

## Source Finding

| Source                                                        | Finding                                                                                                   | Severity | Repair target                                         |
| ------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- | -------- | ----------------------------------------------------- |
| `security-db-repository-query-construction-review-2026-06-29` | `model_config.reorder_fallback` accepted any positive item count before a per-item repository update loop | medium   | validator-level item limit before repository mutation |

## Requirement Mapping

| Requirement                                                                                                              | Implementation evidence                                                                                  | Verification evidence                          |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Oversized fallback reorder payloads are rejected before repository work                                                  | `src/server/validators/ai-rag.ts` adds a 100 item limit in `normalizeModelConfigFallbackOrderInput`      | validator and route/runtime focused unit tests |
| Legitimate fallback reorder payloads remain accepted                                                                     | existing model config runtime test plus validator test for 100 accepted items                            | focused unit test GREEN                        |
| Route/runtime does not call repository for oversized payloads                                                            | `tests/unit/phase-12-model-config-server-runtime.test.ts` asserts mutation and audit arrays remain empty | focused unit test GREEN                        |
| No DB, Provider, browser, dependency, schema, migration, seed, release readiness, final Pass, or Cost Calibration action | task plan, evidence, and validation command inventory                                                    | governance gates in progress                   |

## Scope Control

- Source/test changed:
  - `src/server/validators/ai-rag.ts`
  - `src/server/validators/ai-rag.test.ts`
  - `tests/unit/phase-12-model-config-server-runtime.test.ts`
- Governance docs/state changed:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-06-29-security-ai-model-config-fallback-order-limit-repair.md`
  - this traceability file
  - task evidence, audit, and acceptance files

## Residual Risk

- This task fixes the fallback reorder item-count boundary only.
- Employee import bulk limits remain a separate queued task.
- Runtime DB behavior was not executed because DB access is blocked for this task.
