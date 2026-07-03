# 2026-07-03 Learner Core Experience Source Landing Evidence

## Task

`learner-core-experience-source-landing-2026-07-03`

## Scope Evidence

result: pass

- Branch: `codex/learner-core-experience-source-landing-2026-07-03`
- Base commit: `ef90c2191eedf9b181968c2c673b0a8a0f174c2c`
- Commit: to be recorded during local git closeout after module readiness gates.
- Evidence mode: redacted file paths, command results, route names, role names, and requirement/source alignment summaries only.
- Forbidden evidence: credentials, sessions, cookies, auth headers, env values, raw DB rows, PII dumps, actual password values, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, full question/paper/material/resource/chunk content, screenshots, exports, traces, raw DOM, or private fixture material.

Cost Calibration Gate remains blocked.
threadRolloverGate: continue the approved sixteen-package source landing goal package by package; stop only on validation failure or explicit user redirection.
automationHandoffPolicy: no automation handoff; continue manually from committed source, docs, state, queue, and package-specific evidence.
nextModuleRunCandidate: `learner-ai-context-source-landing-2026-07-03` after package 13 closeout.
Batch range: source landing package 13 of 16, learner registration/session/redeem/profile/practice/mock/report/mistake-book core experience.
RED: accepted requirements require registration to create a learner session and route to redeem, redeem preview/confirm, support-only password help, restart confirmation, fixed-20 report pagination, report suggestion detail, and objective-only mistake book.
GREEN: registration now creates a learner session and the route sets an HttpOnly cookie while stripping session material from JSON; redeem requires preview/confirm; profile/redeem show support-only account help; practice restart requires confirmation; mock report renders suggestion detail and fixed-20 pagination; mistake book renders objective entries only.
localFullLoopGate: remains blocked for browser/dev-server/e2e, direct DB, Provider, schema/migration, dependency, staging/prod, deploy, release-readiness, final Pass, and production-usability work.
blocked remainder: learner AI context/quota/history/retry, enterprise training answer/result UX, content AI draft adoption, browser acceptance, deployment, Cost Calibration, release readiness, final Pass, and production usability remain blocked.

## Requirement Alignment

- `UX-REQ-15`, `CT-REQ-034`, `D13`: registration/session/redeem/profile flow.
- `UX-REQ-16`, `CT-REQ-035`, `D14`: practice/mock/report/mistake book UX.
- `G12`: registration session creation gap.
- `CT-REQ-033`: learner authorization/source context and fixed learning flow boundary.

## Implementation Evidence

- Registration service now creates a single active learner session after personal user creation and returns redirect/session metadata for the route layer.
- Registration route sets the learner session cookie and strips the session material from the client JSON response.
- Register UI sends same-origin credentials so the browser can accept the registration session cookie before routing to `/redeem-code`.
- Student redeem page now separates preview from confirmation and keeps the existing redemption endpoint boundary.
- Student profile and redeem surfaces show support-only account/password help; no learner phone/password self-edit or reset route was added.
- Practice restart now requires a secondary confirmation, and the resume-choice copy is readable Chinese text.
- Mock report detail renders learning suggestion full text and citations when snapshot data provides them; report list now uses fixed `pageSize=20` previous/next pagination.
- Mistake book active list filters to first-release objective question types only while preserving fixed `pageSize=20`.

## Validation Results

- PASS: `npm.cmd run test:unit -- src/server/services/user-registration-service.test.ts src/server/auth/user-registration-route.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/student-register-ui.test.ts tests/unit/student-profile-redeem-ui.test.ts tests/unit/student-practice-ui.test.ts tests/unit/student-mock-exam-report-ui.test.ts tests/unit/student-mistake-book-ui.test.ts` (8 files, 80 tests passed).
- PASS: `npm.cmd run typecheck`.
- PASS: `npm.cmd run lint`.
- PASS: `npm.cmd run format:check`.
- PASS: `git diff --check`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-core-experience-source-landing-2026-07-03`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId learner-core-experience-source-landing-2026-07-03`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-core-experience-source-landing-2026-07-03 -SkipRemoteAheadCheck`.

## Review Notes

- Pass 1: verified the registration-session fix does not alter schema, dependencies, auth storage model, or admin/employee account creation behavior.
- Pass 2: verified learner UX changes stay inside accepted decisions: no learner self-service reset, no phone/password self-edit, no new redeem preview API, no AI context work, and no subjective mistake-book expansion.

## Git Closeout

local_commit_merge_push_cleanup_to_follow

## Non-Claims

- No schema/migration/dependency/Provider/database/browser/deploy work is claimed.
- No release readiness, final Pass, or production usability is claimed.
