# Content AI 0704 Final Localhost Acceptance Evidence

## Scope

- Task id: `content-ai-0704-final-localhost-acceptance-2026-07-09`
- Branch: `codex/content-ai-0704-final-localhost-acceptance`
- Runtime: `http://127.0.0.1:3000`
- Mode: redacted localhost acceptance after account matrix recovery.

## Runtime Boundary

| Check                                                | Result       |
| ---------------------------------------------------- | ------------ |
| Private credential values output                     | no           |
| Session/cookie/token/localStorage/auth header output | no           |
| Env value / DB URL output                            | no           |
| Raw DB row / internal numeric id output              | no           |
| Provider call                                        | not executed |
| Fresh AI generation POST                             | not executed |
| Screenshot / raw DOM / trace capture                 | not executed |
| Direct DB connection or mutation                     | not executed |
| Source/test/package/lockfile/schema change           | not changed  |

## Account And Authorization Matrix

| Role label                  | Login | Authorization category                                                             |
| --------------------------- | ----- | ---------------------------------------------------------------------------------- |
| `content_admin`             | pass  | `content_admin`                                                                    |
| `personal_standard_student` | pass  | `personal_auth/standard/standard/not_blocked/no_ai`                                |
| `personal_advanced_student` | pass  | `personal_auth/standard/advanced/production_enablement_blocked/ai_capable`         |
| `org_standard_employee`     | pass  | `org_auth/standard/standard/not_blocked/no_ai`                                     |
| `org_advanced_employee`     | pass  | `org_auth/advanced/advanced/production_enablement_blocked/ai_and_training_capable` |
| `org_standard_admin`        | pass  | admin login pass; learner authorization endpoint not applicable                    |
| `org_advanced_admin`        | pass  | admin login pass; learner authorization endpoint not applicable                    |

## Content Backend AI Runtime Probe

| Area                         | Result                  | Aggregate evidence                                                                 |
| ---------------------------- | ----------------------- | ---------------------------------------------------------------------------------- |
| AI出题 history               | pass_read               | 2 requests, 2 generated results, request status `succeeded`, result status `draft` |
| AI出题 formal adoption state | blocked_current_fixture | adoption categories `blocked` and `rejected`; no formal question target            |
| AI组卷 history               | pass_read               | 2 requests, 2 generated results, request status `succeeded`, result status `draft` |
| AI组卷 formal adoption state | partial                 | one formal paper target exists; categories include `draft_created`                 |
| AI组卷 target paper detail   | blocked_current_fixture | target paper status `draft`; question count 2; total score absent                  |
| Formal question list         | pass_read               | 16 available formal questions; locked question count 7                             |
| Formal paper list            | pass_read               | 3 papers visible; 2 published and 1 draft                                          |

## Learner And Organization Boundary Probe

| Area                                                 | Result                     | Aggregate evidence                                                                                              |
| ---------------------------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Personal standard learner                            | pass_boundary              | standard effective context; AI question and paper capability false                                              |
| Personal advanced learner                            | pass_boundary              | advanced effective context; AI question and paper capability true; local production enablement category present |
| Organization standard employee                       | pass_boundary              | standard org context; AI question, AI paper, training answer capability false                                   |
| Organization advanced employee                       | pass_boundary              | advanced org context; AI question, AI paper, training answer capability true                                    |
| Organization standard employee training visible list | pass_denied_or_empty       | route returned safe unavailable category with zero items                                                        |
| Organization advanced employee training visible list | pass_empty_current_fixture | route succeeded with zero currently visible items                                                               |

## Interpretation

- The account/role prerequisite is no longer the blocker.
- The current localhost service and 0704 fixture are usable for role-boundary and read-surface acceptance.
- Full no-Provider content AI closed-loop publish replay is still not proven by the current 0704 history:
  - AI出题 has no formal question target to publish or expose to users.
  - AI组卷 has a formal paper target, but the target remains an unpublished draft with missing total score.
- This is not confirmed as a current source defect in this branch. The relevant source/test repair branches are already
  closed, and current tests continue to cover formal adoption and publish validation behavior.
- A full fresh end-to-end publish replay requires either approved Provider-enabled generation or a separate approved
  fixture/history refresh that creates current, publishable AI-generated review records without exposing sensitive data.

## Validation

| Command                                                                                                                                                                                                                                                                                                                                                                                                               | Result                    |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts --reporter=dot`                                                                                                                                                                                                                           | pass; 3 files / 80 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts src/server/services/paper-draft-service.test.ts src/server/services/admin-ai-generation-local-contract-route.test.ts --reporter=dot`                                                                                                             | pass; 4 files / 67 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx tests/unit/student-personal-ai-generation-ui.test.ts --reporter=dot`                                                                                              | pass; 4 files / 96 tests  |
| `corepack pnpm@10.26.1 exec vitest run src/server/services/organization-training-route.test.ts src/server/services/organization-training-service.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts --reporter=dot` | pass; 6 files / 119 tests |
| `corepack pnpm@10.26.1 lint`                                                                                                                                                                                                                                                                                                                                                                                          | pass                      |
| `corepack pnpm@10.26.1 typecheck`                                                                                                                                                                                                                                                                                                                                                                                     | pass                      |
| `git diff --check`                                                                                                                                                                                                                                                                                                                                                                                                    | pass                      |
| `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped-doc-files>`                                                                                                                                                                                                                                                                                                                                     | pass                      |
| `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-0704-final-localhost-acceptance-2026-07-09`                                                                                                                                                                                                                                                                                                                | pass                      |
| `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-0704-final-localhost-acceptance-2026-07-09 -SkipRemoteAheadCheck`                                                                                                                                                                                                                                                                                            | pass                      |
