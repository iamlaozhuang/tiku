# Acceptance L6 Owner Preview Actual Walkthrough Task Plan

taskId: acceptance-l6-owner-preview-actual-walkthrough-2026-06-23
status: closed
plannedAt: "2026-06-23T02:09:07-07:00"
branch: codex/runtime-blocker-evidence-batch-20260623
owner: laozhuang
codexRole: execution_assistant_and_evidence_preparer_only
approvalConsumed: L6_OWNER_PREVIEW_ACTUAL_WALKTHROUGH_2026_06_23

## Scope

This task executes the approved local L6 owner walkthrough after laozhuang approved:

`批准 L6_OWNER_PREVIEW_ACTUAL_WALKTHROUGH_2026_06_23`

The walkthrough is local-only and evidence-only:

- target only `http://127.0.0.1:3000` or `http://localhost:3000`;
- laozhuang remains the accountable owner;
- Codex may navigate, inspect, and summarize visible states as an execution and evidence assistant;
- Codex must not become the responsible acceptance owner;
- evidence records only role labels, route labels, visible state summaries, pass/fail status, blocked gates, and residual gaps.

## Documents Read

- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/advanced-edition-evidence-redaction-template.md`
- `docs/05-execution-logs/acceptance/2026-06-23-runtime-blocker-evidence-batch-plan.md`
- `docs/05-execution-logs/acceptance/2026-06-23-l6-owner-preview-readiness-package.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-l5-seeded-local-account-run.md`
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l5-seeded-local-account-run.md`
- `docs/05-execution-logs/evidence/2026-06-23-acceptance-l6-owner-preview-readiness.md`
- `docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l6-owner-preview-readiness.md`
- browser runtime skill documentation for the in-app browser.

## Walkthrough Matrix

| Order | Surface                                                  | Expected owner question                                                               | Evidence allowed                                    |
| ----- | -------------------------------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 0     | `/login` and unauthenticated protected routes            | Can unauthenticated users see login and be blocked from protected areas?              | route, visible state summary, pass/fail             |
| 1     | student home and authorization status                    | Can an owner understand the student entry and authorization state?                    | role label, route, status summary                   |
| 2     | personal standard, personal advanced, and upgrade states | Are standard, advanced, upgrade, expiry, and revocation boundaries understandable?    | redacted `personal_auth` and `auth_upgrade` summary |
| 3     | `practice`, `mock_exam`, `exam_report`, `mistake_book`   | Can the student-facing learning and exam path be reviewed locally?                    | route and result summary                            |
| 4     | enterprise authorization and employee training           | Are `org_auth`, enterprise training, and employee boundaries visible?                 | organization role label and redacted status         |
| 5     | content operations                                       | Are `question`, `material`, `paper`, and `knowledge_node` surfaces recognizable?      | route and visible control summary                   |
| 6     | system operations                                        | Are `user`, `organization`, `redeem_code`, and `authorization` surfaces recognizable? | route, count/status summary, no cleartext codes     |
| 7     | audit and AI call log summaries                          | Are `audit_log` and `ai_call_log` summaries visible without sensitive payloads?       | redacted log summary only                           |
| 8     | residual gap confirmation                                | Are partial role-account gaps and blocked gates acceptable for the next decision?     | gap list and owner decision status                  |

## Execution Approach

1. Confirm the current browser tab is local.
2. Use bounded DOM snapshots and targeted checks only.
3. Do not record screenshots, full page text, storage contents, cookies, or localStorage.
4. For login, do not ask Codex to handle passwords unless laozhuang explicitly provides a safe local credential handling instruction. Prefer laozhuang manual login if an authenticated step is needed.
5. Record actual walkthrough outcome as:
   - `pass_local_owner_walkthrough_with_recorded_gaps`;
   - `partial_blocked_pending_owner_login_or_role_account`;
   - `not_ready_due_to_p0_p1`;
   - or `blocked_by_scope_boundary`.

## Final Outcome

Closed at `2026-06-23T02:33:49-07:00`.

Actual result:

`reviewed_with_blocking_student_mistake_book_auth_gap_and_recorded_l6_residual_gaps`

The owner walkthrough generated useful local evidence, but it must not be used to claim Standard MVP Pass, Advanced MVP
Pass, staging readiness, release readiness, production readiness, or final acceptance Pass. The student `mistake_book`
route showed a login-required state while the same student session could access `/home` and `/profile`, so strict
acceptance should repair or explicitly defer that gap before moving to final acceptance.

## Blocked Work

This task does not approve or execute:

- staging, prod, cloud, deploy, public endpoint, object storage, or TLS work;
- Provider/model calls, Provider configuration, raw prompt or response inspection, or Cost Calibration;
- `.env*` access, secret, token, password, cookie, Authorization header, database URL, or localStorage recording;
- schema migration, `drizzle-kit push`, destructive database operation, seed reset, source/test/script/package changes, or dependency changes;
- payment or external-service action;
- push, PR, force push, release readiness, production readiness, or final acceptance Pass.

## Validation Commands

- `npx.cmd prettier --write --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-l6-owner-preview-actual-walkthrough.md docs/05-execution-logs/evidence/2026-06-23-acceptance-l6-owner-preview-actual-walkthrough.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l6-owner-preview-actual-walkthrough.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml`
- `npx.cmd prettier --check --ignore-unknown docs/05-execution-logs/task-plans/2026-06-23-acceptance-l6-owner-preview-actual-walkthrough.md docs/05-execution-logs/evidence/2026-06-23-acceptance-l6-owner-preview-actual-walkthrough.md docs/05-execution-logs/audits-reviews/2026-06-23-acceptance-l6-owner-preview-actual-walkthrough.md docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId acceptance-l6-owner-preview-actual-walkthrough-2026-06-23`

## Stop Conditions

Stop or downgrade the result if:

- browser target leaves local host;
- an authenticated section requires Codex to receive or record credentials;
- evidence would need sensitive data;
- a P0/P1 defect appears;
- the route matrix requires a role account that does not exist in the current local data;
- the next useful step requires Provider, Cost Calibration, staging, prod, deploy, payment, external-service, migration, dependency, or env/secret access.
