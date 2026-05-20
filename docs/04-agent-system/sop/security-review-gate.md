# Security Review Gate SOP

## Status

Active for high-risk queue tasks.

## Purpose

Make security and authorization review explicit before high-risk work is merged. This SOP is a process gate only; it does not change runtime behavior by itself.

## Trigger Conditions

A task requires a security review when any of these are true:

- `riskTypes` includes `authorization`, `api_contract`, `data_contract`, `auth`, `session`, `admin`, `schema`, `migration`, `secret`, `payment`, or `external_service`.
- The task creates or changes authenticated API routes.
- The task changes organization, employee, student, admin, redeem_code, personal_auth, org_auth, or effective authorization behavior.
- The task changes public identifier handling, route parameters, or external DTOs.
- The task adds database schema, migration, permission, token, cookie, session, or credential behavior.

## Required Review Artifact

For triggered tasks, create one of these before merge:

- A dedicated file under `docs/05-execution-logs/audits-reviews/`.
- Or a clearly titled `Security Review` section inside the task evidence file.

The artifact must include:

- Task id, branch, base, reviewer, and review date.
- Files reviewed.
- Risk types reviewed.
- Abuse cases considered.
- Data exposure review.
- Authorization boundary review.
- API contract review.
- Test coverage and accepted gaps.
- Verdict: `APPROVE`, `COMMENT`, or `REQUEST_CHANGES`.

## Minimum Checklist

- Authentication is required before user-specific or admin-only data is returned.
- Organization and employee boundaries cannot be crossed by changing public identifiers.
- API URLs and DTOs expose public identifiers only, never numeric database `id`.
- Response body shape stays `{ code, message, data, pagination? }`.
- JSON keys are camelCase.
- Empty optional values are `null`, not empty strings.
- Authorization state handling covers active, expired, cancelled, disabled, and not-yet-started records when relevant.
- State-changing routes have an explicit permission model and abuse-case coverage.
- Repository boundaries do not leak internal ids or schema rows into API contracts.
- Secrets, tokens, password hashes, and session internals are never logged or returned.

## Queue Metadata Guidance

High-risk queue entries should include:

```yaml
riskTypes:
  - authorization
  - api_contract
securityReviewRequired: true
securityReviewPath: docs/05-execution-logs/audits-reviews/YYYY-MM-DD-task-id-security-review.md
```

If a task is high-risk but does not require a separate artifact, the evidence must explain why. That exception should be rare and should not be used for authorization, session, credential, or admin work.

Before Phase 5 AI/RAG work starts, security review planning must explicitly cover:

- AI call log redaction for prompts, model outputs, citations, user answers, and provider error payloads.
- Secret and environment variable handling for model providers.
- RAG authorization filtering before retrieval results are used in AI prompts.
- `evidence_status` behavior when citations are weak or absent.
- Prompt template versioning and model configuration snapshotting for repeatability.

## Merge Rule

Do not merge a triggered high-risk task until the security review verdict is `APPROVE` or the remaining issues are explicitly classified as non-blocking `COMMENT` items with accepted residual risk.

`REQUEST_CHANGES` blocks merge.
