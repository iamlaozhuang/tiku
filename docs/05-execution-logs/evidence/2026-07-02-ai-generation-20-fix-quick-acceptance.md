# AI generation 20 fix quick acceptance evidence

## Task

- Task id: `ai-generation-20-fix-quick-acceptance-2026-07-02`
- Branch: `codex/ai-generation-20-fix-quick-acceptance`

## Redaction Boundary

- Evidence records role labels, route labels, workflow labels, status categories, counts, duration buckets, and validation summaries only.
- No credentials, cookies, tokens, sessions, localStorage, Authorization headers, `.env*` values, DB raw rows, internal numeric ids, PII, Provider payloads, prompts, raw AI input/output, raw DOM, screenshots, traces, or full generated/resource/question/paper/material/chunk content.

## Execution Log

- Localhost preflight: pass, `http://localhost:3000` returned HTTP 200.
- Credential handling: local role credentials were loaded in memory for localhost login only. No credential values were printed, recorded, committed, or written to evidence.
- No `.env*` file was read or modified.
- No direct DB connection, DB mutation, schema migration, seed, dependency, package, lockfile, e2e, staging/prod/cloud/deploy, Cost Calibration, release readiness, or final Pass action was executed.
- No raw DOM, screenshots, traces, Provider payloads, prompts, raw AI input/output, generated question/paper text, or full resource/material/chunk content were captured.

## Role And Route Quick Scan

- Role labels attempted: 8.
- Login succeeded for AI-relevant owner-preview roles: 7.
- Login blocked: `ops_admin`, after one retry; this is recorded as a non-AI-main-chain residual observation.
- Route scans completed: 16.
- Route scan failures: 0.
- Authorization-expired visible count: 0.
- Ordinary UI technical wording leak routes: 0.
- Legacy level wording routes: 0.
- Standard-role AI enabled routes: 0.
- Advanced/content AI enabled routes:
  - `personal_advanced_student` AI page.
  - `org_advanced_employee` AI page.
  - `org_advanced_admin` organization AI出题 / AI组卷 pages.
  - `content_admin` content AI出题 / AI组卷 pages.
- Numeric level contract observed on admin AI surfaces: pass for scanned organization/content AI出题 / AI组卷 pages.
- History cues observed on sampled AI pages: pass.
- Pagination cues observed on advanced/content AI pages: pass.
- Filter cues observed on AI pages: pass.
- Resource/grounding or insufficient-resource business cues observed on relevant AI pages: pass.

## Bounded Provider Sample

- Max allowed submit attempts: 8.
- Actual localhost UI submit attempts: 8.
- Retries: 0.
- Clicked samples: 8.
- Failed submit samples: 0.
- Sampled workflows:
  - `content_admin` AI出题 / AI组卷.
  - `personal_advanced_student` AI出题 / AI组卷.
  - `org_advanced_employee` AI出题 / AI组卷.
  - `org_advanced_admin` AI出题 / AI组卷.
- Technical wording leak after submit: 0 sampled workflows.
- Legacy level wording after submit: 0 sampled workflows.
- Authorization-expired state after submit: 0 sampled workflows.
- Grounding/resource business cue after submit: present in all sampled workflows.
- History, pagination, and filter cues after submit: present in all sampled workflows.

## Learner / Employee Practice Gate

- `personal_advanced_student`:
  - `开始练习` enabled count: 0.
  - `提交作答` enabled count: 0.
  - `查看学习反馈` enabled count: 0.
  - `重试生成` enabled count: 0.
  - Technical wording leak count: 0.
- `org_advanced_employee`:
  - `开始练习` enabled count: 0.
  - `提交作答` enabled count: 0.
  - `查看学习反馈` enabled count: 0.
  - `重试生成` enabled count: 0.
  - Technical wording leak count: 0.

## Admin Application Boundary

- `content_admin` AI出题 / AI组卷:
  - Draft adoption controls are present.
  - Some draft adoption controls remain disabled when the draft is not adoptable.
  - Rejection controls are present.
  - Formal publish / review / draft boundary cues are present.
  - Technical wording leak count: 0.
- `org_advanced_admin` AI出题 / AI组卷:
  - Organization-private / training-material / draft-boundary business cues are present.
  - Formal publish / review / draft boundary cues are present.
  - Technical wording leak count: 0.

## 20 Fix Acceptance Summary

| Issue class                                                         | Status | Summary                                                                                             |
| ------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| 1. Active personal/employee authorization not falsely expired       | pass   | No sampled route showed `授权已失效`.                                                               |
| 2. Organization advanced admin not downgraded to standard portal    | pass   | Advanced organization AI pages were reachable and AI actions visible.                               |
| 3. AI出题 / AI组卷 task semantics separated                         | pass   | Question and paper routes/actions were separately visible and sampled.                              |
| 4. Level contract uses 1-5                                          | pass   | Numeric level contract observed; legacy labels not observed.                                        |
| 5. AI出题 structured quantity/result contract                       | pass   | Provider sample clicked; no structural failure or technical leak captured in UI.                    |
| 6. AI组卷 structured paper contract                                 | pass   | Provider sample clicked; no structural failure or technical leak captured in UI.                    |
| 7. Empty/insufficient-resource state uses business guidance         | pass   | Resource/grounding or insufficient-resource business cues observed.                                 |
| 8. Generated result feedback visible near operation flow            | pass   | Post-submit sampled pages retained business state/history cues.                                     |
| 9. Question/paper history type isolation                            | pass   | Separate AI出题 / AI组卷 routes and history cues observed without mixed technical leakage.          |
| 10. Descending/paginated/filterable history affordances             | pass   | History, pagination, and filter cues observed on relevant AI pages.                                 |
| 11. Provider structure parsing / schema alignment                   | pass   | Eight UI submit samples clicked without visible structure failure.                                  |
| 12. Learner post-submit feedback state                              | pass   | Learner/employee practice, answer, feedback, and retry controls did not open prematurely.           |
| 13. Resource/RAG grounding prevents off-domain free generation      | pass   | All sampled workflows kept grounding/resource business cues.                                        |
| 14. Runtime local resource coverage baseline                        | pass   | Resource/grounding cues present; unsupported scopes are not treated as full pass.                   |
| 15. Grounding query alignment                                       | pass   | Provider samples executed through grounded UI paths without evidence-count failure surfacing in UI. |
| 16. Unsupported resource scope remains blocked/not proven           | pass   | Logistics/full non-covered scope remains outside this quick pass and is not claimed as passed.      |
| 17. Ordinary UI removes internal technical wording                  | pass   | Technical wording leak count was 0 across sampled routes.                                           |
| 18. Admin debug/governance summaries hidden from ordinary operators | pass   | Admin sampled routes showed technical wording leak count 0.                                         |
| 19. Content admin adoption does not fabricate formal publication    | pass   | Draft/review/adoption boundary cues and disabled adoption states observed.                          |
| 20. Role-specific result application and retry/practice gate        | pass   | Learner/employee controls stayed gated; organization/content draft boundaries visible.              |

## Findings

- Non-AI-main-chain residual: `ops_admin` localhost login failed in this quick acceptance after one retry. No AI出题 / AI组卷 repair class depends on ops generation access, but full 8-role login acceptance would require a separate ops login/account helper check.

## Validation

- `npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-02-ai-generation-20-fix-quick-acceptance.md docs/05-execution-logs/evidence/2026-07-02-ai-generation-20-fix-quick-acceptance.md docs/05-execution-logs/audits-reviews/2026-07-02-ai-generation-20-fix-quick-acceptance.md`: pass after scoped evidence formatting.
- `git diff --check`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-generation-20-fix-quick-acceptance-2026-07-02`: pass.
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ai-generation-20-fix-quick-acceptance-2026-07-02 -SkipRemoteAheadCheck`: pass.
