# Enterprise Training Path Closure Plan

**Date:** 2026-06-21
**Decision status:** blocked closure plan recorded; implementation deferred until org_auth scope and security boundaries stabilize.
**Related use cases:** `UC-ADV-ORG-TRAINING-CONTENT-LIFECYCLE`, `UC-ADV-EMPLOYEE-TRAINING-ANSWER`, `UC-ADV-ORG-ANALYTICS-SUMMARY`, `UC-ADV-ORG-PORTAL-ADMIN`

## Current Closure State

The advanced enterprise backend and employee training path is not closed as a runtime experience. It is closed in this batch as `approval_blocked` with explicit next steps.

Static facts:

- Advanced requirements include organization training, employee answer statistics, and organization analytics.
- Role matrix marks `org_admin` enterprise backend as `release_blocked` and employee training assignment as `gap`.
- Static routes and services exist for `organization_training`, employee answers, and organization analytics.
- `organization-training-service.ts` contains explicit blockers such as `advanced_edition_required`, `org_auth_required`, `organization_training_capability_required`, `authorization_scope_mismatch`, and employee answer privacy behavior such as `own_summary_only`.
- The org_auth scope model is not stable enough for runtime closure because subject, multi-profession, multi-level, quota attribution, and shared enterprise backend semantics still require implementation approval and security review.

## Hard Blockers

| blocker id | blocker                                                                                                | required next step                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| AET-01     | org_auth effective scope is not implemented for the newly documented subject/profession/level model.   | Complete `org-auth-scope-contract-design`, security preflight, schema approval, and service split. |
| AET-02     | Employee visibility and answer privacy are high-risk.                                                  | Approve privacy review for raw answer handling, read-only summaries, and audit evidence.           |
| AET-03     | Runtime proof requires browser/dev-server/e2e or data setup outside current approval.                  | Request fresh runtime approval after low-level implementation tasks pass.                          |
| AET-04     | Advanced AI/provider paths remain gated.                                                               | Keep Provider calls, prompt payloads, `.env`, quota cost, and Cost Calibration blocked.            |
| AET-05     | Organization training must stay isolated from formal `question`, `paper`, `practice`, and `mock_exam`. | Preserve formal-content separation before any adoption or source-context expansion.                |

## Follow-Up Task Split

These tasks should not start until their prerequisites are met.

| order | task id                                           | classification                                       | prerequisite                                                 | scope                                                                               | validation                                                             |
| ----- | ------------------------------------------------- | ---------------------------------------------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| 1     | `stabilize-org-auth-effective-scope-for-training` | `approval_blocked`, `security_review_required`       | org_auth implementation split approval                       | Ensure advanced `org_auth` can grant organization_training capability safely.       | Contract/service/security tests; no browser proof yet.                 |
| 2     | `close-organization-training-admin-management`    | `local_implementation`, `runtime_verification_later` | stable advanced org_auth scope                               | Close org_admin draft, publish, take-down, copy, and source-context admin flow.     | Focused unit/service/UI tests, redacted audit evidence.                |
| 3     | `close-employee-training-answer-flow`             | `local_implementation`, `security_review_required`   | stable employee organization context and training visibility | Close visible list, draft save, submit once per version, and read-only own summary. | Focused unit/service/UI tests, privacy assertions, duplicate blocking. |
| 4     | `close-organization-training-analytics-summary`   | `local_implementation`, `security_review_required`   | employee answer flow and privacy review                      | Close organization-scoped aggregate statistics without raw answer leakage.          | Aggregate-only tests and redacted evidence scan.                       |
| 5     | `verify-enterprise-training-runtime-experience`   | `runtime_verification_later`, `approval_blocked`     | tasks 1 through 4 complete and fresh runtime approval        | Run org_admin and employee browser/dev-server path verification.                    | Browser/e2e or manual runtime evidence after approval only.            |

## Privacy And Security Rules

Before implementation, reviewers must confirm:

- Employee answer text is not exposed outside the employee's own answer flow unless a separate privacy approval exists.
- Organization analytics returns aggregates and redacted summaries, not raw employee answer content.
- `organization_training` records are isolated from formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- `org_auth` effective scope checks include organization, descendant coverage, `profession`, `level`, `subject`, `edition`, expiry, cancellation, and quota capability.
- API routes use public identifiers only.
- Evidence contains no private employee answer text, session token, database URL, raw prompt, Provider payload, plaintext redeem_code, or internal numeric ID.

## Closure Status For This Batch

- `org_admin` enterprise backend: blocked until org_auth implementation and runtime proof.
- `employee` training assignment and answer flow: blocked until org_auth implementation, privacy review, and runtime proof.
- Organization analytics: blocked until employee answer privacy and aggregate-only rules are verified.
- Provider-backed training content generation: blocked by Provider/env/cost gates.

This is an explicit blocked closure package, not a runtime completion claim.
