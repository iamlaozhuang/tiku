# Full Acceptance AI Generation Detail Gap Capture

## Scope

This traceability note turns the current acceptance concern into explicit verification rows. AI question generation and
AI paper generation are not functionally accepted by route reachability alone.

This task is governed by the owner-facing role checklist:
`docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`. The durable goal cannot be marked
complete until every applicable row in that checklist has redacted coverage evidence and no unresolved required failure
remains.

## Governance Gates

- threadRolloverGate: pass; resume from `project-state.yaml`, `task-queue.yaml`, task plan, and evidence only.
- automationHandoffPolicy: no automation handoff; continue by the next queued task after local commit/merge/push cleanup.
- Cost Calibration Gate remains blocked.
- Provider execution remains blocked.
- Final Pass remains blocked.

## Required Detail Controls

| Surface                  | Required control category                                                                                         | Acceptance meaning                                                               |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| AI question generation   | `profession`, `level`, `subject`                                                                                  | Generation scope is explicit and aligned to Tiku content taxonomy.               |
| AI question generation   | `question_type`, quantity, difficulty                                                                             | The user can constrain what kind and how many questions are requested.           |
| AI question generation   | `knowledge_node` or tag constraints                                                                               | The user can target learning/content coverage without recording full content.    |
| AI question generation   | optional material/resource context                                                                                | The workflow can use allowed context without exposing complete material content. |
| AI question generation   | draft/review boundary                                                                                             | Output stays isolated and does not directly create formal `question`.            |
| AI paper generation      | `profession`, `level`, `subject`, `paper_type`                                                                    | Paper scope and type are explicit.                                               |
| AI paper generation      | `paper_section` structure, question type distribution, quantity or total score, difficulty distribution           | The user can shape the paper instead of invoking an opaque route.                |
| AI paper generation      | `knowledge_node` or tag coverage                                                                                  | Paper coverage can be constrained and later audited by summary.                  |
| AI paper generation      | draft/review boundary                                                                                             | Output stays isolated and does not directly create formal `paper`.               |
| Standard role boundaries | Standard learner, employee, and organization admin unavailable or denied states for advanced AI generation routes | Standard edition does not receive advanced AI generation capability.             |

## Owner Checklist Mapping

| Checklist role row          | AI generation item mapped by this task                                                  |
| --------------------------- | --------------------------------------------------------------------------------------- |
| `org_advanced_admin`        | Organization `AI出题` and organization `AI组卷` detail controls and ownership boundary. |
| `org_standard_admin`        | Direct advanced AI routes show denied or standard-unavailable state.                    |
| `org_advanced_employee`     | Learner `AI训练` AI question and AI paper generation detail controls.                   |
| `org_standard_employee`     | Learner advanced AI route denial or standard-unavailable state.                         |
| `content_admin`             | Content `AI出题` and content `AI组卷` draft/review detail controls.                     |
| `personal_advanced_student` | Learner `AI训练` AI question and AI paper generation detail controls.                   |
| `personal_standard_student` | Learner advanced AI route denial or standard-unavailable state.                         |
| `ops_admin`                 | Out of scope for AI generation control capture except content/organization AI denial.   |

## Evidence Rules

Allowed evidence: role labels, route labels, visible control category labels, workflow/status labels, counts, and
redacted pass/fail summaries.

Forbidden evidence: credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, raw DOM,
screenshots, traces, raw DB rows, internal ids, PII, Provider payloads, prompts, raw AI input/output, and complete
question/paper/material/resource/chunk content.

## Out Of Scope

- Provider calls or prompt execution.
- Submit/generate actions that create AI tasks or draft content.
- Direct DB inspection or mutation.
- Source, test, schema, migration, seed, package, or lockfile changes.
- Release readiness or final Pass.
