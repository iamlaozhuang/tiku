# AI Training History Resume Repair Evidence

**Task:** `user-led-ai-training-history-resume-repair-2026-07-12`

**Branch:** `codex/ai-training-history-resume`

**Baseline:** `89a14a3e4271fa62714c37e4e593818660900dff`

**Evidence status:** pass pending commit closeout

## Scope

- Shared `/ai-generation` behavior for the personal advanced learner and organization advanced employee.
- Fix AI mode/history synchronization and persisted AI paper start-or-resume after refresh.
- Keep Provider closed and do not alter authorization, quota, formal content, database schema, migration, fixture, dependency, or runtime configuration.

## RED / GREEN

- RED: 9 targeted assertions failed as expected before production edits. They covered mode/history mismatch, absence of historical paper continuation, browser-supplied paper assembly trust, missing actor/owner lookup, session collision, and changed-source resume.
- GREEN: 8 focused files / 108 tests passed. After the final scoped Prettier write, the directly affected UI and route suites passed 3 files / 69 tests.
- Full unit gate: 360 files / 1993 tests passed on the repeated canonical concurrent run. One earlier unrelated operations UI test failed once during the first full run, then passed in isolated reproduction and the repeated full run without an unrelated code change.

## Behavior Evidence

- The active AI mode is the sole request/result history filter. Switching between AI question generation and AI paper generation resets pagination, clears cross-mode detail, triggers both history loads, and ignores stale responses.
- A persisted assembled paper is looked up by the current actor plus personal owner scope, followed for an employee by the current organization owner scope. Browser-supplied task identifiers and paper assembly cannot replace the persisted result.
- The server derives one deterministic learning-session identifier from the persisted result. Same-context retries return the existing session; owner, actor, source-result, or source-task collision remains blocked.
- A created learning session is reused before current question-source resolution. Later withdrawal or visibility changes therefore cannot invalidate an existing immutable learning snapshot.
- The UI uses the persisted-result-only request for both a just-created AI paper and an eligible historical AI paper, restores stored answer feedback, and exposes a historical start-or-continue action only for an assembled, sufficiently grounded result.
- Historical AI question output remains redacted and follows its existing transient-content path.

## Quality Gates

| Gate                        | Result                       |
| --------------------------- | ---------------------------- |
| Focused AI tests            | pass, 8 files / 108 tests    |
| Post-format affected suites | pass, 3 files / 69 tests     |
| Full Vitest                 | pass, 360 files / 1993 tests |
| lint                        | pass                         |
| typecheck                   | pass                         |
| format:check                | pass                         |
| webpack build               | pass, 90 static pages        |
| git diff --check            | pass                         |

## Localhost Browser Checks

- A process-only 0704 localhost override ran on isolated port 3101. Provider stayed disabled and `.env.local` was unchanged. No database direct connection or mutation occurred.
- Personal advanced learner: Provider-closed status remained visible; generation settings remained visible and read-only; AI paper mode changed both request and result history labels to AI paper generation.
- Organization advanced employee: enterprise title and organization authorization context remained correct; Provider-closed status remained visible; AI paper mode changed both request and result history labels to AI paper generation.
- The current 0704 organization employee history contained one legacy paper result without an assembled paper snapshot. It correctly exposed no start action and remained read-only; no unsafe reconstruction was attempted. Eligible persisted-result behavior is covered by the route, service, repository, and UI tests above.
- The temporary 390px browser page could not attach after viewport override. The viewport was reset, the isolated service was stopped, and the shared UI test suites remained green. This is a browser infrastructure observation, not a product failure claim.
- No generation submit action, Provider execution, screenshot capture, raw page artifact, credential, session, cookie, token, environment value, database URL, or business record was written to the repository evidence.

## Adversarial Checks

- Direct client assembly tampering: blocked by server-owned result lookup and source resolution.
- Cross-user and cross-organization result access: fail closed by actor and owner scope predicates.
- Repeated start/continue and route retry: one deterministic session is reused; conflicting context is blocked.
- Missing, insufficient, malformed, withdrawn, or inaccessible sources: no partial new session persists.
- Provider-closed state: history remains readable; generation remains unavailable and no generation request was submitted.
- Formal-domain boundary: no formal question, paper, practice, answer record, exam report, or mistake book write was added.

## Non-Claims

- This evidence covers localhost only. It is not staging, production, Provider-enabled, deployment, release-readiness, or Cost Calibration evidence.
