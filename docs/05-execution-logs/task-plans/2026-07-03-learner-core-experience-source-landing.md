# Task Plan: learner-core-experience-source-landing-2026-07-03

## Task

- Task id: `learner-core-experience-source-landing-2026-07-03`
- Branch: `codex/learner-core-experience-source-landing-2026-07-03`
- Package: source landing package 13 of 16
- Human approval: current user approved continuing the previously approved source landing goal serially with per-package validation, commit, fast-forward merge, push, and cleanup.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-01-user-auth.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ui-ux-requirement-design-baseline-gap-analysis.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-03-source-landing-16-package-execution-map.md`

## Requirement Anchors

- `UX-REQ-15`: learner registration/session/redeem/profile flow must close the no-auth loop and keep the redeem page stable.
- `UX-REQ-16`: learner practice, `mock_exam`, report, and mistake book surfaces must match the first-release learner UX contract.
- `G12`: registration currently creates a user but does not create a learner session.
- `CT-REQ-033`: learner home and learning flows must expose scope/auth source clearly without over-expanding authorization rules.
- `CT-REQ-034`: registration redirects to redeem, forgot password is support-only, redeem requires preview/confirm, profile separates account/auth/action blocks.
- `CT-REQ-035`: mock exam navigator/report depth/fixed pagination/objective-only mistake book boundaries.
- `D13`: learner registration, redeem, profile, password-help, and upgrade-target selection decisions.
- `D14`: learner practice/mock/report/mistake-book decisions.

## Source Inspection

- Existing registration service creates the personal user and returns `nextAction: redeem_code`, but no learner session/cookie is created.
- Existing registration route returns the registration response directly and does not strip/set session token metadata.
- Existing student redeem page submits the code directly; it lacks the explicit preview/confirm step and support-only account guidance.
- Existing practice page has a restart action without secondary confirmation and contains mojibake copy in the resume panel.
- Existing mock exam page already avoids answer/analysis exposure before submit and has an answer card plus submit confirmation; the report list lacks runtime pagination state and the report suggestion block does not render full suggestion text when present.
- Existing mistake book page has fixed `pageSize = 20`, but still renders subjective entries if the backend sends them.

## Implementation Plan

1. Add tests proving registration creates a single active learner session, route response sets the cookie, and client JSON never exposes the token.
2. Implement registration-session creation through the existing local session boundary without adding schema, dependencies, or auth model changes.
3. Add redeem preview/confirm UI, keep the current redeem endpoint boundary, and add support-only account/password guidance to the learner profile/redeem surfaces.
4. Add practice restart secondary confirmation and fix the resume-panel copy.
5. Add report list fixed-20 pagination state and render learning suggestion full text when available.
6. Restrict mistake book UI to objective question types in the first release, even if stale/runtime data includes subjective entries.
7. Update docs/state/queue/evidence/audit and run two-pass self-review plus focused gates before commit/merge/push.

## Boundaries

- No schema, migration, dependency, Provider, env/secret, direct DB, dev server, browser, e2e, staging/prod, deploy, release-readiness, final Pass, or production-usability work.
- No learner self-service password reset, no phone/password self-edit, no new redeem preview API, no backend upgrade-target selection route, and no learner AI context work in this package.
- No full content, raw Prompt, raw AI IO, credentials, cookies, tokens, sessions, auth headers, env values, raw DB rows, PII dumps, plaintext `redeem_code`, screenshots, traces, or raw DOM in evidence.

## Validation Plan

- `npm.cmd run test:unit -- src/server/services/user-registration-service.test.ts src/server/auth/user-registration-route.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/student-register-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `npm.cmd run format:check`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-core-experience-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId learner-core-experience-source-landing-2026-07-03`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-core-experience-source-landing-2026-07-03 -SkipRemoteAheadCheck`
