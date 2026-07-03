# 2026-07-03 Learner AI Context Source Landing Evidence

## Task

`learner-ai-context-source-landing-2026-07-03`

## Scope Evidence

result: pass

- Branch: `codex/learner-ai-context-source-landing-2026-07-03`
- Base commit: `b9bf4b55aa79b800830324175a31a83c385347c5`
- Implementation commit: `9b659ebb5e4f7b16c4609b3f9a6325016e99ab7f`.
- Evidence mode: redacted file paths, task ids, command summaries, route names, role names, and requirement/source alignment summaries only.
- Forbidden evidence: credentials, sessions, cookies, auth headers, env values, raw DB rows, PII dumps, plaintext `redeem_code`, Provider payloads, raw Prompt/full Prompt text, raw AI IO, full generated content, screenshots, exports, traces, raw DOM, or private fixture material.

Cost Calibration Gate remains blocked.
threadRolloverGate: continue the approved sixteen-package source landing goal package by package; stop only on validation failure or explicit user redirection.
automationHandoffPolicy: no automation handoff; continue manually from committed source, docs, state, queue, and package-specific evidence.
nextModuleRunCandidate: `employee-training-answer-result-source-landing-2026-07-03` after package 14 closeout.
Batch range: source landing package 14 of 16, learner AI context selection, quota owner confirmation, history/retry, and standard-unavailable states.
RED: accepted requirements require explicit learner AI authorization context selection, personal default when personal and organization advanced contexts coexist, and organization quota only after explicit organization-context selection. The pre-implementation focused test failed because no authorization context selector existed.
GREEN: learner AI page now renders the authorization context selector before submit actions, shows source/original edition/effective edition/scope/expiry/quota owner, defaults to personal authorization, and submits organization quota only after explicit organization selection.
localFullLoopGate: remains blocked for browser/dev-server/e2e, direct DB, Provider, schema/migration, dependency, staging/prod, deploy, release-readiness, final Pass, and production-usability work.
blocked remainder: enterprise training answer/result UX, content AI draft adoption, browser acceptance, deployment, Cost Calibration, release readiness, final Pass, and production usability remain blocked.

## Requirement Alignment

- `UX-REQ-12`, `G13`, `CT-REQ-033`, `D13`: learner AI context selection, quota owner confirmation, history/retry, and standard-unavailable states.
- ADR-007: quota ownership follows the selected authorization context; the system must not automatically switch authorization contexts solely to obtain higher `effectiveEdition` or more quota.
- 2026-07-02 AI SSOT: learner AI remains available only to `personal_advanced_student` and `org_advanced_employee`; standard learners and standard organization employees remain unavailable or denied.

## Implementation Evidence

- Added explicit learner-facing authorization context selector to `StudentPersonalAiGenerationPage`.
- Selector shows source, original/effective edition, profession/level scope, expiry, and quota owner.
- Request body now uses selected `EffectiveAuthorizationContextDto` metadata instead of deriving owner/quota from session user type.
- Default context selection prefers `personal_auth` when both personal and organization advanced contexts are available.
- Existing standard-unavailable, request/result history, redacted result detail, and retry behavior remain covered by focused tests.

## Validation Results

- PASS: `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts` failed before implementation because `授权上下文` was missing, then passed after implementation (23 tests passed).
- PASS: `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx src/server/services/personal-ai-generation-request-context-service.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts` (5 files, 79 tests passed).
- PASS: `npm.cmd run typecheck`.
- PASS: `npm.cmd run lint`.
- PASS: `npm.cmd run format:check`.
- PASS: `git diff --check`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-context-source-landing-2026-07-03`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId learner-ai-context-source-landing-2026-07-03`.
- PASS: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-context-source-landing-2026-07-03 -SkipRemoteAheadCheck`.

## Review Notes

- Pass 1: verified the implementation fixes the real context-switching gap without reopening closed AI generation baseline issues.
- Pass 2: verified file scope is limited to approved learner AI source/test and governance files; no package/lockfile/schema/migration/seed/env/Provider/Prompt/browser/deploy work was introduced.

## Git Closeout

Committed, fast-forward merged to `master`, pushed to `origin/master`, and short branch cleaned in package closeout.

## Non-Claims

- No schema/migration/dependency/Provider/database/browser/deploy work is claimed.
- No release readiness, final Pass, or production usability is claimed.
