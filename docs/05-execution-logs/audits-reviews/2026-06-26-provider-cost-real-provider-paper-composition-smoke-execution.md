# Provider Cost real Provider paper composition smoke execution audit review

Task id: `provider-cost-real-provider-paper-composition-smoke-execution-2026-06-26`

## Review Verdict

Status: `PASS_REAL_PROVIDER_PAPER_COMPOSITION_SMOKE_DRAFT_ONLY_NO_PUBLISH_NO_FINAL_PASS`.

The approved local Provider paper composition smoke passed within the declared boundary:

- One Provider call was executed for `content_ai_paper_generation`.
- Zero retries were attempted.
- Total token usage was `579`, below the approved `2000` token cap.
- No Cost Calibration Gate was executed.
- The generated paper result then went through governed formal adoption into a draft-only composed `paper`.
- The composition path created exactly one companion draft `question`, one `paper_section`, and one `paper_question`.
- No publish, student-visible content, staging/prod, payment, deployment/release readiness, or final Pass action was
  executed.

## Scope Review

- One local real Provider call is approved by fresh user approval.
- The approved workflow is content admin `content_ai_paper_generation` followed by formal draft composition adoption.
- Draft-only formal composition is capped at one companion `question` draft, one `paper_section`, and one
  `paper_question`.
- Publish, student-visible content, staging/prod, payment, external service, deployment/release readiness, Cost
  Calibration Gate, and final Pass remain blocked.

## Redaction Review

Evidence may record only provider/model identifiers, workflow/status, call count, token summary, latency, error
category, public-id presence states, and composition counts. Raw prompts, outputs, payloads, credentials, DB URLs, raw
DB rows, and full content remain forbidden.

Review result: pass. The evidence records only the approved redacted fields above. It does not include raw prompt,
provider output, provider payload, generated result body, reviewed draft body, raw formal content, internal numeric id,
DB URL, credential value, token, cookie, or Authorization header.

## Execution Review

- Provider/model: `alibaba-qwen` / `qwen3.7-max`.
- Credential alias: `ALIBABA_API_KEY`; value not recorded.
- Provider request count: `1`.
- Retry count: `0`.
- Result: `pass`.
- Duration: `10967 ms`.
- Usage summary: `inputTokens=27`, `outputTokens=552`, `totalTokens=579`, `reasoningTokens=547`,
  `cachedInputTokens=0`.
- Content setup POST count: `1`.
- Formal adoption POST count: `1`.
- Draft composition: `paperCompositionStatus=composed`, `paperSectionCount=1`, `paperQuestionCount=1`,
  `companionQuestionDraftCount=1`.

## Boundary Review

Pass for the approved local smoke boundary. The task remains explicitly not a staging/prod/release final Pass, not a
Cost Calibration result, and not a publish/student-visible content approval. Formal publish must remain behind the
separate `formal-publish-student-visible-content-approval-package-2026-06-26` approval package.

## Validation Review

- Focused unit validation: pass.
- Transient Provider smoke harness: pass and removed after execution.
- Scoped Prettier write/check: pass.
- `git diff --check`: pass.
- Module Run v2 precommit hardening: pass.
- Module Run v2 prepush readiness: pass.
