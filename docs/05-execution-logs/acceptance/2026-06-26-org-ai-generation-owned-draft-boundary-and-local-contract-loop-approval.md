# Organization AI Generation Owned Draft Boundary And Local Contract Loop Approval

Task id: `org-ai-generation-owned-draft-boundary-and-local-contract-loop-approval-2026-06-26`

Decision status: `APPROVAL_PACKAGE_PREPARED_IMPLEMENTATION_STILL_BLOCKED`

This is a docs/state-only approval package. It does not implement organization-owned drafts, connect to a database, call
a Provider, create formal content, publish content, or validate student-visible runtime.

## Boundary Decision

Decision: `ORG_AI_GENERATION_ORGANIZATION_OWNED_DRAFT_ALLOWED_AFTER_FUTURE_SOURCE_APPROVAL`.

Organization advanced admin AI generation should support an organization-scoped closed loop in a future implementation:

- organization-scoped AI generation task;
- organization-owned generated_result and history;
- organization admin review and explicit adoption;
- organization-owned draft or organization training content;
- redacted `audit_log` and `ai_call_log` summaries;
- employee visibility only after organization admin confirmation in an approved future task.

The organization-owned loop must remain separate from platform formal content.

## Formal Content Boundary

Organization admins must not directly create platform formal `question` drafts or platform formal `paper` drafts from
organization AI output.

If organization-generated material is ever intended for platform formal content, it must go through a future
content-admin intake/review/adoption workflow. That workflow must be approved separately and must preserve reviewer
attribution, source traceability, validation, and audit records.

## Required Future Task Split

Recommended successors remain blocked until fresh approval:

1. Organization AI generated_result/history contract and source TDD.
2. Organization-owned draft lifecycle contract and local source TDD.
3. Organization training adoption path and employee visibility boundary.
4. Optional organization analytics UX for generated-draft usage summaries.

## Package-Wide Blocks

- No source/test/e2e/script/package/lockfile/schema/drizzle/env changes.
- No DB connection, DB write, migration, seed, or cleanup.
- No Provider call, Provider credential read, Provider configuration, or Cost Calibration.
- No platform formal `question` or `paper` draft write.
- No publish, student-visible platform content, browser/e2e/dev server, staging/prod/deploy/payment/external-service,
  PR, force push, release readiness, or final Pass.

## Fresh Approval Required

Any future implementation requires a task-scoped approval naming exact allowed files, validation commands, and whether it
may touch source, tests, DB/schema, Provider, browser/e2e, or organization-owned draft writes. None of those capabilities
are consumed by this package.
