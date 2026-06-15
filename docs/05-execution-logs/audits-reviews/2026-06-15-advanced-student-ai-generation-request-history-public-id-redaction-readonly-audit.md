# advanced-student-ai-generation-request-history-public-id-redaction-readonly-audit audit

## Review Scope

- Readonly audit of request-history public identifier redaction coverage in:
  - `src/server/contracts/personal-ai-generation-request-history-contract.ts`
  - `src/server/services/personal-ai-generation-request-history-service.ts`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
  - `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

## Findings

- No blocking source behavior finding.
- Request-history DTO includes public identifier fields as local contract/internal identifiers.
- Student request-history UI does not render visible public identifier `ContractField` rows.
- Student request-history UI uses `requestPublicId` as a React key only.
- Request-history service tests assert no numeric id, provider payload, generated content, or full paper content leakage.
- UI test coverage has a gap: page tests use an empty request-history fixture, so there is no explicit non-empty
  request-history assertion that `requestPublicId`, `taskPublicId`, `resultPublicId`, and `aiCallLogPublicId` are hidden.

## Needs Recheck

- Add a narrow TDD follow-up for request-history publicId redaction UI coverage before continuing broader publicId or
  formal-adoption UI work.

## Blocked Gate Audit

Preserved:

- `.env*`, implementation, DB access, provider/model calls, raw/provider/private data, quota/cost, dev server,
  Browser/Playwright/e2e, staging/prod/cloud/deploy/payment/external-service, schema/drizzle/scripts/package/lockfile/
  dependencies, formal adoption write, service/route/API contract changes, PR, and force push remained blocked.

## Decision

APPROVE with needs_recheck. The current source behavior is acceptable for the readonly audit, but explicit UI fixture
coverage should be added in a separate approved TDD task.
