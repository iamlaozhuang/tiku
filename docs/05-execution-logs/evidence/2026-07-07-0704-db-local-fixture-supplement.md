# 2026-07-07 0704 DB Local Fixture Supplement Evidence

## Scope

- Task id: `0704-db-local-fixture-supplement-2026-07-07`
- Branch: `codex/0704-db-local-manual-role-acceptance-prep-2026-07-07`
- Approval: current user approved local 0704 non-destructive account/fixture supplement for `personal_standard_student` and `org_advanced_employee`, plus local commit, merge, push, and cleanup.
- Runtime target: explicit local 20260704 DB label.
- Boundary: local fixture/account supplement only; no source/test/schema/migration/seed/package/lockfile/env-file change, no Provider-enabled flow, no staging/prod/deploy, no Cost Calibration, no destructive DB operation.
- Redaction: this evidence records only role labels, status categories, counts, route labels, and command outcomes. It does not record credentials, sessions, cookies, tokens, env values, DB URLs, raw DB rows, internal ids, phone/email/password, plaintext `redeem_code`, Provider payload, raw prompt, raw AI output, full question/paper/material/resource/chunk content, screenshots, traces, raw DOM, or private fixture values.

## Read Gate

- Current project state and task queue recovery entries.
- `docs/05-execution-logs/evidence/2026-07-07-0704-db-local-manual-role-acceptance-prep.md`
- `docs/05-execution-logs/audits-reviews/2026-07-07-0704-db-local-manual-role-acceptance-prep.md`
- Latest explicit 20260704 localhost browser replay evidence.
- Latest personal standard fixture acceptance evidence.
- Latest 0704 org enterprise fixture materialization replay evidence.
- Runtime auth/session, user, employee, personal_auth, org_auth schema and repository code.
- Private 20260704 fixture structure was read in process memory only.

## Fixture Supplement

| Role                        | Pre-gap                                                                  | Supplement action                                                                                                                                                       | Result |
| --------------------------- | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| `personal_standard_student` | explicit 20260704 direct-login material not closed                       | generated local private manual-login material; ensured active personal user, student row, credential, and active standard `personal_auth`                               | pass   |
| `org_advanced_employee`     | advanced employee import material not validated as direct login material | reused approved 20260704 advanced employee import material; ensured active employee user, credential, employee binding, advanced `org_auth` coverage, and quota refresh | pass   |

Private account material was written only outside the repo. Values were not printed, committed, or copied into evidence.

## Login And Authorization Preflight

| Role                        | `/api/v1/sessions` | Cookie issued | Authorization result                            | Capability expectation                  |
| --------------------------- | ------------------ | ------------- | ----------------------------------------------- | --------------------------------------- |
| `personal_standard_student` | HTTP 200 / code 0  | yes           | 1 context; standard 1; advanced 0; AI-capable 0 | standard denial preserved               |
| `org_advanced_employee`     | HTTP 200 / code 0  | yes           | 5 contexts; advanced 5; AI-capable 5            | advanced employee AI capability present |

## Organization Training Probe

| Role                    | Route                                         | Result                                               |
| ----------------------- | --------------------------------------------- | ---------------------------------------------------- |
| `org_advanced_employee` | `/api/v1/organization-trainings/visible-list` | HTTP 200 / code 0 / visible version category nonzero |

Probe correction: the first safe probe looked for an obsolete response field name and returned `zero_or_unknown`. After reading the current route contract, the same redacted probe checked `data.versions` and returned nonzero.

## Manual Acceptance Inventory After Supplement

| role                        | account material exists | needs supplement | gap type                                |
| --------------------------- | ----------------------- | ---------------- | --------------------------------------- |
| `personal_advanced_student` | yes                     | no               | none                                    |
| `personal_standard_student` | yes                     | no               | closed by local 0704 fixture supplement |
| `org_advanced_employee`     | yes                     | no               | closed by local 0704 fixture supplement |
| `org_standard_employee`     | yes                     | no               | none                                    |
| `org_advanced_admin`        | yes                     | no               | none                                    |
| `org_standard_admin`        | yes                     | no               | none                                    |
| `content_admin`             | yes                     | no               | none                                    |

## Manual Acceptance Checklist After Supplement

| role                        | login viable now | entry path                                                         | AI出题 visible                                 | AI组卷 visible                              | standard denial expected | advanced error clarity expected | content backend draft/review closure |
| --------------------------- | ---------------- | ------------------------------------------------------------------ | ---------------------------------------------- | ------------------------------------------- | ------------------------ | ------------------------------- | ------------------------------------ |
| `personal_advanced_student` | yes              | `/login` -> `/home` -> `/ai-generation`                            | yes                                            | yes                                         | n/a                      | yes                             | n/a                                  |
| `personal_standard_student` | yes              | `/login` -> `/home`; direct `/ai-generation` should be unavailable | no                                             | no                                          | yes                      | n/a                             | n/a                                  |
| `org_advanced_employee`     | yes              | `/login` -> `/home`, `/organization-training`, `/ai-generation`    | yes                                            | yes                                         | n/a                      | yes                             | n/a                                  |
| `org_standard_employee`     | yes              | `/login` -> `/home`, `/organization-training` if assigned          | no                                             | no                                          | yes                      | n/a                             | n/a                                  |
| `org_advanced_admin`        | yes              | `/login` -> `/organization/portal`                                 | yes via `/organization/ai-question-generation` | yes via `/organization/ai-paper-generation` | n/a                      | yes                             | n/a                                  |
| `org_standard_admin`        | yes              | `/login` -> `/organization/portal`                                 | no                                             | no                                          | yes                      | n/a                             | n/a                                  |
| `content_admin`             | yes              | `/login` -> `/content/organization-portal`                         | yes via `/content/ai-question-generation`      | yes via `/content/ai-paper-generation`      | n/a                      | yes                             | yes                                  |

## Boundary Confirmation

- `.env.local` modified: false.
- Source/test/schema/migration/seed/package/lockfile modified: false.
- Private account file updated outside repo: true.
- DB mutation: local non-destructive fixture/account upsert only.
- Destructive DB operation: false.
- Provider-enabled flow: false.
- Staging/prod/deploy: false.
- Cost Calibration: false.
- Release readiness / production usability: not claimed.

## Validation Commands

- `git status --short --branch`: current short-lived branch.
- Redacted 0704 fixture supplement runner: pass.
- Redacted login/authorization probes for both supplemented roles: pass.
- Redacted organization-training visible-list probe for `org_advanced_employee`: pass.
- `npm.cmd run test:unit -- tests/unit/next-dev-origin-config.test.ts tests/unit/local-acceptance-session-bootstrap.test.ts`: pass, 2 files / 7 tests.
- `npm.cmd run lint`: pass.
- `npm.cmd run typecheck`: pass.
- `git diff --check`: pass.
- Scoped Prettier write/check for state, queue, plan, evidence, and audit files: pass.
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-db-local-fixture-supplement-2026-07-07`: pass.
- `Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-db-local-fixture-supplement-2026-07-07 -SkipRemoteAheadCheck`: pass.
