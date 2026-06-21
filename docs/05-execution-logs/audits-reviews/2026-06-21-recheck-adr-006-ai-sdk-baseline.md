# Audit Review: Recheck ADR-006 AI SDK Baseline

**Date:** 2026-06-21
**Task id:** `recheck-adr-006-ai-sdk-baseline`
**Review type:** `docs_architecture_freshness_recheck`
**Runtime claim:** none

## Findings

| severity | findingId         | finding                                                                                                                                     | decision                                                                                                            |
| -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| medium   | ADR006-RECHECK-01 | ADR-006 said AI SDK packages were deferred, but `package.json` currently includes `ai`, `@ai-sdk/alibaba`, and `@ai-sdk/openai-compatible`. | Update ADR-006 current package baseline.                                                                            |
| high     | ADR006-RECHECK-02 | Installed AI SDK packages do not prove real Provider readiness.                                                                             | Keep Provider/env/model calls, prompt payloads, and runtime AI execution explicitly blocked without fresh approval. |

## Audit Conclusion

ADR-006 can be used as a fresh architecture baseline after this update only for installed package facts and gating policy. It must not be cited as evidence that real AI Provider execution is available.
