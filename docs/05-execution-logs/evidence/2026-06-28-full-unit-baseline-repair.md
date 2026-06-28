# Full Unit Baseline Repair Evidence

- Task id: `full-unit-baseline-repair-2026-06-28`
- Branch: `codex/full-unit-baseline-repair-20260628`
- Evidence status: pass
- result: pass
- Updated at: `2026-06-28T12:52:00-07:00`

## Boundary Confirmation

- `.env*` must not be read, displayed, modified, or committed.
- No credential, token, cookie, session, localStorage value, Authorization header, connection string, Provider key, prompt payload, raw AI output, raw DOM, screenshot, trace, raw DB row, internal id, plaintext contact, redeem_code, complete question, answer, paper, material, resource, or chunk content may be recorded.
- No browser, DB, AI/Provider, dev-server, e2e, package/lockfile, schema/migration/seed, staging/prod/deploy, payment/OCR/export/external-service, PR, force-push, release readiness, or final Pass action is approved for this task.
- Cost Calibration Gate remains blocked.

## Requirement Mapping Result

- Full unit GREEN is required before full acceptance matrix execution.
- Authorization repairs must preserve service-computed `effectiveEdition` and the source-of-truth separation for `personal_auth`, `org_auth`, `redeem_code`, and `auth_upgrade`.
- AI-related unit repairs must not call Provider services, read Provider configuration, expose prompts, or record raw AI input/output.
- Evidence records command names, test file paths, counts, failure classes, and redacted assertion summaries only.

## RED Baseline

- RED: `npm.cmd run test:unit`
  - Result: failed as expected for the repository baseline.
  - Test files: 11 failed, 306 passed, 317 total.
  - Tests: 20 failed, 1409 passed, 1429 total.
  - Failure classes:
    - `cookie_header_baseline_assertions`: admin and session helpers now send `Headers {}` with `same-origin` credentials instead of test-expected bearer headers.
    - `organization_auth_service_validation`: `org_auth` tests receive invalid-input responses where success or overlap conflict was expected.
    - `organization_analytics_mapper_baseline`: analytics mapper requires a redacted statistics boundary that older test fixtures omit.
    - `personal_ai_component_mock_export`: personal AI page tests mock `studentRuntimeApi` without `COOKIE_BACKED_SESSION_MARKER`.
    - `organization_portal_link_expectation`: advanced organization portal test expected link destinations but rendered an unavailable/summary state.
    - `ops_content_runtime_expectations`: several ops/content UI tests still assert older raw role/header or API contract behavior.

## Focused Repair Evidence

- RED follow-up: `npx.cmd vitest run <initial 11 failing unit files>`
  - Result: failed after first repair pass.
  - Remaining files: 2 failed, 9 passed.
  - Remaining classes:
    - `personal_ai_authorization_prefetch_fixture`: personal AI tests needed URL-aware authorization prefetch fixtures before result/request history loading.
    - `ops_user_detail_label_contract`: user detail assertions expected raw authorization type enum labels instead of Chinese owner-facing labels.
  - Redaction note: raw DOM output from the terminal was intentionally not copied into this evidence.
- GREEN: `npx.cmd vitest run src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/phase-20-ra-06-02-user-role-detail-alignment.test.ts`
  - Result: passed.
  - Test files: 2 passed.
  - Tests: 11 passed.
- GREEN: `npx.cmd vitest run <initial 11 failing unit files>`
  - Result: passed.
  - Test files: 11 passed.
  - Tests: 92 passed.
  - Repair classes covered:
    - added URL-aware personal AI authorization/request/result history fixtures.
    - aligned analytics mapper fixtures with redacted statistics boundary contract.
    - added required `org_auth.edition` inputs to service/lifecycle tests.
    - added explicit redeem_code profession and level generation input.
    - aligned organization portal fixture with service-computed `org_auth` advanced capability source.
    - changed header assertions to inspect `Headers` instances while preserving same-origin request semantics.
    - changed ops user detail expectations to Chinese labels and anti-leak checks for raw enum text.

## Validation Commands

- GREEN: `npm.cmd run test:unit`
  - Result: passed after repair.
  - Test files: 317 passed.
  - Tests: 1429 passed.
- GREEN: `npx.cmd vitest run <focused failing unit files>`
  - Result: passed.
  - Test files: 11 passed.
  - Tests: 92 passed.
- GREEN: `npm.cmd run lint`
  - Result: passed.
- GREEN: `npm.cmd run typecheck`
  - Result: passed.
- GREEN: `npx.cmd prettier --check <task changed files>`
  - Result: initially failed for one test file formatting issue.
- GREEN: `npx.cmd prettier --write src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
  - Result: formatting repaired.
- GREEN: `npx.cmd prettier --check <task changed files>`
  - Result: passed.
- GREEN: `git diff --check`
  - Result: passed.
- GREEN: `npm.cmd run test:unit`
  - Result: passed after formatting.
  - Test files: 317 passed.
  - Tests: 1429 passed.
- Closeout command to run after implementation commit:
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-unit-baseline-repair-2026-06-28`
    - Result: passed before implementation commit and in commit hook.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-unit-baseline-repair-2026-06-28`
    - Result: passed.
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-unit-baseline-repair-2026-06-28 -SkipRemoteAheadCheck`
    - Result: passed.

## Module Run v2 Closeout Anchors

- Batch range: full-unit-baseline-repair-2026-06-28 single task batch.
- RED: `npm.cmd run test:unit` reproduced 11 failing files / 20 failing tests before repair.
- GREEN: focused repair and full unit baseline commands passed as recorded above.
- Commit: `42b869a6b`
- localFullLoopGate: passed for unit baseline, lint, typecheck, formatting, and diff checks.
- threadRolloverGate: not required; no context rollover needed for this task.
- nextModuleRunCandidate: `full-acceptance-matrix-execution-2026-06-28` after merge/push/cleanup.
- Blocked remainder: browser/dev-server/e2e, DB, Provider/AI, dependency, schema/migration/seed, staging/prod/deploy, PR,
  force-push, release readiness, final Pass, and Cost Calibration Gate remain blocked.

## Closeout Status

Full unit baseline repair is complete locally. Implementation commit, closeout readiness, and pre-push readiness are recorded before merge/push.
