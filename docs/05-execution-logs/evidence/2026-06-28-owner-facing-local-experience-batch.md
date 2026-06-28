# Owner-Facing Local Experience Batch Evidence

- Task id: `owner-facing-local-experience-batch-2026-06-28`
- Branch: `codex/owner-facing-local-experience-20260628`
- Evidence status: closed with known gaps
- Updated at: `2026-06-28T11:52:26-07:00`

## Boundary Confirmation

- `.env*` was not read, displayed, modified, or committed.
- No credential, cookie, token, localStorage value, Authorization header, connection string, Provider key, prompt payload, raw AI output, raw DOM, screenshot, trace, question, answer, paper, material, resource, or chunk content is recorded in this evidence.
- No direct DB query or DB write was used in this batch.
- No dependency, lockfile, schema, migration, seed, staging, production, deploy, payment, OCR, export, PR, or force-push action was performed.
- Private resources were used only for local role login inputs and package coverage metadata.

## Private Fixture Package Metadata

- Allowed package path: `D:\tiku-local-private\owner-facing-fixtures\2026-06-28-rawfiles-curated`
- File count: 75
- Extension counts: `.csv` 5, `.docx` 18, `.json` 3, `.md` 3, `.pdf` 41, `.pptx` 1, `.yaml` 4
- Required package metadata present: `authorization-matrix.yaml`, `expected-outcomes.md`, `redaction-policy.md`

## Role Coverage

| Role label                  | Local pages / workflows checked                                                                        | Redacted result                                                                                                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `org_advanced_admin`        | Organization portal, analytics, organization training, organization AI question, organization AI paper | Advanced routes reachable. Training and AI entry surfaces usable. Analytics submit shows a load-failed state with scope context present and no summary card. |
| `org_standard_admin`        | Organization portal and direct advanced organization routes                                            | Standard unavailable states rendered. Regressed and fixed visible `org_auth` copy to owner-facing "高级版企业授权".                                          |
| `org_advanced_employee`     | Student home, organization training, AI generation, practice, mistake book                             | Advanced employee training and AI surfaces reachable. English "Organization Training" eyebrow was fixed to "企业训练".                                       |
| `org_standard_employee`     | Student home, direct organization training, AI generation, practice                                    | Organization training unavailable state was fixed from escaped Unicode to readable Chinese. AI buttons are disabled for standard authorization.              |
| `ops_admin`                 | User ops, redeem code / organization authorization, AI ops logs, denied content routes                 | Ops routes reachable and content routes denied. Remaining permission/copy gaps recorded below.                                                               |
| `content_admin`             | Paper/question content management, content AI question/paper, denied ops route                         | Content routes reachable and ops route denied. AI review disabled action labels were fixed to Chinese.                                                       |
| `personal_advanced_student` | Home, AI generation, practice, mock exam, mistake book                                                 | Personal advanced AI buttons available; direct practice without a selected paper still shows a load-failed state.                                            |
| `personal_standard_student` | Home, AI generation, practice, mock exam, mistake book                                                 | Standard learner AI action buttons are disabled and permission state is visible. Direct practice/mock entry without selected context remains a polish gap.   |

## Local AI Interaction Budget

- AI UI/API interactions attempted: 6
- Budget limit: 30
- Retry count: 0
- Entries: personal advanced `AI出题`, personal advanced `AI组卷`, content admin `AI出题`, content admin `AI组卷`, organization advanced admin `AI出题`, organization advanced admin `AI组卷`
- Redacted result: all six enabled buttons accepted local UI interaction. Content and organization admin entries showed Provider/formal-write blocked states. Personal advanced learner entries accepted the request and did not expose raw payload markers in the visible UI.

## Small Repairs Completed

| Gap id                  | Severity | Repair                                                                                                                                      |
| ----------------------- | -------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `EMP-STD-TRAINING-001`  | major    | Replaced escaped Unicode unavailable copy with readable Chinese and added alert/status semantics for employee organization training states. |
| `EMP-ADV-TRAINING-001`  | minor    | Replaced visible English "Organization Training" eyebrow with "企业训练".                                                                   |
| `ORG-STD-COPY-001`      | minor    | Replaced visible `org_auth` copy in standard organization analytics, training, and AI unavailable states with "高级版企业授权".             |
| `CONTENT-AI-REVIEW-001` | major    | Replaced disabled review action labels `adopt_disabled` and `reject_disabled` with Chinese disabled-state copy.                             |

## Remaining Redacted Gap List

| Gap id                             | Severity | Area                   | Redacted observation                                                                                                            | Boundary decision                                                                               |
| ---------------------------------- | -------- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `ORG-ADV-ANALYTICS-001`            | major    | Organization analytics | Advanced admin scope context renders, but loading the summary ends in "统计摘要加载失败" and no summary card.                   | Recorded only. Direct DB/schema/provider diagnosis is outside small deterministic repair scope. |
| `OPS-PROMPT-PERMISSION-001`        | critical | Ops AI governance      | Ordinary `ops_admin` can see Provider/model/prompt-template management affordances on the AI ops page.                          | Recorded only. Provider configuration and prompt-template permission changes are blocked gates. |
| `OPS-LOG-COPY-001`                 | minor    | Ops AI governance      | AI ops page still exposes some raw internal terminology labels such as knowledge/redeem-code identifiers.                       | Recorded only for a follow-up UI copy task.                                                     |
| `CONTENT-AI-TRACEABILITY-COPY-002` | minor    | Content AI review      | Content AI traceability panel still contains several raw contract/status labels beyond the two repaired disabled action labels. | Recorded only to avoid broad copy churn in this batch.                                          |
| `STUDENT-DIRECT-PRACTICE-001`      | minor    | Student direct entry   | Direct `/practice` without selected paper context shows a load-failed state rather than a guided empty state.                   | Recorded only as polish follow-up.                                                              |
| `STUDENT-DIRECT-MOCK-001`          | minor    | Student direct entry   | Direct `/mock-exam` behavior differs by role/context and can show an error when no selected paper/mock context exists.          | Recorded only as polish follow-up.                                                              |

## TDD Evidence

- RED: `npx.cmd vitest run tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Result: failed as expected before source repair.
  - Failure classes: visible `org_auth`, escaped Unicode employee state, English eyebrow, raw disabled action labels.
- GREEN: same command after source repair.
  - Result: 4 files passed, 25 tests passed.

## Browser Regression Evidence

- Standard organization admin direct analytics/training/AI routes: "高级版企业授权" visible; `org_auth` absent.
- Standard employee organization training: readable Chinese unavailable state visible; escaped Unicode absent; "Organization Training" absent.
- Content admin AI question page: disabled review action labels show "采用需后续任务" and "驳回需后续任务"; raw disabled labels absent.
- Advanced organization analytics click: scope context present, load-failed state present, summary card absent.

## Validation Commands

- `npx.cmd vitest run tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts`
  - Result: pass, 4 files passed, 25 tests passed.
- `npm run lint`
  - Result: pass.
- `npm run typecheck`
  - Result: pass.
- `npx.cmd prettier --check --ignore-unknown <task-scoped changed files>`
  - Result: pass.
- `git diff --check`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Get-TikuProjectStatus.ps1`
  - Result: pass diagnostic after closeout. Decision: `idle_no_pending_task`.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId owner-facing-local-experience-batch-2026-06-28`
  - Result: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId owner-facing-local-experience-batch-2026-06-28 -SkipRemoteAheadCheck`
  - Result: pass.
- `npm run test:unit`
  - Result: fail on unrelated repository baseline failures outside this task's changed files.
  - Failure summary: 11 test files failed, 20 tests failed, 306 files passed, 1409 tests passed.
  - Failure classes: cookie/header baseline assertions, organization auth service validation, organization analytics mapper baseline, personal AI component mock export, organization portal link expectation, and unrelated ops/content runtime expectations.
  - Decision: recorded as a baseline blocker for full-suite health; not fixed in this owner-facing small-repair batch.

## Closeout Decision

This batch is closed for local owner-facing validation and small deterministic repairs with the known gaps above. It does not claim release readiness, final acceptance pass, Provider readiness, Cost Calibration readiness, or full repository test-suite health.
