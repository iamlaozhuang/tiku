# 2026-07-06 AI Generation Runtime Acceptance Evidence

## Scope

- Task: `ai-generation-runtime-acceptance-2026-07-06`
- Runtime branch at acceptance: `codex/ai-generation-runtime-acceptance-2026-07-06`
- Source fix branch used for repaired runtime verification: `fix/personal-ai-generation-authorization-gate-2026-07-06`
- Source fix commit: `edd48ccfb fix(ai-generation): enforce personal generation authorization gate`
- Runtime target: local localhost service, local 0704 DB label `tiku_full_chain_acceptance_20260704_001`
- Evidence mode: redacted aggregate/status evidence only.

## Redaction Boundary

- Not recorded: credentials, sessions, cookies, tokens, env values, DB connection values, raw DB rows, internal numeric ids, Provider payload, raw prompt, raw AI output, screenshots, DOM, traces, complete question, complete paper, material content, employee answer plaintext, private fixture values.
- Runtime scripts printed only role labels, route labels, counts, status labels, response codes, and redacted business summaries.

## Source And Unit Baseline

- Inherited source/unit baseline from current master `8b9e72d26`: `333 files / 1661 tests pass`.
- Do not reopen previously closed source/unit AI generation tasks from the 2026-07-02 and 2026-07-06 baseline evidence.
- Current runtime found one backend authorization regression in direct personal AI generation POST for standard organization employees.
- Separate fix branch validation:
  - RED: standard employee direct personal AI generation POST reached accepted path before the fix.
  - GREEN: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-route.test.ts` passed `1 file / 30 tests`.
  - `npm.cmd run typecheck` passed.
  - `npm.cmd run lint -- src/server/services/personal-ai-generation-request-route.ts src/server/services/personal-ai-generation-request-route.test.ts src/app/api/v1/personal-ai-generation-requests/route.ts` passed.
  - Commit hook ran Module Run v2 precommit, lint-staged, full lint, and typecheck: passed.
  - Evidence: `docs/05-execution-logs/evidence/2026-07-06-personal-ai-generation-authorization-gate-fix.md`.

## Acceptance Mapping Result

| Requirement                                          | Evidence result                                                                                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Standard roles denied or unavailable for advanced AI | Organization standard employee direct backend denied with `403057`; standard org admin advanced AI unavailable; personal standard remains fixture gap. |
| Advanced learner AI training loop                    | Generated result created learning session, accepted answer, and exposed progress/feedback.                                                             |
| Organization AI training loop                        | Organization AI result created draft/source context, published version, accepted employee answer, and appeared in aggregate statistics.                |
| Content-admin formal separation                      | Content AI result approved into paper draft and separate result rejected; direct publish status stayed blocked.                                        |
| Provider small sample                                | Personal, organization, and content AI出题 / AI组卷 samples had sufficient grounding and parsed structured previews.                                   |
| Non-claims                                           | No release readiness, final Pass, production usability, staging/prod health, or Cost Calibration claim.                                                |

## 0704 DB Runtime Precheck

- Target DB label verified: `tiku_full_chain_acceptance_20260704_001`.
- Initial schema precheck found the 0704 target missing the reviewed closed-loop migration pair already present in source:
  - `personal_ai_learning_session`
  - `personal_ai_learning_answer_feedback`
  - `organization_training_version.question_snapshot`
  - `organization_training_answer.answer_item_snapshot`
  - `organization_training_answer.question_result_snapshot`
- Executed only the exact reviewed local migration files against the 0704 target:
  - `drizzle/20260706031000_add_personal_ai_learning_session.sql`
  - `drizzle/20260706052000_add_organization_ai_training_closed_loop.sql`
- Executed file count: `2`.
- Executed statement count: `6`.
- Destructive DB operation executed: `false`.
- Broad migration runner executed: `false`.
- Post-migration schema precheck: all required tables/columns present, including admin AI `reviewedDraft` persistence fields.

## Browser Role Matrix

- Browser plugin attach was blocked by timeout; fallback used Playwright real Chromium against localhost.
- Screenshots, traces, raw DOM, cookies, sessions, and credentials were not recorded.

| Role                        | Result                                                                                                                                      |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `personal_advanced_student` | Login/runtime context available; advanced AI entry visible.                                                                                 |
| `org_advanced_employee`     | Login/runtime context available; advanced AI entry visible; backend accepted advanced personal AI generation after the fix.                 |
| `org_advanced_admin`        | Login/runtime context available; organization AI entry visible.                                                                             |
| `content_admin`             | Login/runtime context available; content AI question/paper entry visible.                                                                   |
| `org_standard_employee`     | Login/runtime context available; advanced AI entry unavailable; direct backend personal AI generation POST now rejected with code `403057`. |
| `org_standard_admin`        | Login/runtime context available; organization advanced AI unavailable.                                                                      |
| `personal_standard_student` | Blocked by missing current 0704 private fixture input; no positive access claim made for this role.                                         |

## Provider Disabled Check

- Provider-disabled advanced path returned a clear business failure category rather than a generic UI-only failure:
  - bridge status: controlled local runtime path reached.
  - provider call executed: `false`.
  - provider configuration read: `true`.
  - result status: `blocked`.
  - failure category: `missing_provider_credential`.
- Standard employee direct backend check after fix:
  - candidate employee contexts found: `12`.
  - selected standard context authorization count: `3`.
  - selected standard context advanced AI count: `0`.
  - POST `/api/v1/personal-ai-generation-requests`: HTTP `200`, API code `403057`.
  - Provider bridge fields absent; provider not called.

## Provider Enabled Small Sample

- Provider boundary used current local Provider configuration without printing credential or payload values.
- DB label used by runtime: `tiku_full_chain_acceptance_20260704_001`.

| Flow                | Result                                                                                                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Personal AI出题     | `provider_call_succeeded`, `resultStatus=pass`, `evidenceStatus=sufficient`, `citationCount=3`, structured preview `question_set/parsed`, requested `1`, actual `1`.                                    |
| Personal AI组卷     | `provider_call_succeeded`, `resultStatus=pass`, `evidenceStatus=sufficient`, `citationCount=3`, structured preview `paper_draft/parsed`, section count `1`, question count `2`.                         |
| Organization AI出题 | `provider_call_succeeded`, `resultStatus=pass`, `evidenceStatus=sufficient`, `citationCount=3`, structured preview `question_set/parsed`, requested `1`, actual `1`.                                    |
| Organization AI组卷 | `provider_call_succeeded`, `resultStatus=pass`, `evidenceStatus=sufficient`, `citationCount=3`, structured preview `paper_draft/parsed`, section count `1`, question count `2`.                         |
| Content AI出题      | `provider_call_succeeded`, `resultStatus=pass`, `evidenceStatus=sufficient`, `citationCount=3`, structured preview `question_set/parsed`, requested `1`, actual `1`, reviewed draft present.            |
| Content AI组卷      | `provider_call_succeeded`, `resultStatus=pass`, `evidenceStatus=sufficient`, `citationCount=3`, structured preview `paper_draft/parsed`, section count `1`, question count `2`, reviewed draft present. |

- Raw Provider output persisted to evidence: `false`.
- Raw prompt persisted to evidence: `false`.
- Provider payload persisted to evidence: `false`.
- Cost Calibration executed or claimed: `false`.

## Closed-Loop Runtime Paths

### Learner AI Training

- Generation: accepted; Provider bridge `provider_call_succeeded`; `resultStatus=pass`; structured preview `question_set/parsed`; requested `1`, actual `1`; grounding `sufficient`.
- Learning session creation: API code `0`; status `created`; question count `1`; formal write to platform question blocked.
- Answer submission: API code `0`; status `scored`; AI scoring status `blocked` for this local route.
- Progress read: API code `0`; status `ready`; question count `1`; submitted count `1`; completion rate `1`; feedback count `1`.

### Organization AI Training

- Role fixtures: advanced organization admin found, advanced employee found.
- AI出题 generation: pass; grounding sufficient; parsed question count `1`.
- AI组卷 generation: pass; grounding sufficient; parsed section count `1`, question count `2`.
- Manual training draft: API code `0`; draft created; source task linked.
- Source context attach: API code `0`; organization AI result metadata attached.
- Publish: API code `0`; version created; status `published`; published question count `3`.
- Employee visible list: API code `0`; item count `2`; newly published version visible to selected advanced employee.
- Employee submit: API code `0`; answer status `submitted`; answer item snapshot count `3`; question result snapshot count `3`.
- Employee readonly summary: API code `0`; answer status `read_only`; result summary visible.
- Organization statistics: API code `0`; redaction status `aggregate_only`; training summary present.

### Content Admin Formal Review

- Role fixture: content admin found.
- Content AI组卷 generation: pass; grounding sufficient; parsed section count `1`, question count `2`; reviewed draft present.
- Content AI出题 generation: pass; grounding sufficient; parsed question count `1`; reviewed draft present.
- Formal adoption approve path:
  - API code `0`.
  - review decision `approved`.
  - formal target write status `draft_created`.
  - direct publish status `blocked_requires_fresh_publish_task`.
  - formal target kind `paper`.
  - formal paper draft exists and status is `draft`.
- Formal adoption reject path:
  - API code `0`.
  - review decision `rejected`.
  - reject action status `executed`.
  - formal target write status `blocked_without_follow_up_task`.
  - direct publish status `blocked_requires_fresh_publish_task`.

## Acceptance Result Split

- Source/unit baseline: inherited pass from master `8b9e72d26`; separate fix branch targeted validation passed.
- DB-backed runtime: pass after exact reviewed non-destructive local migration pair was applied to the 0704 target.
- Browser role matrix: pass for six role labels; `personal_standard_student` remains a fixture-input gap, so no pass claim for that role.
- Provider small sample: pass for personal, organization, and content AI出题 / AI组卷 samples.
- Closed-loop runtime: pass for learner training, organization training, and content formal review.
- Release readiness: not claimed.
- Production usability: not claimed.
- Final Pass: not claimed.
- Cost Calibration: not executed or claimed.

## Validation Results

| Command                                                                                                                                                                                         | Result                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| `npm.cmd run typecheck`                                                                                                                                                                         | pass                                                       |
| `npm.cmd run lint`                                                                                                                                                                              | pass                                                       |
| `npm.cmd exec -- prettier --check --ignore-unknown ...runtime-acceptance...`                                                                                                                    | pass after Prettier formatting                             |
| `git diff --check`                                                                                                                                                                              | pass                                                       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-runtime-acceptance-2026-07-06`                     | pass after adding role SSOT and acceptance mapping anchors |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-runtime-acceptance-2026-07-06 -SkipRemoteAheadCheck` | pass                                                       |

## Post-Merge Master Validation

- Branch: `master`.
- Merge mode: fast-forward.
- Local ahead count before push: `3`.
- Remote ahead count before push: `0`.
- Sensitive output recorded: `false`.

| Command                                                                                                                                                                   | Result |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `git status --short --branch`                                                                                                                                             | pass   |
| `git diff --check`                                                                                                                                                        | pass   |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-runtime-acceptance-2026-07-06` | pass   |
| `npm.cmd run typecheck`                                                                                                                                                   | pass   |
| `npm.cmd run lint`                                                                                                                                                        | pass   |
