# 2026-07-06 Organization Training Admin UI Loop Evidence

## Scope

- Task: `organization-training-admin-ui-loop-2026-07-06`
- Branch: `codex/organization-training-admin-ui-loop-2026-07-06`
- Scope: local source, unit tests, and redacted docs only.
- Runtime DB connection: not used.
- Provider execution: not used.
- Schema, migration, seed, dependency, env, browser, dev server, staging/prod: not used.

## Red First

- Command: `npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts`
- Result: expected fail before implementation.
- Summary: 1 file ran; 1 new failing case confirmed the organization training admin page did not load persisted AI-created drafts or expose the existing publish API from the training surface.

## Implementation Summary

- Added `GET /api/v1/organization-trainings` collection export for organization admin lifecycle metadata.
- Reused `OrganizationTrainingAdminLifecycleFlowDto` and extended lifecycle items with publish-required metadata only.
- Added repository-backed lifecycle draft/version readers scoped by visible organization public ids.
- Updated admin training UI to load persisted lifecycle items, merge newly created/copied drafts, show business error codes, and publish reviewed question snapshots through the existing `/publish` API.
- Kept organization training output separate from platform formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.

## Focused Validation

- Command: `npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts`
- Result: pass.
- Summary: 1 file, 9 tests.

- Command: `npm.cmd run test:unit -- src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts`
- Result: pass after expected contract expectation update.
- Summary: 3 files, 81 tests.

- Command: `npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts src/server/validators/organization-training.test.ts`
- Result: pass.
- Summary: 4 files, 90 tests.

## Gates

- Command: `npm.cmd run typecheck`
- Result: pass.

- Command: `npm.cmd run lint`
- Result: pass.

- Command: `npm.cmd exec -- prettier --check --ignore-unknown ...`
- Result: pass after scoped formatting of task source files.

- Command: `git diff --check`
- Result: pass.

- Command: `npm.cmd run test:unit`
- Result: pass.
- Summary: 333 files, 1659 tests.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-admin-ui-loop-2026-07-06`
- Result: pass.

- Command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-admin-ui-loop-2026-07-06 -SkipRemoteAheadCheck`
- Result: first run blocked on stale state SHA baseline, then pass after updating `lastKnownMasterSha` and `lastKnownOriginMasterSha` to the current shared baseline.

## Redaction

- Evidence contains only task ids, file paths, command names, status, and aggregate counts.
- No credentials, tokens, sessions, cookies, Authorization headers, env values, connection strings, raw DB rows, internal ids, PII, plaintext `redeem_code`, Provider payloads, prompts, raw AI I/O, screenshots, traces, raw DOM, or complete generated question/paper/material content are recorded.
