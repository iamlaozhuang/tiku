# Layer 3 Cost Calibration Redacted Approval Package Acceptance

Task id: `layer-3-cost-calibration-redacted-approval-package-2026-06-27`

Acceptance status: accepted_for_docs_state_package

## Acceptance Mapping Result

| Layer               | Status after this task                       | Evidence                                                                                        |
| ------------------- | -------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Layer 1             | Complete baseline preserved                  | Prior role/entry/permission evidence; unchanged by this task                                    |
| Layer 2             | Minimum local business loop preserved        | Local PostgreSQL test-owned `rejected` review-command evidence; unchanged by this task          |
| Layer 3 Provider    | Passed                                       | `2026-06-27-layer-3-provider-smoke-openai-compatible-dashscope-config-boundary-repair-retry.md` |
| Layer 3 Cost        | Approval package accepted; execution pending | `2026-06-27-layer-3-cost-calibration-redacted-approval-package.md`                              |
| Layer 3 pre-release | Blocked                                      | No staging/pre-release execution evidence                                                       |
| Final decision      | Blocked                                      | No final evidence review pass; no release readiness/final Pass claim                            |

## Accepted Execution Boundary For Next Task

- Provider path: `openai_compatible` / `alibaba-qwen` / `qwen3.7-max`
- Base URL host: `dashscope.aliyuncs.com`
- Credential alias: `ALIBABA_API_KEY`
- Env handling: execution command may open `.env.local` only to extract `ALIBABA_API_KEY` into process environment
- Sample workflow count: 1
- Provider call cap: 1
- Retry cap: 0
- Timeout: 30000 ms
- Max output tokens: existing script cap only, not increased
- Spend stop: USD 0.05
- Evidence: redacted counts, token summary, local estimate, cap status, redaction status, pass/fail/blocked, stop condition

## Explicit Non-Acceptance

This acceptance does not accept staging/prod, deploy, payment, external-service, OCR/export, archive/index movement,
production quota defaults, release readiness, or final Pass.
