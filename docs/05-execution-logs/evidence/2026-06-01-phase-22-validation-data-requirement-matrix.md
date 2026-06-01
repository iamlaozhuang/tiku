# Phase 22 Validation Data Requirement Matrix Evidence

## Summary

- Result: pass with data-prep gaps identified.
- Scope: docs_only.
- Changed surfaces: evidence, task plan, queue/state only.
- Gates: entity requirement scan pass; git inventory pass.
- Forbidden scope (`forbiddenScope`): no `.env.local` values, env edits, dependency changes, script/source/test/e2e/schema/drizzle changes, DB reset, raw SQL, destructive data, staging/prod/cloud/deploy, real provider, or external service.
- Residual gaps (`residualGaps`): complete fresh DB e2e requires explicit seed/bootstrap or validation-data prep for entities not fully covered by the current dev seed.

## Commands

### Entity requirement scan

Command:

```text
rg -n "user|session|authorization|organization|org_auth|redeem_code|question|material|paper|paper_section|practice|mock_exam|answer_record|exam_report|mistake_book|ai_call_log" docs e2e src/server src/db/schema -g "!*.env*" -g "!node_modules/**"
```

Result: pass.

Sanitized findings:

- Schema and runtime references exist for every required entity category.
- E2e specs use a mix of seeded baseline data and runtime-created synthetic data.
- Complete fresh DB acceptance is not just migration readiness; it needs a minimum validation dataset or a deterministic preparation flow.

### Git inventory

Command:

```text
git status --short --branch
```

Result: pass.

Sanitized output:

```text
branch: codex/phase-22-fresh-db-seed-bootstrap-readiness
changed: project-state, task-queue, task plans, evidence
forbidden files: not changed
```

## Minimum Synthetic Validation Data Matrix

| Entity area                 | Minimum synthetic data for full e2e                                                                                                                                                       | Current support observed                                                                                                                 | Fresh DB readiness judgment                                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `user`                      | At least one active admin-capable account and one active student account with safe local credentials. Additional per-run student accounts may be needed for positive/negative role flows. | Existing dev seed covers baseline admin and student users; role-based e2e can create per-run student accounts.                           | Baseline exists; full determinism still depends on registration/runtime creation behavior.                             |
| `session`                   | Browser/API session token for each role used by e2e; token must be generated through login/runtime only.                                                                                  | E2e obtains local session tokens through UI login and local storage.                                                                     | No seed requirement; depends on auth runtime and baseline users.                                                       |
| `authorization`             | Student must have an active authorization matching target `profession` and `level`; negative student must lack it.                                                                        | Existing dev seed covers a baseline personal authorization; role-based flow can redeem a newly generated code for one student.           | Baseline exists, but complete acceptance needs deterministic positive and negative authorization states.               |
| `organization` / `org_auth` | At least one active organization. For enterprise scope checks, one active `org_auth` linked to organization scope and quota.                                                              | Existing dev seed covers organization. Role-based flow can create or reuse `org_auth` through admin API.                                 | `organization` baseline exists; `org_auth` requires runtime creation or future validation data prep.                   |
| `redeem_code`               | At least one safe redeemable code for positive flow and list/detail rows for admin flow. Evidence must never record plaintext code.                                                       | Existing dev seed includes a used baseline row for admin/list visibility. Role-based e2e creates a fresh code for redemption at runtime. | Admin baseline exists; positive redemption needs runtime creation or approved validation prep.                         |
| `question`                  | At least one available question with scoring-ready answer data and option/scoring metadata matching the target paper.                                                                     | Existing dev seed covers one single-choice question and related options. Role-based content flow may create more content.                | Baseline exists for simple objective flows.                                                                            |
| `material`                  | At least one available material if content creation/readiness flow requires material-backed question creation.                                                                            | Existing dev seed does not appear to seed material. Role-based content readiness can create material at runtime.                         | Requires runtime creation or validation data prep for full content e2e.                                                |
| `paper` / `paper_section`   | At least one published paper with one section and linked paper question.                                                                                                                  | Existing dev seed covers one published paper, one `paper_section`, and one linked paper question.                                        | Baseline exists for simple student practice/mock flow.                                                                 |
| `practice`                  | A practice session for student answer flow, either created during e2e or pre-created only if a future validation plan requires it.                                                        | E2e creates and restarts practice through API.                                                                                           | No seed row required, but depends on baseline user, authorization, paper, and question data.                           |
| `mock_exam`                 | A mock exam session for answer/submit/report flow.                                                                                                                                        | E2e creates mock exam through API.                                                                                                       | No seed row required, but depends on baseline user, authorization, paper, and question data.                           |
| `answer_record`             | At least one answer record generated by practice/mock answer submission.                                                                                                                  | E2e creates answer records through practice and mock answer APIs.                                                                        | Runtime-generated; deterministic prerequisites are user/auth/paper/question.                                           |
| `exam_report`               | At least one report created from a submitted mock exam for report-list/detail flows.                                                                                                      | E2e creates exam report through API after mock submit.                                                                                   | Runtime-generated; deterministic prerequisites are completed mock exam and answer data.                                |
| `mistake_book`              | At least one mistake-book item for student mistake-book and AI explanation surfaces.                                                                                                      | Existing student e2e expects at least one visible item after prior flows or generated runtime state.                                     | Needs explicit deterministic generation path; current seed does not directly provide a complete mistake-book baseline. |
| `ai_call_log`               | At least one local/mock AI call log for admin read and retry/persistence assertions.                                                                                                      | Local/mock AI scoring/persistence tests and e2e can create/read logs through runtime paths.                                              | Requires deterministic local/mock runtime invocation or approved validation prep; real provider remains blocked.       |

## Matrix Conclusion

Existing mechanisms are enough to identify the minimum data shape, but they do not yet prove a one-command fresh empty DB acceptance path. A complete path needs either:

- an approved seed/bootstrap mechanism that creates all baseline prerequisites idempotently; or
- an approved validation data preparation sequence that creates missing rows through existing local/dev runtime APIs before full e2e.

This task does not create or modify any data.

## Stop-The-Line Assessment

No stop-the-line blocker for the next child task. Continue to the existing seed/bootstrap capability assessment.

## Evidence Hygiene

This evidence intentionally omits `.env.local` values, DB URLs, credentials, tokens, provider payloads, raw prompts, raw student answers, raw model responses, raw SQL output, plaintext `redeem_code`, full papers, full textbooks, OCR full text, and customer/customer-like private data.
