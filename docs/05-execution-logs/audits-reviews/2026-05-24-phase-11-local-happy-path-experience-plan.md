# Audit Review: phase-11-local-happy-path-experience-plan

## Boundary

This audit converts the user's manual experience feedback into a local fresh-system happy path plan.

No application code, dependency, database schema, migration, script, `.env`, staging/prod endpoint, deployment target, cloud resource, provider configuration, or secret is changed.

## Why The Feedback Is Valid

The user's confusion is expected from the current state. The local product has many route-level and role-level surfaces, but it does not yet provide one fresh-system walkthrough that starts with setup actions and ends with a student completing answer flows.

The current flow is not just missing polish. It mixes:

- seeded already-authorized student data;
- admin/content pages that are partly read-only or scoped to explicit unavailable states;
- practice/mock_exam runtime paths that can still show incomplete option or restart behavior in manual local state;
- no obvious student logout action for role switching;
- no available redeem_code for the user to complete a fresh redemption loop.

## Findings

| id        | severity | role                             | route                                           | finding                                                                                                                                                                                                 | stagingDecision                              | recommendedOwnerTask                                 |
| --------- | -------- | -------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------- |
| `LHP-001` | `P1`     | `student`                        | `/practice?paperPublicId=paper-dev-theory`      | Single-choice question can render without visible answer options, blocking answer submission.                                                                                                           | `fix_before_fresh_system_happy_path`         | `phase-11-local-happy-path-student-answer-flow`      |
| `LHP-002` | `P1`     | `student`                        | `/practice?paperPublicId=paper-dev-theory`      | Visible restart button does not perform a restart action.                                                                                                                                               | `fix_before_fresh_system_happy_path`         | `phase-11-local-happy-path-student-answer-flow`      |
| `LHP-003` | `P1`     | `student`                        | `/mock-exam?paperPublicId=paper-dev-theory`     | Single-choice question can render without visible options, blocking save answer and next-step behavior.                                                                                                 | `fix_before_fresh_system_happy_path`         | `phase-11-local-happy-path-student-answer-flow`      |
| `LHP-004` | `P1`     | `student`                        | `/profile`                                      | No clear logout action, making role switching and fresh-start validation difficult.                                                                                                                     | `fix_before_fresh_system_happy_path`         | `phase-11-local-happy-path-student-session-controls` |
| `LHP-005` | `P1`     | `student/system ops`             | `/profile`, `/redeem-code`, `/ops/redeem-codes` | No available redeem_code is presented for a fresh student redemption loop. Existing local seed has an already-used code.                                                                                | `fix_or_seed_before_fresh_system_happy_path` | `phase-11-local-happy-path-redeem-code-loop`         |
| `LHP-006` | `P1`     | `content ops/system ops/student` | full journey                                    | There is no single local acceptance script that starts from fresh setup actions: create question, compose/publish paper, create organization/org_auth, generate redeem_code, student redeem and answer. | `plan_before_staging_resource_work`          | `phase-11-local-happy-path-acceptance-script`        |

## Fresh-System Happy Path Target

The local happy path should be role-sequenced instead of route-random:

1. `content ops` logs in and creates a minimal accepted content set:
   - at least three objective questions with visible question_option data;
   - one published paper with those questions;
   - enough paper metadata for student list, practice, mock_exam, exam_report, and mistake_book flows.
2. `system ops` logs in and creates access:
   - one organization;
   - one org_auth for the published paper scope or profession/level scope;
   - one unused redeem_code visible in a safe, redacted way for local acceptance.
3. `student` starts fresh:
   - register or log in as a fresh local student;
   - redeem the unused redeem_code;
   - land on `/home` and see authorization plus available paper;
   - complete one practice answer;
   - complete one mock_exam answer and submit;
   - see exam_report and mistake_book outcomes;
   - log out.

## Local Versus Tencent Cloud Decision

`stagingDecision`: `fresh_system_happy_path_not_ready`

Do not move to Tencent Cloud preview yet. The current blockers are local product and local acceptance-data issues. Deploying to a preview environment would carry the same gaps into a higher-risk environment while adding cloud, secret, deployment, and data-boundary concerns.

Tencent Cloud staging should be reconsidered only after local dev can run a bounded fresh-system happy path or after the user explicitly approves a separate staging resource plan with known local limitations.

## Recommended Follow-Up Task Split

1. `phase-11-local-happy-path-student-answer-flow`
   - Fix question option extraction for runtime snapshots that use either `questionOptions` or legacy/seed `options`.
   - Wire practice restart to the existing restart endpoint.
   - Verify practice and mock_exam save/submit from `/home` links.

2. `phase-11-local-happy-path-student-session-controls`
   - Add a clear logout action for the student shell/profile.
   - Keep token redaction and local-session storage hygiene.

3. `phase-11-local-happy-path-redeem-code-loop`
   - Decide whether the first local loop uses runtime generation or a deterministic unused local acceptance fixture.
   - Do not expose code_hash or long-lived secret-like values.
   - Keep real card-code evidence out of logs; record only safe display labels or redacted summaries.

4. `phase-11-local-happy-path-content-ops-minimum`
   - Decide whether content ops uses browser-complete UI creation or pre-seeded local acceptance data.
   - If UI creation is required, wire only the smallest create question, create paper, add question, publish flow.

5. `phase-11-local-happy-path-acceptance-script`
   - Create the final role-by-role manual script after blockers above are fixed or explicitly scoped.
   - Include screenshots/observations guidance and forbidden evidence rules.

## Evidence Hygiene

This audit records route-level observations, role names, and staged decisions only. It does not include secrets, tokens, Authorization headers, raw provider payloads, raw prompts, raw answers, raw model responses, full paper/material/OCR text, or customer/private data.
