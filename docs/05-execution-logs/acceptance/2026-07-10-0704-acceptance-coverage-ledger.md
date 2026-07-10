# 2026-07-10 0704 Acceptance Coverage Ledger

## Purpose

This ledger freezes completed 0704 localhost acceptance coverage and identifies only incremental gaps that still need
targeted validation. It is intended to prevent repeated full-chain reruns after the same evidence has already passed.

## Boundary

- Target: localhost 0704 acceptance planning only.
- Evidence mode: role labels, route labels, status categories, and evidence file references only.
- No credential, password, cookie, token, session, localStorage, Authorization header, env value, DB URL, raw DB row,
  internal numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk,
  plaintext `redeem_code`, employee raw answer, screenshot, trace, or raw DOM is recorded.
- This ledger does not run Provider, staging/prod/deploy, Cost Calibration, direct DB mutation, destructive DB operation,
  source change, test change, package change, lockfile change, schema change, migration, or seed.

## Current 0704 Credential Gate

| Role label                  | Readiness category    | Reuse decision |
| --------------------------- | --------------------- | -------------- |
| `super_admin`               | `ready_0704_verified` | preflight only |
| `ops_admin`                 | `ready_0704_verified` | preflight only |
| `content_admin`             | `ready_0704_verified` | preflight only |
| `personal_standard_student` | `ready_0704_verified` | preflight only |
| `personal_advanced_student` | `ready_0704_verified` | preflight only |
| `org_standard_admin`        | `ready_0704_verified` | preflight only |
| `org_advanced_admin`        | `ready_0704_verified` | preflight only |
| `org_standard_employee`     | `ready_0704_verified` | preflight only |
| `org_advanced_employee`     | `ready_0704_verified` | preflight only |

Source: `docs/05-execution-logs/evidence/2026-07-10-0704-role-credential-catalog-consolidation-evidence.md`.

## Closed / No-Rerun Coverage

| Coverage area                                              | Status | Reuse decision | Primary evidence anchors                                                                                                                                                                                                                                                                                             |
| ---------------------------------------------------------- | ------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0704 credential catalog and 9-role readiness               | closed | no full rerun  | `2026-07-10-0704-role-credential-catalog-consolidation-evidence.md`                                                                                                                                                                                                                                                  |
| Content admin AI出题 formal question publish loop          | closed | no full rerun  | `2026-07-09-content-ai-question-formal-publish-loop.md`, `2026-07-09-content-ai-0704-question-publish-replay.md`, `2026-07-09-content-ai-0704-final-role-regression.md`                                                                                                                                              |
| Content admin AI组卷 formal paper publish loop             | closed | no full rerun  | `2026-07-09-content-ai-paper-formal-publish-loop.md`, `2026-07-09-content-ai-0704-paper-publish-replay.md`, `2026-07-09-content-ai-0704-final-role-regression.md`                                                                                                                                                    |
| Personal advanced learner AI出题/AI组卷 self-practice      | closed | smoke only     | `2026-07-09-learner-ai-session-server-questions-evidence.md`, `2026-07-09-learner-ai-paper-session-container-evidence.md`, `2026-07-09-learner-ai-paper-container-history-evidence.md`, `2026-07-09-learner-ai-paper-preview-state-evidence.md`                                                                      |
| Organization advanced employee AI出题/AI组卷 self-practice | closed | smoke only     | `2026-07-09-content-ai-0704-final-role-regression.md`, learner AI history/session evidence listed above                                                                                                                                                                                                              |
| Standard personal and standard employee AI denial          | closed | no full rerun  | `2026-07-09-learner-ai-0704-account-readiness-evidence.md`, `2026-07-09-content-ai-0704-final-localhost-acceptance.md`, `2026-07-04-full-chain-scenario-8-standard-personal-learning.md`, `2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning.md` |
| Standard personal ordinary learning                        | closed | no full rerun  | `2026-07-04-full-chain-scenario-8-standard-personal-learning.md`, `2026-05-23-phase-9-student-practice-runtime-completion.md`, `2026-05-23-phase-9-student-mock-exam-report-runtime-completion.md`, `2026-05-22-phase-8-student-mistake-book-runtime.md`                                                             |
| Standard employee ordinary learning                        | closed | no full rerun  | `2026-07-04-full-chain-scenario-10-standard-employee-learning-rerun-after-duplicate-active-practice-state-provisioning.md`                                                                                                                                                                                           |
| Organization AI to enterprise training draft               | closed | smoke only     | `2026-07-06-organization-ai-training-closed-loop.md`, `2026-07-08-org-ai-question-to-training-draft.md`, `2026-07-08-org-ai-paper-to-training-draft.md`, `2026-07-08-org-ai-training-loop-regression.md`                                                                                                             |
| Enterprise training employee answer and analytics          | closed | smoke only     | `2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md`, `2026-07-05-full-chain-scenario-12-advanced-org-admin-analytics-training-rerun-after-activity-provisioning.md`                                                                                    |
| Backend role/workspace isolation                           | closed | no full rerun  | `2026-07-05-admin-permission-session-contract-cleanup.md`, `2026-07-07-organization-admin-training-ai-cleanup-evidence.md`, `2026-07-09-content-ai-local-e2e-regression.md`                                                                                                                                          |
| Learner AI employee privacy boundary                       | closed | no full rerun  | `2026-07-09-learner-ai-employee-privacy-boundary-evidence.md`, `2026-07-09-learner-ai-credential-localhost-acceptance-evidence.md`, `2026-07-09-learner-ai-0704-account-readiness-evidence.md`                                                                                                                       |

## Incremental Validation Backlog

| Priority | Task id                          | Status target | Scope                                                                                                                                         | Rerun rule                                                                                        |
| -------- | -------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 1        | `0704-log-privacy-smoke`         | closed        | Admin-visible log/privacy surfaces: redacted references, summaries, employee learner AI raw boundary, no raw answer or raw generated content. | Closed by targeted log/privacy contract smoke; no full training or learner AI generation rerun.   |
| 2        | `0704-history-recovery-smoke`    | closed        | AI出题/AI组卷 history recovery, refresh/re-login/resume categories for advanced learner and employee contexts.                                | Closed by targeted history recovery contract smoke; no fresh Provider output or formal practice.  |
| 3        | `0704-rag-citation-smoke`        | closed        | `knowledge_node`, resource, citation, and `evidence_status` propagation in AI/RAG surfaces.                                                   | Closed by targeted contract smoke; Provider-enabled execution remains blocked.                    |
| 4        | `0704-enterprise-training-smoke` | optional      | Minimal current-catalog role smoke for enterprise training visibility, standard denial, answerability, and aggregate-only admin visibility.   | Run only if the previous three tasks reveal a fresh integration risk or user explicitly requests. |

## Operating Rule

Before any later 0704 business validation:

1. Read the private index and canonical private catalog from `D:\tiku-local-private\acceptance`.
2. Run a redacted readiness preflight for in-scope roles.
3. If readiness fails, stop business validation and open an account-readiness task.
4. If business validation finds a current source issue, stop the validation task and open a separate `codex/*` repair branch.
5. Evidence remains redacted and must not include credential material, raw data, Provider payloads, raw prompts, raw AI
   output, or complete content.

## Result

Current recommendation: do not repeat the closed no-rerun chains. The planned incremental smoke backlog is closed.
`0704-enterprise-training-smoke` remains optional only if a later fresh integration risk appears or the user explicitly
requests it.
