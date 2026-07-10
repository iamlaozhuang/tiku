# 2026-07-10 0704 Learner Non-AI Study Acceptance Plan

## Task

- taskId: `0704-learner-non-ai-study-acceptance-2026-07-10`
- branch: `codex/0704-learner-non-ai-study-acceptance`
- mode: validation-only source/test acceptance
- target: ordinary learner `practice`, `mock_exam`, `exam_report`, objective `mistake_book`, resume/continue, content takedown, organization disable, authorization-loss, and standard/advanced baseline access closure without source, test, package, lockfile, schema, migration, seed, DB, Provider, browser, staging, prod, deploy, env, secret, screenshot, or raw DOM execution

## Read Gate

Read before validation:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/stories/epic-03-student-experience.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-07-full-role-uiux-source-implementation-entry.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- recent non-AI learning, content publish, student paper, practice, `mock_exam`, `exam_report`, and `mistake_book` evidence/audit records

Private credential handling:

- metadata-only readiness preflight against `D:/tiku-local-private/acceptance/0704-role-credential-index.private.md`
- evidence records role labels and status categories only
- credential values remain in memory only and are not written to chat, evidence, audit, logs, or repository files

## Acceptance Standard

Validate these task-12 requirements from the 0704 peripheral ledger and current learner SSOT:

- ordinary `practice`, `mock_exam`, result/report, objective `mistake_book`, and resume/continue categories remain usable
- material groups and `paper_section` structure render at status level without leaking answers during `mock_exam`
- refresh, relogin, duplicate entry, content takedown, organization disable, and authorization loss converge safely
- standard and advanced authorization differences do not break baseline non-AI learning access

## Validation Method

Use source and focused tests only:

- inspect learner paper access, `practice`, `mock_exam`, `exam_report`, `mistake_book`, authorization context, and student UI tests
- run focused learner non-AI study tests
- run lint, typecheck, `git diff --check`, and Module Run v2 gates
- no localhost browser login unless a later task-specific approval changes the boundary

## Stop Conditions

Stop and open a separate repair task if validation finds a real source defect such as:

- standard or advanced learners/employees lose ordinary non-AI paper access despite valid authorization
- `mock_exam` answer save or in-exam DTO exposes correctness, `standard_answer`, or `analysis`
- `practice`/`mock_exam` fails to resume, restart, terminate stale state, or enforce authorization invalidation categories
- archived/taken-down content stays available for new learner entry
- objective `mistake_book` includes subjective questions, ignores current authorization, or exposes raw internal identifiers
- source/test failure not attributable to environment or unrelated pre-existing state

## Evidence Boundary

Evidence may record only role labels, route labels, status categories, source marker categories, command names, and test counts.

Evidence must not record credentials, passwords, session/cookie/token/localStorage/Authorization values, env values, DB URLs, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI input/output, full question/paper/material/resource/chunk content, raw employee answers, screenshots, raw DOM, report snapshots, or plaintext `redeem_code`.
