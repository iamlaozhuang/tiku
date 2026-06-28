# Local Full Loop Baseline Accounts Auth DB Evidence

## Scope

- Task id: `local-full-loop-baseline-accounts-auth-db-2026-06-28`
- Branch: `codex/local-full-loop-baseline-20260628`
- Local target: localhost/127.0.0.1 only
- Evidence mode: redacted metadata only

## Redaction Boundary

This evidence intentionally omits credential values, connection strings, secrets, session values, cookies, localStorage,
Authorization headers, raw DB rows, internal ids, user email/phone values, plaintext redeem codes, raw DOM, screenshots,
traces, Provider payloads, prompts, raw AI output, employee subjective answers, and full question or paper content.

## TDD Evidence

- RED command: `npm.cmd run test:unit -- src/db/dev-seed.test.ts`
- RED result: failed as expected because the local dev seed lacked distinct login-capable `content_admin`, `ops_admin`,
  and employee auth coverage.
- GREEN command: `npm.cmd run test:unit -- src/db/dev-seed.test.ts`
- GREEN result: passed after adding deterministic local seed coverage for the missing full-loop baseline roles.
- Regression command:
  `npm.cmd run test:unit -- src/db/dev-seed.test.ts tests/unit/admin-dashboard-layout-navigation.test.ts tests/unit/student-login-ui.test.ts`
- Regression result: passed, 3 files, 24 tests.

## Local DB Seed Evidence

- Local DB health command: `docker compose ps --format json`
- Local DB health result: dev Postgres service healthy on local loopback.
- Seed command: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\db\Seed-DevDatabase.ps1`
- Seed result: passed with redacted aggregate counts only.

Redacted seed summary:

| Surface                       | Count |
| ----------------------------- | ----: |
| auth_user                     |     7 |
| admin                         |     5 |
| admin_organization            |     5 |
| student user                  |     1 |
| employee user                 |     1 |
| organization                  |     1 |
| employee                      |     1 |
| org_auth                      |     1 |
| org_auth_organization         |     1 |
| organization_training_version |     1 |
| organization_training_answer  |     1 |
| personal_auth                 |     1 |
| paper                         |     1 |
| paper_question                |     1 |
| model_config                  |     1 |

## Localhost E2E Evidence

- Initial e2e attempt failed before test execution because a local dev server was already listening and Playwright was
  not configured to reuse it for that run.
- Rerun command:
  `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/local-full-loop-baseline-accounts-auth-db.spec.ts --reporter=line`
- Rerun result: passed, 1 test.

Role coverage:

| Role label         | Result                                 |
| ------------------ | -------------------------------------- |
| student            | pass login context                     |
| content_admin      | pass login context                     |
| ops_admin          | pass login context                     |
| org_standard_admin | pass organization standard context     |
| org_advanced_admin | pass organization advanced context     |
| employee           | pass employee and organization context |

Existing authorization regression:

- Command:
  `$env:TIKU_PLAYWRIGHT_REUSE_EXISTING_SERVER="1"; npm.cmd run test:e2e -- e2e/edition-aware-authorization-db-backed-local-flow.spec.ts --reporter=line`
- Result: passed, 2 tests.

## Requirement Mapping Result

| Requirement surface                                  | Mapping result                                                            |
| ---------------------------------------------------- | ------------------------------------------------------------------------- |
| `student` local login baseline                       | pass via six-role localhost session smoke                                 |
| `content_admin` dedicated local account              | pass via dev seed focused test and localhost session smoke                |
| `ops_admin` dedicated local account                  | pass via dev seed focused test and localhost session smoke                |
| `org_standard_admin` DB-backed authorization context | pass via six-role smoke and existing edition-aware authorization e2e      |
| `org_advanced_admin` DB-backed authorization context | pass via six-role smoke and existing edition-aware authorization e2e      |
| `employee` login-capable organization context        | pass via dev seed focused test and localhost session smoke                |
| API envelope and JSON naming rules                   | pass via six-role smoke assertions                                        |
| Local full-loop continuation readiness               | pass for account/auth/DB baseline; successor RAG and AI tasks remain open |

## Boundary Evidence

- Package or lockfile changed: no.
- `.env*` changed: no.
- Schema or migration changed: no.
- Provider call or Provider configuration: no.
- Cost Calibration: blocked and not executed.
- Staging/prod/deploy: blocked and not executed.
- Payment/OCR/export/external-service: blocked and not executed.
- PR or force push: blocked and not executed.
- Release readiness/final Pass: not claimed.
