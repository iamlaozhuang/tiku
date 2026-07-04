# 2026-07-03 Stage B DB-Backed 8-Role Local Acceptance Task Plan

## Task

- Task ID: `stage-b-db-backed-8-role-local-acceptance-2026-07-03`
- Branch: `codex/stage-b-db-backed-8-role-local-acceptance-2026-07-03`
- Status: completed local DB-backed Stage B 8-role acceptance execution
- Request: open a separate DB-backed Stage B 8-role local acceptance task, and define browser, e2e, DB-read, evidence, and stop-on-fail boundaries before execution.

This task first materialized the execution boundary, then received fresh approval on 2026-07-04 for local
`127.0.0.1:3000` browser/e2e, Playwright Chromium `--trace=off`, selector-scoped read-only DB aggregate/status queries
against `tiku-postgres` / `tiku_fresh_phase25_20260601_001`, private fixture in-memory login use, and stop-on-fail.

It did not start or restart a dev server, perform direct DB write/provisioning/cleanup/reset, run schema migration,
call a Provider, or modify product source, tests, dependencies, schema, migration, seed, or env files. The approved
browser/e2e positive workflows did exercise local test-owned product actions through the app runtime.

## Required Reads

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-03-source-landing-8-role-credential-backed-fixture-target-matrix.md`
- `docs/05-execution-logs/evidence/2026-07-03-stage-b-test-owned-fixture-provisioning-repair.md`
- `e2e/credential-backed-8-role-local-acceptance.spec.ts`

## Current Prerequisite Facts

| Fact                              | Current state                                                                  |
| --------------------------------- | ------------------------------------------------------------------------------ |
| Local DB baseline decision        | Current non-empty local DB accepted with fixture-preflight constraints.        |
| Runtime DB target label           | `tiku_fresh_phase25_20260601_001`                                              |
| Local DB service label            | `tiku-postgres`                                                                |
| Private fixture path              | `D:\tiku-local-private\acceptance\role-separated-local-accounts-2026-06-23.md` |
| Post-repair Stage B-0.3 preflight | passed, 8 roles, 0 fail, 0 block                                               |
| DB-backed Stage B acceptance      | completed locally: 8 command pass, 0 fail, 0 block                             |

## Execution Boundary For The Later Fresh-Approved Run

The later execution task may proceed only after fresh approval that explicitly covers browser/e2e runtime, local DB read-only verification, private fixture in-memory login use, and dev-server handling.

Allowed only after that approval:

- Browser/e2e: local-only `http://127.0.0.1:3000`, Playwright Chromium, line reporter, `--trace=off`.
- DB read: selector-scoped aggregate/status queries against local Docker Compose `tiku-postgres`, DB label `tiku_fresh_phase25_20260601_001`.
- Private fixture: read login identifiers and credential values in process memory only for login.
- Evidence: role labels, route labels, status categories, aggregate counts, command status, and redacted reason categories only.

Forbidden unless a separate task grants fresh approval:

- DB write, provisioning, cleanup, reset, destructive delete/truncate/drop, schema migration, DDL, seed framework work.
- Product source, test source, dependency, package, lockfile, schema, migration, script, or env edits.
- Provider calls, staging/prod/cloud/deploy, Cost Calibration, release readiness, final Pass, or production usability claims.
- Committing screenshots, traces, videos, raw DOM, raw DB rows, internal IDs, tokens, cookies, sessions, headers, env values, connection strings, credentials, password hashes, PII, phone/email, plaintext `redeem_code`, prompt text, Provider payloads, raw AI input/output, or full content.

## Role Order

1. `personal_standard_student`
2. `personal_advanced_student`
3. `org_standard_employee`
4. `org_advanced_employee`
5. `org_standard_admin`
6. `org_advanced_admin`
7. `content_admin`
8. `ops_admin`

`super_admin` is not a primary axis role. It can appear only as a supplementary privilege-coverage note for ops, content, or system-admin related rows, and it must not replace any primary role.

## Stop-On-Fail Rules

- Execute roles serially in the exact order above.
- Reset browser runtime session between roles without recording cookies, tokens, storage, or headers.
- If any role returns fail or block, stop immediately and do not continue to later roles.
- Record only redacted fail/block evidence: role label, route/surface label, reason category, command status, and aggregate/status facts.
- Split a dedicated repair, provisioning, or harness task before any continuation.
- After a repair is merged, restart the full 8-role sequence from `personal_standard_student` unless the user explicitly approves a narrower rerun.
- DB target mismatch, fixture selector mismatch, missing private fixture, credential login failure, app target DB mismatch, and need for Provider/env/staging/cost are blocks until separately resolved.

## Validation For This Boundary Task

```powershell
npm.cmd exec -- prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-07-03-stage-b-db-backed-8-role-local-acceptance.md docs/05-execution-logs/acceptance/2026-07-03-stage-b-db-backed-8-role-local-acceptance-boundary.md docs/05-execution-logs/evidence/2026-07-03-stage-b-db-backed-8-role-local-acceptance.md docs/05-execution-logs/audits-reviews/2026-07-03-stage-b-db-backed-8-role-local-acceptance.md
git diff --check
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId stage-b-db-backed-8-role-local-acceptance-2026-07-03
```

The initial boundary validation ran before acceptance execution. Post-execution governance validation is recorded in
the evidence file.

## Execution Addendum

Fresh approval was received in-thread on 2026-07-04. The execution used the approved boundary:

- reused the already running local app at `http://127.0.0.1:3000`;
- ran selector-scoped read-only DB preflight against `tiku-postgres` / `tiku_fresh_phase25_20260601_001`;
- read private fixture login input only in process memory;
- ran Playwright Chromium with `--trace=off`;
- kept stop-on-fail active, but no fail or block occurred.

No direct DB write, provisioning, cleanup, reset, schema migration, Provider call, dev-server start/restart, or
source/test/dependency/env change was executed by the agent. Local app workflow mutations created by approved browser/e2e
positive paths were treated as test-owned product workflow data, not as DB provisioning.

Command sequence executed:

1. `npm.cmd exec -- playwright test e2e/credential-backed-8-role-local-acceptance.spec.ts --project=chromium --reporter=line --trace=off`
2. `npm.cmd exec -- playwright test e2e/student-practice-mock-entry.spec.ts --project=chromium --reporter=line --trace=off`
3. `npm.cmd exec -- playwright test e2e/personal-ai-generation-local-request.spec.ts --project=chromium --reporter=line --trace=off`
4. `npm.cmd exec -- playwright test e2e/edition-aware-authorization-local-flow.spec.ts --project=chromium --reporter=line --trace=off`
5. `npm.cmd exec -- playwright test e2e/local-full-loop-organization-training-analytics-ai-generation-role-flow.spec.ts --project=chromium --reporter=line --trace=off`
6. `npm.cmd exec -- playwright test e2e/admin-role-denial-browser.spec.ts --project=chromium --reporter=line --trace=off`
7. `npm.cmd exec -- playwright test e2e/role-separated-account-fixture-supplement.spec.ts --project=chromium --reporter=line --trace=off`
8. `npm.cmd exec -- playwright test e2e/local-full-loop-knowledge-rag-maintenance-smoke.spec.ts --project=chromium --reporter=line --trace=off`

Result: 8/8 commands passed, 0 fail, 0 block.
