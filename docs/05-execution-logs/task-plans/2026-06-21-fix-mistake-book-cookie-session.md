# Fix Mistake Book Cookie Session Plan

## Scope

Fix the student mistake_book page so it honors the cookie-backed session established by normal student login. The
repair is limited to the focused student page and unit test.

## Read Inputs

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `src/features/student/mistake-book/StudentMistakeBookPage.tsx`
- `src/features/student/studentRuntimeApi.ts`
- `tests/unit/student-mistake-book-ui.test.ts`

## Root Cause Hypothesis

`StudentMistakeBookPage` duplicates student session handling. It reads `tiku.localSessionToken` directly and returns the
unauthorized state before calling the mistake_book API when that local value is absent. Normal student login relies on
the HttpOnly cookie path and intentionally does not persist a bearer credential in localStorage, so the page can reject
a valid session that the route guard accepts.

## Implementation Plan

1. Add a focused RED unit test proving the page calls `/api/v1/mistake-books` with `credentials: "same-origin"` when no
   local session value exists.
2. Replace the page-local fetch/session helpers with the shared `studentRuntimeApi` helpers.
3. Keep local automation bearer support intact when a stored session value exists.
4. Treat real API unauthorized responses as the unauthorized state; absence of a local session value alone is not
   unauthorized.
5. Run focused unit validation first, then lint, typecheck, formatting, and Module Run v2 gates.

## Boundaries

- No browser runtime, dev server, e2e runtime, database connection, schema or migration work, dependency change,
  provider call, env secret access, payment, deploy, PR, or force-push.
- Evidence records command summaries only. It must not include session credentials, Authorization headers, raw answer
  text, full paper content, raw prompts, provider payloads, or private data.
- Cost Calibration Gate remains blocked.
