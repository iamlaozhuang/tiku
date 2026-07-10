# 2026-07-10 0704 History Recovery Smoke Evidence

## Scope

- Task id: `0704-history-recovery-smoke-2026-07-10`
- Branch: `codex/0704-history-recovery-smoke`
- Mode: validation-only targeted local contract smoke.

## Boundary

- Evidence records only role labels, status categories, route labels, file labels, and command results.
- No credential, password, cookie, token, session, localStorage, Authorization header, env value, DB URL, raw DB row,
  internal numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk,
  plaintext `redeem_code`, employee raw answer, screenshot, trace, or raw DOM is recorded.
- No Provider execution, AI generation submit against localhost, browser runtime, dev server, direct DB connection, DB
  mutation, formal `practice`, formal `answer_record`, formal `exam_report`, formal `mistake_book`, schema migration,
  seed, package, lockfile, dependency, staging/prod/deploy, PR, force push, or Cost Calibration operation was performed.

## Readiness Preflight

Private index and canonical catalog were read in memory only from `D:\tiku-local-private\acceptance`.

| Role label                  | Readiness category    |
| --------------------------- | --------------------- |
| `super_admin`               | `ready_0704_verified` |
| `ops_admin`                 | `ready_0704_verified` |
| `content_admin`             | `ready_0704_verified` |
| `personal_standard_student` | `ready_0704_verified` |
| `personal_advanced_student` | `ready_0704_verified` |
| `org_standard_admin`        | `ready_0704_verified` |
| `org_advanced_admin`        | `ready_0704_verified` |
| `org_standard_employee`     | `ready_0704_verified` |
| `org_advanced_employee`     | `ready_0704_verified` |

## Requirement And Evidence Mapping

- `ADV-MOD-03`: personal advanced learners and organization advanced employees own isolated learner AI history and
  self-practice flows.
- `ADV-MOD-08`: organization admins do not inspect employee learner AI raw outputs; organization-owned AI output remains a separate domain.
- `edition-aware-authorization-requirements.md` and ADR-007: runtime services enforce `effectiveEdition` and selected
  authorization context.
- `2026-07-05-ai-generation-closed-loop-target-alignment.md`: learner AI generated results must become persisted
  private training attempts that can be answered, resumed, and reviewed without formal writes.
- `2026-07-06-ai-generation-recontract-requirements-materialization.md`: AI组卷 history recovery uses redacted paper
  container summaries from selected formal sources, not raw generated full questions.
- Existing evidence anchors:
  - `2026-07-09-learner-ai-paper-container-history-evidence.md`
  - `2026-07-09-learner-ai-paper-preview-state-evidence.md`
  - `2026-07-09-learner-ai-session-server-questions-evidence.md`
  - `2026-07-09-learner-ai-final-regression-evidence.md`

## Targeted Contract Smoke

Command:

`corepack pnpm@10.26.1 exec vitest run tests/unit/student-personal-ai-generation-ui.test.ts src/server/validators/personal-ai-generation-request.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-request-history-service.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-result-persistence-service.test.ts src/server/services/personal-ai-generation-route-integrated-result-materialization-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-learning-session-route.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-learning-session-paper-source-resolver.test.ts`

Result: pass, 12 files, 138 tests.

Covered status categories:

| Surface                              | Boundary result                                                                  |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| Request history initial load         | server-backed redacted history loads by session context                          |
| Post-submit history refresh          | request and result histories refresh after accepted local response               |
| History error recovery               | redacted error state hides private stack/content markers                         |
| Task-type history filters            | AI出题 and AI组卷 histories are queried separately with visible filter state     |
| Result history/detail                | session-owned detail lookup ignores stale query ownership                        |
| AI组卷 paper assembly history        | redacted summary is recoverable; selected refs/raw question bodies remain hidden |
| Personal learner session progress    | persisted answer feedback returns resumable progress                             |
| Organization employee session resume | organization ownership is preserved and actor isolation blocks other employees   |
| Formal write boundary                | `practice`, `answer_record`, `exam_report`, and `mistake_book` writes blocked    |

## Validation Commands

| Command                             | Result            |
| ----------------------------------- | ----------------- |
| Redacted 9-role readiness preflight | pass              |
| Targeted history recovery smoke     | pass_12_files_138 |
| Scoped Prettier write               | pass              |
| Scoped Prettier check               | pass              |
| `git diff --check`                  | pass              |
| Blocked-path diff guard             | pass_no_output    |
| `lint`                              | pass              |
| `typecheck`                         | pass              |
| Module Run v2 pre-commit hardening  | pass              |
| Module Run v2 pre-push readiness    | pass              |

## Conclusion

The current targeted contracts pass for AI出题/AI组卷 history loading, post-submit refresh, redacted result detail,
AI组卷 paper summary recovery, and learner AI session progress/resume boundaries. No current code defect was found in this
validation scope.
