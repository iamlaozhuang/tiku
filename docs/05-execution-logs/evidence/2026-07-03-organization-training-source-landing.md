# 2026-07-03 Organization Training Source Landing Evidence

## Task

- Task ID: `organization-training-source-landing-2026-07-03`
- Branch: `codex/organization-training-source-landing-2026-07-03`
- Batch range: source landing package 3, single-task batch.
- Base commit: `fae15f7055054352f278f656ad08de84fe3ba49a`.
- Implementation commit: `8b593dad555f3e2095a48f6d41e36217c89ebd53`.
- Package: organization training source UI/UX contract landing.
- Evidence mode: redacted summaries only; no credentials, sessions, cookies, headers, env values, DB rows, PII, plaintext redeem_code, Provider payloads, prompts, AI I/O, raw employee answers, full question/paper/material/resource/chunk content, raw DOM, screenshots, or traces.
- Cost Calibration Gate remains blocked.
- threadRolloverGate: no separate rollover required for this package; evidence, audit, state, and queue are recorded in the current thread.
- nextModuleRunCandidate: after this package closes, continue with the next approved source landing contract package in the serial goal queue.
- localFullLoopGate: focused unit, typecheck, lint, format, diff check, and Module Run v2 gates are required before local commit, fast-forward merge, push, and cleanup.
- blocked remainder: schema/API expansion for full paper-question snapshot storage, Provider execution, browser/e2e, deploy, PR, force push, release readiness, final Pass, production usability, and cost calibration remain blocked.

## RED / GREEN

- RED: pre-edit source still exposed the old three-form `组织培训` admin flow, content workspace mounted the organization training page, route/service accepted `mock_exam` source context, and employee UI presented technical summary controls.
- GREEN: bounded source changes and focused tests now cover `企业训练` wording, list plus four-step admin guide, content route redirect, first-release source choices, `mock_exam` validator/service denial, employee progress and in-page submit confirmation, and result summary copy.

## Source Changes

- Materialized the task in:
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`
  - `docs/05-execution-logs/task-plans/2026-07-03-organization-training-source-landing.md`
- Redirected the content workspace organization-training route back to the organization workspace route so content_admin does not gain an organization-training management surface.
- Updated organization-admin training UI from old `组织培训` three-form surface to `企业训练` list plus visible four-step creation guide:
  - choose source;
  - configure training;
  - set scope;
  - preview/publish readiness.
- Exposed first-release source choices as platform paper snapshot, organization AI result, and manual organization-private questions.
- Kept existing API calls and schema boundaries; did not add migrations or dependencies.
- Added validator and service protection so `mock_exam` is denied as a first-release organization training source context while model enum compatibility is left unchanged.
- Updated employee page wording and interaction:
  - `企业训练` entry and heading;
  - readable profession/level/subject/version metadata;
  - answer progress panel;
  - page-level submit confirmation panel;
  - result summary copy without raw answers.
- Updated focused tests for admin UI, employee UI, route ownership, validator denial, and service denial.

## Validation

All commands were executed from `D:\tiku`.

| Command                                                                                                                                                                                                                                                               | Result                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `npm.cmd run test:unit -- tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts src/server/validators/organization-training.test.ts src/server/services/organization-training-service.test.ts` | Passed: 4 files, 51 tests |
| `npm.cmd run typecheck`                                                                                                                                                                                                                                               | Passed                    |
| `npm.cmd run lint`                                                                                                                                                                                                                                                    | Passed                    |
| `npm.cmd run format:check`                                                                                                                                                                                                                                            | Passed                    |
| `git diff --check`                                                                                                                                                                                                                                                    | Passed                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId organization-training-source-landing-2026-07-03`                                                                                       | Passed                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId organization-training-source-landing-2026-07-03`                                                                                  | Passed                    |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId organization-training-source-landing-2026-07-03 -SkipRemoteAheadCheck`                                                                   | Passed                    |

## Boundary Evidence

- Dependency files changed: no.
- Lockfiles changed: no.
- Schema/migration/seed changed: no.
- Direct database connection or mutation by agent: no.
- Provider call or Provider configuration read: no.
- Browser/dev-server/e2e execution: no.
- Release readiness, final Pass, production usable, staging/prod deploy, PR, force push, or cost calibration claimed/executed: no.

## Review Notes

- First review found one YAML formatting issue caused by an acceptance bullet beginning with a backtick; fixed by removing the leading backtick in the YAML plain scalar.
- First review found one potentially misleading admin source-card copy that implied full question/answer/analysis copy was already implemented; revised to preview/readiness wording to avoid claiming unsupported behavior.
- Second review replaced a browser-native submit confirmation with an in-page confirmation panel to better match the accepted UI/UX direction.
- Repository checkpoint drift was found by pre-push readiness because project-state still pointed to the previous source package checkpoint; updated to current `master` and `origin/master` baseline `fae15f7055054352f278f656ad08de84fe3ba49a`.
- Residual bounded limitation: this package does not implement a new full paper-question snapshot storage/API because schema and migration work are explicitly blocked for this source landing package.
