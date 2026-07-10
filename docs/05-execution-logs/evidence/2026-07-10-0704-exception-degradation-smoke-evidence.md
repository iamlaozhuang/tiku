# 2026-07-10 0704 Exception Degradation Smoke Evidence

## Scope

- Task id: `0704-exception-degradation-smoke-2026-07-10`
- Branch: `codex/0704-exception-degradation-smoke`
- Mode: validation-only targeted local contract smoke.

## Boundary

- Evidence records only role labels, authorization context categories, status categories, file labels, and command results.
- No credential, password, cookie, token, session, localStorage, Authorization header, env value, DB URL, raw DB row,
  internal numeric id, Provider payload, raw prompt, raw AI output, full question, full paper, material, resource, chunk,
  plaintext `redeem_code`, employee raw answer, stack trace, screenshot, trace, or raw DOM is recorded.
- No Provider execution, Provider-enabled run, browser runtime, dev server, direct DB connection, DB mutation, formal
  product data write, schema migration, seed, package, lockfile, dependency, staging/prod/deploy, PR, force push, or Cost
  Calibration operation was performed.

## Readiness Preflight

Private index and canonical catalog were read in memory only from `D:\tiku-local-private\acceptance`.

| Role label                  | Auth context category           | Readiness category    |
| --------------------------- | ------------------------------- | --------------------- |
| `super_admin`               | `admin_session_no_learner_auth` | `ready_0704_verified` |
| `ops_admin`                 | `ops_admin_only`                | `ready_0704_verified` |
| `content_admin`             | `content_admin_only`            | `ready_0704_verified` |
| `personal_standard_student` | `standard_only_context`         | `ready_0704_verified` |
| `personal_advanced_student` | `personal_advanced_ai_context`  | `ready_0704_verified` |
| `org_standard_admin`        | `org_standard_admin_context`    | `ready_0704_verified` |
| `org_advanced_admin`        | `org_advanced_admin_context`    | `ready_0704_verified` |
| `org_standard_employee`     | `standard_only_context`         | `ready_0704_verified` |
| `org_advanced_employee`     | `org_advanced_ai_context`       | `ready_0704_verified` |

## Requirement Mapping

- `04-ai-scoring.md`: AI scoring/explanation failures produce retryable or unavailable status categories without blocking unrelated learning flows.
- `05-rag-knowledge.md`: weak or none `evidence_status` must not fabricate citations.
- `06-admin-ops.md`: `ai_call_log` detail is redacted; raw Prompt, Provider payload, raw AI IO, full content, and raw employee answer stay hidden.
- `ADV-MOD-02`: failed AI task status exposes safe failure category and retry state only.
- `ADV-MOD-03`: learner AI output stays outside formal `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- `ADV-MOD-08`: organization AI `evidence_status = none` blocks publish/adoption, and weak evidence requires confirmation.
- `2026-07-06-ai-generation-recontract-requirements-materialization.md`: AI组卷 uses plan-and-select and must not invent questions when source data is insufficient.
- `CT-REQ-049`: AI call log details stay redacted.

## Targeted Contract Smoke

Command:

`corepack pnpm@10.26.1 exec vitest run src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts src/server/services/ai-paper-route-assembly-service.test.ts src/server/services/ai-paper-route-plan-select-wiring-service.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts src/server/services/personal-ai-generation-request-flow-service.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-result-persistence-service.test.ts src/server/services/admin-ai-generation-failed-retry-state-service.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/admin-logs/admin-log-retention-redaction-layering.test.ts tests/unit/ai/provider-redaction-function-contract.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts`

Result: pass, 16 files, 206 tests.

Covered status categories:

| Surface                         | Boundary result                                                                  |
| ------------------------------- | -------------------------------------------------------------------------------- |
| Provider disabled               | `provider_call_blocked`, no Provider/env/config access                           |
| Provider output redaction       | Provider payload, raw prompt, raw output, secret-like marker, and stack hidden   |
| Provider-generated paper bodies | `provider_question_content_forbidden`                                            |
| AI组卷 insufficient sources     | `insufficient_formal_question_source`, no invented question                      |
| AI组卷 degradation              | exact, nearby knowledge, and same-scope match categories retained                |
| RAG grounding weak/none         | weak requires confirmation where applicable; none blocks publish/adoption        |
| Learner AI handoff failure      | missing selected source, missing source result, and insufficient grounding block |
| Learner AI formal boundary      | formal `practice`, `answer_record`, `exam_report`, and `mistake_book` blocked    |
| Admin retry state               | retry request state is redacted and does not execute Provider or mutation        |
| Admin log detail                | redacted summaries only; logs remain read-only                                   |
| Organization training publish   | invalid, unauthorized, and lineage-failure paths use safe envelopes              |
| Employee answer routes          | raw answer fields are not persisted or returned in route envelopes               |

## Validation Commands

| Command                              | Result            |
| ------------------------------------ | ----------------- |
| Redacted 9-role readiness preflight  | pass              |
| Targeted exception degradation smoke | pass_16_files_206 |
| Scoped Prettier write                | pass              |
| Scoped Prettier check                | pass              |
| `git diff --check`                   | pass              |
| Blocked-path diff guard              | pass_no_output    |
| `lint`                               | pass              |
| `typecheck`                          | pass              |
| Module Run v2 pre-commit hardening   | pass              |
| Module Run v2 pre-push readiness     | pass              |

## Conclusion

The current targeted contracts pass for Provider-disabled behavior, AI组卷 insufficiency and degradation, RAG weak/none
evidence gates, learner AI failure and formal-write boundaries, admin log redaction, and organization training failure
envelopes. No current code defect was found in this validation scope.
