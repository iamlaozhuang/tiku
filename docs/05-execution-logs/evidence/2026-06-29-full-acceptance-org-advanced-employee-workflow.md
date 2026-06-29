# Full Acceptance Org Advanced Employee Workflow Evidence

- Task id: `full-acceptance-org-advanced-employee-workflow-2026-06-29`
- Branch: `codex/org-advanced-employee-workflow-20260629`
- Evidence status: closed
- Result: blocked_org_advanced_employee_ai_detail_controls_missing_enterprise_training_pass_no_final_pass
- Updated at: `2026-06-29T01:08:00-07:00`
- Batch range: single scoped acceptance task.
- Commit: `a8a3e0935`.

## Boundary Confirmation

- Goal materialized before browser/account execution: pass.
- Browser target: localhost or `127.0.0.1` only.
- Approved private account file use: read-only login input for `org_advanced_employee` only, no evidence of raw contents.
- Direct DB access/mutation/schema/migration/seed: blocked and not executed.
- Provider/config/prompt/raw AI IO: blocked and not executed.
- Source/test/dependency/package/lockfile changes: blocked and not executed.
- Release readiness/final Pass/Cost Calibration: blocked and not claimed.
- Sensitive evidence capture: blocked and not captured.
- Cost Calibration Gate remains blocked.

## RED Evidence

RED: pass.

- Remaining coverage audit showed `org_advanced_employee` enterprise training and learner AI question/paper rows had no
  current workflow-level evidence beyond route/session coverage.
- Failure class before this task: unproven workflow row.
- The owner-facing checklist requires employee AI `profession`, `level`, `subject`, `knowledge_node`, question type,
  count, difficulty, learning goal, paper distribution, coverage, and time-target controls where implemented.

## GREEN Evidence

GREEN: blocked_validation_failure.

- `org_advanced_employee.enterprise_training`: scoped pass. The learner session reached `/organization-training` with
  organization context, training workflow terms, start/continue-like action count 1, save/submit-like action count 2,
  form input count 3, and error count 0.
- `org_advanced_employee.employee_ai_question_generation`: blocked. `/ai-generation` exposes an `AI出题` entry, but
  clicking it did not leave `/ai-generation`; common learner direct routes returned not-found status, and the page had
  0 input/select/textarea controls for the required detail fields.
- `org_advanced_employee.employee_ai_paper_generation`: blocked. `/ai-generation` exposes an `AI组卷` entry, but
  clicking it did not leave `/ai-generation`; common learner direct routes returned not-found status, and the page had
  0 input/select/textarea controls for the required detail fields.

## Runtime Evidence

All runtime evidence below is redacted to role/route/workflow/status/count summaries only.

| Check                                             | Result                                                                                                                                                   |
| ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Test-owned `org_advanced_employee` login          | pass; final path `/home`; login prompt count 0; learner context count 46; organization context count 1; error count 0                                    |
| Home entry discovery                              | pass; `/ai-generation` count 1; `/organization-training` count 1; practice and mock entries present as learner context                                   |
| Enterprise training route                         | pass; final path `/organization-training`; organization context count 3; training workflow count 4; action counts start 1 / submit-save 2; error count 0 |
| AI training entry route                           | partial; final path `/ai-generation`; visible AI entry buttons count 2; detail form input/select/textarea counts all 0                                   |
| AI question entry click                           | blocked; final path stayed `/ai-generation`; required detail field control counts all 0; Provider trigger count 0                                        |
| AI paper entry click                              | blocked; final path stayed `/ai-generation`; required detail field control counts all 0; Provider trigger count 0                                        |
| Direct learner AI question route candidates       | blocked; not-found count 1 on checked learner routes; no detail controls                                                                                 |
| Direct learner AI paper route candidates          | blocked; not-found count 1 on checked learner routes; no detail controls                                                                                 |
| Organization-prefixed AI routes for employee role | denied/guarded; did not expose employee detail controls                                                                                                  |
| Session regression after route checks             | pass; `/home` returned learner context count 46; login prompt count 0; error count 0                                                                     |

## Blocking Findings

- Finding id: `ORG-ADV-EMP-AI-001`
- Role: `org_advanced_employee`
- Rows: `employee_ai_question_generation`, `employee_ai_paper_generation`
- Severity: major
- Fix class: `workflow`
- Expected: learner AI question and AI paper workflows expose detail controls for authorization context, `profession`,
  `level`, `subject`, `knowledge_node`, count, question type, difficulty, learning goal, and paper-specific
  distribution/coverage/time fields where implemented.
- Observed: only the `/ai-generation` entry page is reachable. The two entry buttons do not navigate to detail flows,
  common learner direct routes are not found, and required detail controls are absent.
- Safe next action: create a Stage C source/test repair task for the learner `StudentPersonalAiGenerationPage` and
  related route/tests, reusing existing personal AI generation contracts and services. No Provider call is needed.

## Validation Results

- Browser workflow evidence: pass_blocked; command anchor `browser_org_advanced_employee_workflow_redacted`.
- Scoped prettier write: pass.
- Scoped prettier check: pass.
  Command:
  `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-29-full-acceptance-org-advanced-employee-workflow.md docs/05-execution-logs/task-plans/2026-06-29-full-acceptance-org-advanced-employee-workflow.md docs/05-execution-logs/evidence/2026-06-29-full-acceptance-org-advanced-employee-workflow.md docs/05-execution-logs/audits-reviews/2026-06-29-full-acceptance-org-advanced-employee-workflow.md docs/05-execution-logs/acceptance/2026-06-29-full-acceptance-org-advanced-employee-workflow.md`.
- `git diff --check`: pass.
  Command: `git diff --check`.
- Module Run v2 precommit hardening: pass.
  Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-org-advanced-employee-workflow-2026-06-29`.
- Module Run v2 closeout readiness: pass.
  Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-org-advanced-employee-workflow-2026-06-29`.
- Module Run v2 prepush readiness: pass.
  Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-org-advanced-employee-workflow-2026-06-29 -SkipRemoteAheadCheck`.

## Blocked Remainder

- localFullLoopGate: this task closes only the scoped `org_advanced_employee` evidence capture. It does not repair the
  employee AI workflow defect and does not complete the durable full acceptance matrix.
- blocked remainder: employee AI question/paper detail workflows require a later Stage C source/test repair and browser
  rerun.
- nextModuleRunCandidate: `repair-org-advanced-employee-ai-generation-detail-controls-2026-06-29`.
- Thread Rollover Decision: not required before this scoped blocked-evidence closeout.
- Release readiness, final Pass, Provider execution, Cost Calibration Gate, staging/prod/deploy, PR, force-push,
  dependency changes, direct DB access, schema/migration/seed, and sensitive evidence remain blocked.
