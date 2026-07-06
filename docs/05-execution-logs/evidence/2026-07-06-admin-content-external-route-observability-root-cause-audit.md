# 2026-07-06 Admin Content External Route Observability Root-Cause Audit Evidence

## Scope

- Task: `admin-content-external-route-observability-root-cause-audit-2026-07-06`
- Branch: `codex/admin-content-route-observability-audit-2026-07-06`
- Goal: explain why content/admin and organization/admin external AI generation routes returned `409015` without runtimeBridge details while the admin bridge replay reached `missing_provider_credential`.
- Boundary: source inspection plus existing unit tests only; no source fix, no DB operation, no dev server, no Provider call, no staging/prod/deploy, no Cost Calibration.

## Read Gate

- Read `AGENTS.md`.
- Read `docs/04-agent-system/state/project-state.yaml`.
- Read `docs/04-agent-system/state/task-queue.yaml`.
- Read `docs/03-standards/code-taste-ten-commandments.md`.
- Read `docs/02-architecture/adr/*.md`.
- Read requirements indexes and edition-aware authorization requirements.
- Read AI generation traceability files dated 2026-07-02 and 2026-07-05.
- Read latest 0704 no-Provider route grounding replay evidence/audit.

## Source Trace

| Area                             | File/lines                                                                                                                                      | Observation                                                                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Route handlers                   | `src/app/api/v1/content-ai-generation-requests/route.ts`, `src/app/api/v1/organization-ai-generation-requests/route.ts`                         | Both routes use shared admin local contract handlers with owner-preview admin runtime bridge control.                                                                          |
| Static error                     | `src/server/services/admin-ai-generation-local-contract-route.ts:125`, `:143-145`                                                               | `409015` maps to a single static message: admin generation requires sufficient grounded structured output.                                                                     |
| Bridge invocation                | `src/server/services/admin-ai-generation-local-contract-route.ts:580`, `:721-723`                                                               | POST path resolves runtimeBridge before result acceptability check.                                                                                                            |
| Acceptability gate               | `src/server/services/admin-ai-generation-local-contract-route.ts:742-747`                                                                       | If visible generated content is not acceptable, route returns static `409015` response and does not include runtimeBridge.                                                     |
| Acceptability criteria           | `src/server/services/route-integrated-provider-execution-service.ts:269-284`                                                                    | Acceptable draft requires sufficient grounding, citation count, parsed structured preview, and expected draft kind.                                                            |
| Missing credential bridge result | `src/server/services/admin-ai-generation-runtime-bridge-service.ts:147-153`                                                                     | Missing credential produces `providerCallExecuted=false`, `providerConfigurationRead=true`, `failureCategory=missing_provider_credential`, and `visibleGeneratedContent=null`. |
| Frontend display                 | `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx:2080-2082`, `:2467-2474`; `src/features/admin/content-admin-runtime.tsx:87-97` | Frontend formats whatever route error returns. Because route returns only static `409015`, the UI has no failure category to display.                                          |

## Existing Test Evidence

| Command                                                                                           | Result         |
| ------------------------------------------------------------------------------------------------- | -------------- |
| `npm.cmd exec -- vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts` | pass, 26 tests |
| `npm.cmd exec -- vitest run src/features/admin/ai-generation/AdminAiGenerationEntryPage.test.tsx` | pass, 5 tests  |
| `npm.cmd exec -- vitest run tests/unit/admin-ai-generation-entry-surface.test.ts`                 | pass, 33 tests |

Relevant existing test coverage:

- Provider-disabled content admin request returns `409015` before task/result persistence.
- Provider-disabled diagnostics receive admin runtimeBridge input but still return `409015`.
- Insufficient grounding returns `409015` without persistence.
- Provider output structured-preview mismatch returns `409015` without persistence.

## Root Cause

The external route does call the admin runtimeBridge, but it applies a later draft-acceptability gate that requires visible generated content with sufficient grounding and parsed structured preview. For no-Provider missing credential, the bridge intentionally has no visible generated content. That makes the acceptability gate fail, and the route returns a static `409015` response with `data: null`.

This folds multiple different internal causes into the same route response:

- missing Provider credential after sufficient grounding;
- insufficient grounding;
- Provider failure with no acceptable content;
- unparseable or wrong-kind structured preview.

## Classification

- route wiring: pass; shared handlers receive owner-preview runtimeBridge control.
- bridge execution before external response: pass; runtimeBridge is resolved before static `409015`.
- external route observability: partial; failure category is dropped when acceptability fails.
- frontend error specificity: partial; frontend can only display the static route message and code.
- source bug proven: partial/product-decision-dependent. Current tests intentionally enforce the static `409015` non-persistence behavior, but acceptance observability needs cannot distinguish no-Provider credential from grounding/parse failures.
- Provider call: not executed.
- DB operation: not executed.
- staging/prod/deploy: not executed.
- Cost Calibration: not executed.
- release readiness / production usability: not claimed.

## Redaction Check

- No credentials, sessions, cookies, tokens, headers, env values, DB URLs, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI outputs, full questions, full papers, full materials, resource text, chunk text, screenshots, DOM dumps, or private fixture values are recorded.
