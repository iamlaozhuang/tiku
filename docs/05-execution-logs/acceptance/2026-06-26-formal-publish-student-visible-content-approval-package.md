# Formal publish student-visible content approval package

Package id: `FORMAL_PUBLISH_STUDENT_VISIBLE_CONTENT_2026_06_26`

Task id: `formal-publish-student-visible-content-approval-package-2026-06-26`

## Decision

Status: `PREPARED_PENDING_FRESH_HUMAN_APPROVAL`.

Formal publish is not approved by this package. Student-visible content creation remains blocked until laozhuang gives
a fresh approval for a separate publish execution task.

## Context

The upstream Provider paper composition smoke passed locally:

- one `alibaba-qwen` / `qwen3.7-max` Provider call;
- zero retries;
- total token usage below the approved cap;
- one draft-only composed formal `paper`;
- one companion draft `question`;
- one `paper_section`;
- one `paper_question`.

That upstream result proves local draft composition only. It does not prove publish, student visibility, staging/prod,
release readiness, or final Pass.

## Proposed Future Publish Boundary

If approved later, the publish execution task should be constrained as follows:

- Environment: local dev only.
- Target: one formal draft `paper` selected under an approved local route/service path.
- Publish calls: max 1.
- Provider calls: 0.
- Credential reads: 0.
- Cost Calibration: 0.
- Staging/prod: blocked.
- Payment or external service: blocked.
- Deployment/release readiness: blocked.
- Final Pass claim: blocked.

## Required Pre-Publish Checks

A future execution task must verify and record only redacted states:

- target draft `paper` exists;
- target draft `paper` status is `draft`;
- target draft has at least one `paper_section`;
- target draft has at least one `paper_question`;
- each attached `question` is publish-eligible under existing service validation;
- score and total score validation result;
- material/question lock side effects are understood before execution;
- no raw paper/question/material content is recorded.

## Rollback Or Archive Strategy

If publish is approved and then fails after a partial transition, the follow-up branch must avoid destructive cleanup.
Allowed rollback strategy should be explicit before execution:

- prefer existing `archivePaper`/archive route semantics for a wrongly published local `paper`;
- do not delete DB rows as rollback;
- do not unlock questions/materials through ad hoc DB mutation without separate approval;
- record rollback only as redacted status and count evidence.

## Evidence Fields Allowed If Future Publish Is Approved

- publish route/service name;
- target paper public-id presence state, not raw id;
- pre-publish validation pass/fail states;
- publish call count;
- publish response code;
- final paper status state;
- student visibility state;
- archive/rollback state if used;
- redaction status.

Forbidden evidence:

- raw `paper`, `question`, `paper_section`, `paper_question`, `material`, or `analysis` content;
- raw public ids unless separately approved;
- internal numeric ids;
- DB URL;
- credential, token, cookie, or Authorization header;
- screenshots or student-visible content dumps;
- Provider prompt/output/payload.

## Approval Request For Future Task

To execute publish later, laozhuang must explicitly approve a new task with:

- target environment;
- exact local route/service path;
- max publish calls;
- rollback/archive permission;
- evidence redaction rules;
- whether student-visible local verification is allowed;
- confirmation that staging/prod, release readiness, payment, external service, Provider/Cost, and final Pass remain
  blocked unless separately approved.

## Current Package Boundary

This package is docs/state only. It performs no publish, no student-visible content creation, no local DB mutation, no
Provider call, no credential read, no Cost Calibration, no staging/prod/deploy/payment/external-service action, and no
final Pass claim.
