# Local AI Provider Experience Smoke Execution Traceability

## Task

- Task id: `local-ai-provider-experience-smoke-execution-2026-06-28`
- Sprint id: `local-full-loop-acceleration-2026-06-28`
- Branch: `codex/local-ai-provider-smoke-20260628`
- Scope: redacted local Provider smoke execution attempt plus localhost route experience validation.

## Requirement Mapping

| Requirement area                    | Coverage in this task                                                                     | Boundary                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Content AI generation               | `content_admin` AI question and AI `paper` request route smoke                            | No formal `question` or `paper` write; Provider payload and raw output are not recorded.       |
| Organization AI generation          | `org_advanced_admin` organization AI question and AI `paper` route smoke                  | Organization-owned draft remains non-formal and student-invisible without follow-up tasks.     |
| Standard organization boundary      | `org_standard_admin` direct organization AI generation request denied or unavailable      | UI visibility is not an authorization boundary; service denial remains required.               |
| Student AI explanation              | Student answer, mistake_book, AI explanation, report, and learning suggestion route smoke | No raw student answer, prompt, AI output, full question content, or Provider payload evidence. |
| Organization training and analytics | Advanced org admin, employee, ops admin, and standard admin role flow                     | Employee answers and analytics stay summary/aggregate only.                                    |
| RAG and citations                   | AI explanation evidence status and citation-count class only                              | No resource, chunk, embedding, or citation source content is recorded.                         |
| Provider runtime                    | Existing local Provider smoke runner with one-request cap                                 | Uses current process only; `.env*` and Provider configuration remain untouched.                |
| Cost Calibration and release gates  | Explicitly preserved as blocked                                                           | No cost measurement, pricing, quota defaults, release readiness, or final Pass.                |

## Evidence Boundary

Allowed evidence fields:

- role labels;
- route or service category;
- HTTP/e2e pass-fail summaries;
- Provider request count class;
- `providerCallExecuted` boolean;
- redacted result status and failure category;
- redaction status;
- blocked-gate summary.

Forbidden evidence fields:

- credentials, connection strings, secrets, tokens, cookies, localStorage, Authorization headers;
- raw DB rows, internal ids, user emails/phones, plaintext `redeem_code`;
- raw DOM, screenshots, traces;
- Provider payloads, prompts, raw AI output;
- raw student or employee answers;
- full question/paper/resource/chunk/citation content;
- pricing, quota defaults, or cost-calibration data.

## Decision Link

The task consumes the fresh approval requested by `local-full-loop-gap-reseed-after-ui-action-smoke-2026-06-28` and should unblock only the post-provider local evidence rollup if it produces redacted smoke evidence. It does not unblock Cost Calibration, staging/prod/deploy, payment, external service, release readiness, or final Pass.

## Execution Result

- Provider dry-run passed with zero requests.
- Provider execute runner safely blocked because the current process did not expose a Provider credential.
- No `.env*` file was read or changed.
- No real Provider request was sent, so successful real Provider evidence still does not exist.
- Focused localhost e2e passed for content AI generation, organization AI generation, student AI explanation, organization training, analytics, and standard-admin negative boundaries.
- The post-provider rollup successor remains blocked pending successful redacted real Provider evidence or a new owner-approved scope.
