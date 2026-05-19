# Phase 4 Student Home UI Baseline Security Review

## Metadata

- Task id: `phase-4-student-home-ui-baseline`
- Branch: `codex/phase-4-student-home-ui-baseline`
- Base: `master`
- Review date: 2026-05-19
- Reviewer: Codex
- Risk types: `student`, `authorization`, `frontend`
- Verdict: `APPROVE`

## Files Reviewed

- `src/app/(student)/home/page.tsx`
- `src/features/student/home/StudentHomePage.tsx`
- `tests/unit/student-home-ui.test.ts`
- `docs/05-execution-logs/task-plans/2026-05-19-phase-4-student-home-ui-baseline.md`

## Abuse Cases Considered

- A student infers unavailable papers from another `profession` or `level` after switching scopes.
- A student sees internal numeric database ids in DOM attributes or action URLs.
- A student manipulates action URLs to expose an internal id instead of a `publicId`.
- A no-authorization student sees paper metadata instead of a redemption guidance state.
- UI fixture data accidentally includes secrets, session details, storage keys, or admin-only information.

## Data Exposure Review

- Paper cards expose `data-public-id` and do not set `data-id`.
- Practice and mock exam links use `paperPublicId` query parameters.
- The UI fixture contains only student-facing fields from `StudentPaperScopeDto` and `StudentPaperSummaryDto`.
- No password, token, session, storage object key, audit internals, or numeric database id is rendered.
- Optional display fields use graceful labels such as `发布时间待定`, `不限时`, or `总分待定`; no empty string sentinel is introduced.

## Authorization Boundary Review

- The UI filters visible paper cards by selected `profession` and `level` from the available scope list.
- No authenticated API or authorization resolver was changed in this task.
- No client-side filtering is presented as an access-control mechanism; this is a UI baseline over an existing student-paper API contract.
- The no-authorization state routes to `redeem_code` guidance and does not render paper metadata.
- Future real data hydration must still enforce server-side `authorization` checks from the student paper API baseline.

## API Contract Review

- No API route or response contract changed.
- The UI consumes existing `StudentPaperScopeDto` and `StudentPaperSummaryDto` types.
- JSON/API naming conventions are not changed by this task.
- Student-facing action URLs use `paperPublicId`, not `[id]` or internal row ids.

## Test Coverage And Accepted Gaps

- Covered remembered scope selection, first-scope fallback, scope switching, subject grouping, published-date sort order by fixture arrangement, action links, public identifier DOM usage, loading, error, empty-paper, and no-authorization states.
- Browser/IAB verified `/home`, default selected scope, rendered paper groups, public-id action links, scope switching, and clean console logs.
- The baseline route uses fixture data until a later task wires authenticated student data hydration.
- No separate mobile viewport screenshot was captured; responsive risk is reduced by mobile-first base layout and component tests but should be revisited when e2e coverage is introduced.

## Evidence

- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `npm.cmd run test:unit`: pass, 62 files and 188 tests.
- `npm.cmd run build`: pass after fresh worktree `corepack pnpm@10 install --frozen-lockfile`.
- `Test-NamingConventions.ps1`: pass.
- `npm.cmd run format:check`: pass after Prettier formatting of two new files.

## Verdict

`APPROVE`

No blocking security or authorization issues found for the scoped UI baseline.
