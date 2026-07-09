# 2026-07-09 Content AI 0704 Fixture Preflight Evidence

## Scope

- Task id: `content-ai-0704-fixture-preflight-2026-07-09`
- Branch: `codex/content-ai-0704-fixture-preflight`
- Mode: read-only localhost/private-material preflight after the content AI code repair branches were already closed.
- Purpose: verify whether current localhost plus 0704 private acceptance material is sufficient to continue end-to-end acceptance without opening another repair branch.

## Correction To Goal Framing

The content AI implementation repair sequence is already closed in current state:

| Area                            | Current state |
| ------------------------------- | ------------- |
| AI adoption read model          | closed        |
| Formal draft detail entry       | closed        |
| AI question formal publish loop | closed        |
| AI paper formal publish loop    | closed        |
| Traceability summary panel      | closed        |

This preflight is not a new code repair task. It only checks whether runtime fixture/history and role material are ready for further localhost acceptance. A new repair branch is only justified if a fresh current-code defect is reproduced during acceptance.

## Read-Only Runtime Probe

| Check                                            | Result       |
| ------------------------------------------------ | ------------ |
| `http://127.0.0.1:3000/login` reachable          | pass         |
| Process listening on `127.0.0.1:3000`            | pass         |
| Process command line contains a safe 0704 marker | not proven   |
| Process command line exposes DB marker           | no           |
| Direct DB connection                             | not executed |
| Env / DB URL / secret read                       | not executed |
| Provider execution                               | not executed |
| Screenshot / raw DOM / storage capture           | not executed |

The current allowed evidence can prove localhost reachability, but cannot independently prove the running process is on the 0704 DB target from command-line metadata alone. Previous localhost evidence recorded a process-only 0704 target match; this preflight does not strengthen that proof without reading env values or connecting to DB, both of which remain blocked here.

## Private Acceptance Material Probe

| Check                                    | Result                                                                                                                                                                                                 |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Private acceptance directory present     | pass                                                                                                                                                                                                   |
| Text material scanned in memory          | 7 `.md` / `.json` files                                                                                                                                                                                |
| Role labels present in private material  | content admin, personal standard, personal advanced, organization standard employee, organization advanced employee, organization standard admin, organization advanced admin, super admin labels seen |
| Structured JSON account entries          | exact entries found for personal standard and organization advanced employee only                                                                                                                      |
| Other role credentials                   | present in markdown-like material, but selector ambiguity remains                                                                                                                                      |
| Private values recorded in evidence/chat | no                                                                                                                                                                                                     |

## Minimal Session / Route Probe

The probe intentionally stops at labels, counts, status categories, and route codes. It does not record account values, cookies, sessions, tokens, auth headers, raw rows, internal ids, raw DOM, localStorage, complete content, prompt, or AI output.

| Role label                  | Runtime result                                                                                                                                   | Boundary conclusion                           |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------- |
| `personal_standard_student` | session candidate can be found, but current selector run did not prove the expected standard authorization context                               | not sufficient for final role-matrix proof    |
| `org_advanced_employee`     | session candidate can be found, but current selector run did not prove expected organization context; one read route returned forbidden category | not sufficient for final employee proof       |
| `content_admin`             | candidate login was not enough to access content/organization admin routes; route results were forbidden categories                              | not sufficient for content backend acceptance |
| `personal_advanced_student` | exact runtime session not confirmed                                                                                                              | not sufficient                                |
| `org_standard_employee`     | exact runtime session not confirmed                                                                                                              | not sufficient                                |
| `org_standard_admin`        | candidate login was not enough to access organization admin routes; route results were forbidden categories                                      | not sufficient                                |
| `org_advanced_admin`        | candidate login was not enough to access organization admin routes; route results were forbidden categories                                      | not sufficient                                |
| `super_admin`               | candidate login was not enough to access scoped admin routes in this probe                                                                       | not sufficient                                |

The important conclusion is conservative: private material exists, but exact role/session selectors are not yet strong enough to support a full final acceptance proof without additional local fixture/account readiness work or a safer selector source.

## Current Business-Loop Readiness

| Loop                                                         | Current readiness                                                                                                                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Content AI出题 -> formal question -> user usable             | code branches are closed; runtime replay still needs a verified content admin session and an eligible no-Provider history/draft candidate             |
| Content AI组卷 -> formal paper -> user usable                | code branches are closed; runtime replay still needs a verified content admin session and a current-code-compatible publishable paper draft candidate |
| Enterprise training admin publish -> employee visible/answer | code branches are closed; runtime replay still needs exact organization admin and employee sessions plus a fresh answer candidate                     |
| Personal/organization standard vs advanced boundaries        | unit/source gates exist; final localhost role-matrix proof still needs exact runtime sessions                                                         |

## Sensitive Boundary

- Credentials/session/cookie/token/localStorage/auth header: not recorded.
- Env values / DB URL / DB raw rows / internal ids: not recorded.
- Provider payload / raw prompt / raw AI output: not recorded.
- Full question / full paper / material / resource / chunk content: not recorded.
- Private files: read in memory only; not changed.
- DB: no direct connection, no mutation, no destructive operation.
- Source/test/package/lockfile/schema/migration/seed: not changed.

## Validation

| Command                                                                           | Result                                                         |
| --------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `corepack pnpm@10.26.1 exec prettier --write --ignore-unknown <scoped-doc-files>` | pass                                                           |
| `git diff --check`                                                                | pass                                                           |
| `corepack pnpm@10.26.1 lint`                                                      | pass                                                           |
| `corepack pnpm@10.26.1 typecheck`                                                 | pass                                                           |
| targeted tests                                                                    | n/a: preflight docs/state only; no source or test file changed |
| Module Run v2 pre-commit hardening                                                | pass                                                           |
| Module Run v2 pre-push readiness                                                  | pass after repository checkpoint alignment                     |

## Decision

Do not open more repair branches now. Continue by closing this preflight documentation branch.

After the preflight result, the user gave fresh approval to add missing local 0704 accounts/passwords if needed. That approval is not consumed in this read-only preflight branch. It should be handled in a separate short branch with a new task plan, and no write may occur until the local 0704 target is confirmed by an approved non-secret mechanism.

Any new source repair must start from a fresh current-code reproduction and a separate `codex/*` branch.
