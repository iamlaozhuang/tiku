# 2026-07-03 Organization AI Post Actions Source Landing Audit Review

## Scope

- Task ID: `organization-ai-post-actions-source-landing-2026-07-03`
- Review type: adversarial self-review, two passes.
- Files reviewed: task plan/state/queue, organization AI page, admin AI history DTO/route mapping, organization training route/service/validator, and focused tests.

## Pass 1

- Finding: the initial implementation direction tried to allow `organization_ai_result` as a source-context type. Typecheck exposed that the current schema only supports the existing source-context enum. Resolution: keep source-context enum unchanged and use existing `sourceTaskPublicId` on training drafts for first-release source attribution.
- Finding: organization AI history still risked organization-side formal adoption wording. Resolution: organization history uses training-draft wording and the test asserts organization history does not render `正式采用`.
- Finding: weak evidence needed an explicit operator action. Resolution: weak evidence renders an explicit confirmation action; none evidence renders a disabled action.

## Pass 2

- Finding: wording such as "copy" implied full generated question content had been copied into the draft. Resolution: changed UI/tests/evidence to "create and associate" language because raw generated content persistence is outside this package.
- Finding: historical generation parameters are not persisted in task history, so target scope could be ambiguous. Resolution: UI labels the target scope as current page parameters; residual schema/contract work is recorded in evidence.
- Finding: Provider/prompt/raw AI output and enterprise AI quota summaries must not leak. Resolution: tests continue to assert no `Provider`, `rawPrompt`, `rawOutput`, or `providerPayload` on the relevant surfaces; implementation does not call Provider or read model configuration.

## Decision

- Approved for local closeout after declared validation and Module Run v2 gates pass.
- No schema, migration, dependency, Provider, browser/e2e, deploy, release readiness, final Pass, production usability, or cost calibration work is included.
