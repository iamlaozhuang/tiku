# Learner Employee AI Paper Action Enabled-State Repair Evidence

Task id: `learner-employee-ai-paper-action-enabled-state-repair-2026-06-25`

Branch: `codex/ai-route-paper-state-20260625`

## Fresh Approval

The active goal approves the next smallest local source repair after the full eight-row rerun stayed blocked. This task
does not approve DB/seed/schema/migration, Provider/Cost, staging/prod, payment, external service, dependency changes, or
final MVP Pass.

## Scope Guard

- Source repair executed: yes, scoped frontend local-contract action repair only.
- Focused unit tests executed: yes.
- Focused browser rerun executed: yes, button-state observation only; no AI action button was clicked.
- Credential document read/input for browser rerun: yes, redacted evidence only.
- DB/seed/schema/migration executed: no.
- Account/user/employee/authorization mutation executed: no.
- Provider/Cost/staging/prod/payment/external-service executed: no.
- Raw credentials, account identifiers, tokens, cookies, local/session storage, raw DB rows, raw public ids, raw DOM,
  screenshots, traces, Provider payloads, prompts, generated content, or private answer content recorded: no.
- Standard/Advanced MVP final Pass claimed: no.

## Pre-Repair Runtime Confirmation

- Standard personal learner direct `/ai-generation`: unavailable state present; `AI出题` `0/1`, `AI组卷` `0/1`; no
  unauthorized/login prompt.
- Advanced personal learner direct `/ai-generation`: unavailable state absent; `AI出题` `1/1`, `AI组卷` `0/1`.
- Standard organization employee direct `/ai-generation`: unavailable state present; `AI出题` `0/1`, `AI组卷` `0/1`.
- Advanced organization employee direct `/ai-generation`: unavailable state absent; `AI出题` `1/1`, `AI组卷` `0/1`.

Conclusion: standard direct-route denial is currently acceptable; the smallest source repair target is advanced
`AI组卷` enabled-state/local-contract entry.

## Repair Results

- Updated `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`.
- Added `StudentPersonalAiGenerationTaskType` for `ai_question_generation` and `ai_paper_generation`.
- Added `ai_paper_generation` display mapping to the local contract readout.
- Reused the existing session and effective-authorization recheck path for both AI actions.
- `AI出题` posts the existing `ai_question_generation` local-contract request.
- `AI组卷` now posts an `ai_paper_generation` local-contract request when the advanced AI page is available.
- Standard/unavailable states continue to disable both AI action buttons.
- Updated `tests/unit/student-personal-ai-generation-ui.test.ts`.
- Added RED/GREEN coverage proving `AI组卷` submits `taskType: "ai_paper_generation"` without leaking the session token.
- Added a standard/unavailable assertion proving `AI组卷` remains disabled for standard direct-route access.

## Validation Results

- RED:
  `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts -t "posts an AI paper generation local route contract payload"`:
  failed before repair because `AI组卷` was disabled.
- GREEN:
  `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts -t "posts an AI paper generation local route contract payload"`:
  passed, 1 passed and 15 skipped.
- `npm.cmd run test:unit -- tests/unit/student-personal-ai-generation-ui.test.ts`: passed, 16 tests.
- Focused browser rerun for four learner/employee rows:

| Row                         | Landing | Direct route     | Unavailable | `AI出题` enabled/total | `AI组卷` enabled/total | API families observed                                  | Browser issues |
| --------------------------- | ------- | ---------------- | ----------- | ---------------------- | ---------------------- | ------------------------------------------------------ | -------------- |
| `personal_standard_student` | `/home` | `/ai-generation` | yes         | `0/1`                  | `0/1`                  | sessions, authorizations                               | `0`            |
| `personal_advanced_student` | `/home` | `/ai-generation` | no          | `1/1`                  | `1/1`                  | sessions, authorizations, request history, result list | `0`            |
| `org_standard_employee`     | `/home` | `/ai-generation` | yes         | `0/1`                  | `0/1`                  | sessions, authorizations                               | `0`            |
| `org_advanced_employee`     | `/home` | `/ai-generation` | no          | `1/1`                  | `1/1`                  | sessions, authorizations, request history, result list | `0`            |

- `npm.cmd run lint`: passed.
- `npm.cmd run typecheck`: passed.
- `npx.cmd prettier --write --ignore-unknown ...`: passed for scoped files.
- `npx.cmd prettier --check --ignore-unknown ...`: passed.
- `git diff --check`: passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-employee-ai-paper-action-enabled-state-repair-2026-06-25`:
  passed.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-employee-ai-paper-action-enabled-state-repair-2026-06-25 -SkipRemoteAheadCheck`:
  passed.

## Closeout Result

Pending commit, fast-forward merge to `master`, push `origin/master`, and short-branch cleanup.

No Standard/Advanced MVP final Pass is claimed.
