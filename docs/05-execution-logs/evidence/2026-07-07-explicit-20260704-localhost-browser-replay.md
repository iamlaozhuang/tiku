# 2026-07-07 Explicit 20260704 Localhost Browser Replay Evidence

## Scope

- Task id: `explicit-20260704-localhost-browser-replay-2026-07-07`
- Branch: `codex/explicit-20260704-localhost-browser-replay-2026-07-07`
- Mode: bounded localhost browser replay against explicit local `20260704` DB runtime.
- Result: `partial_with_blocked_advanced_submit_closure`.

## Redaction Boundary

Recorded only: document paths, command names, exit status, role labels, route labels, workflow labels, status counts, business error codes, and safe failure categories.

Not recorded: credentials, sessions, cookies, tokens, headers, env values, connection strings, DB URLs, raw DB rows, internal ids, PII, phone, email, password, plaintext `redeem_code`, Provider payload, raw prompt, raw AI output, full question, answer, paper, material, resource, chunk content, screenshots, traces, raw DOM, private fixture values, or employee raw answers.

## Runtime Setup

| Check                                | Result                                                                       |
| ------------------------------------ | ---------------------------------------------------------------------------- |
| Current task branch                  | `codex/explicit-20260704-localhost-browser-replay-2026-07-07`                |
| Existing localhost 3000              | detected; not stopped                                                        |
| Same-directory second dev server     | blocked by Next project dev-server lock                                      |
| Short local runtime worktree         | used for isolated port 3107 after deep private path hit Windows path length  |
| Turbopack with node_modules junction | blocked by Turbopack symlink root restriction                                |
| Final dev server mode                | webpack                                                                      |
| Runtime DB target                    | explicit `20260704` DB label, process-only override                          |
| `.env.local` modified                | false                                                                        |
| Provider runtime                     | disabled by process env before replay                                        |
| Screenshots/traces/raw DOM           | not captured                                                                 |
| Runtime cleanup                      | pass; port 3107 not listening after cleanup; short runtime workspace removed |

## Recovery Addendum: DB / Account Fixture Boundary Inventory

Added after recovery approval on 2026-07-07.

Root-cause category:

- `fixture_db_mapping_mixed_during_preflight`
- `local_dependency_executable_links_damaged_by_short_workspace_cleanup`

Boundary inventory:

| DB target label                                                             | Proper account / fixture document family                                                          | Current compatibility verdict                                                           |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `tiku_fresh_phase25_20260601_001`                                           | default localhost / role-separated account document family                                        | candidate only for the default localhost DB context; not evidence for explicit 20260704 |
| `tiku_full_chain_acceptance_20260704_001`                                   | 2026-07-04 full-chain isolated DB account plan and full-chain acceptance employee import material | valid target family for explicit 20260704 replay, subject to per-role fixture preflight |
| explicit 20260704 DB with 2026-06-23 role-separated account document family | not applicable                                                                                    | preflight login failures observed; must not be reused as 20260704 evidence              |
| explicit 20260704 DB with common dev seed credential family                 | not applicable                                                                                    | preflight login failures observed; must not be reused as 20260704 evidence              |

Role fixture inventory for explicit 20260704:

| Role label                  | 20260704-compatible material status                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| `content_admin`             | mapped through 2026-07-04 full-chain account plan                                                    |
| `org_advanced_admin`        | mapped through 2026-07-04 full-chain account plan                                                    |
| `org_standard_admin`        | mapped through 2026-07-04 full-chain account plan                                                    |
| `org_standard_employee`     | mapped through 2026-07-04 full-chain employee import material                                        |
| `personal_advanced_student` | mapped through 2026-07-04 full-chain personal scenario material                                      |
| `personal_standard_student` | blocked; no current explicit 20260704 direct login fixture confirmed                                 |
| `org_advanced_employee`     | blocked; current advanced employee import material did not validate as direct session login material |

Recovery rule:

- Before any future browser replay, the evidence must name the DB target label, service port, and account-document family together.
- A role account document that passes against one DB target is not portable to another DB target without a fresh preflight.
- Evidence remains redacted: no credential, token, session, env value, DB URL, raw DB row, internal id, private fixture value, question, answer, paper, material, Provider payload, prompt, or raw AI output is recorded.

## Dependency Recovery And Validation

Dependency recovery was local environment repair only. It did not add, remove, upgrade, downgrade, or persist dependency changes.

Project decision inputs:

- `package.json` declares `packageManager: pnpm@11.9.0`.
- `docs/03-standards/local-ci.md` allows frozen lockfile install for missing `node_modules`, and requires no `package.json` or `pnpm-lock.yaml` change.

Commands:

| Command                                                                                                                                                        | Result | Summary                                                                                             |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `corepack pnpm@11.9.0 install --frozen-lockfile --ignore-scripts`                                                                                              | fail   | lockfile/config mismatch because current pnpm ignores the historical package `pnpm.overrides` field |
| `corepack pnpm@10 install --frozen-lockfile --ignore-scripts`                                                                                                  | pass   | restored local `node_modules/.bin` from existing lockfile                                           |
| `git diff --name-only -- package.json pnpm-lock.yaml pnpm-workspace.yaml package-lock.json package-lock.yaml .env .env.local .env.development .env.production` | pass   | no package, lockfile, workspace, or env tracked diff                                                |

Validation after recovery:

| Gate                                   | Result                                                                                 |
| -------------------------------------- | -------------------------------------------------------------------------------------- |
| `npm.cmd run lint`                     | pass                                                                                   |
| `npm.cmd run typecheck`                | pass                                                                                   |
| focused `npm.cmd run test:unit -- ...` | pass; 9 files / 123 tests                                                              |
| `git diff --check`                     | pass                                                                                   |
| scoped Prettier check                  | pass after scoped Prettier write on evidence file                                      |
| blocked path diff check                | pass; no package, lockfile, env, source, test, schema, migration, seed, or script diff |
| Module Run v2 pre-commit hardening     | pass                                                                                   |

## Browser Replay Command

Command category:

```text
node <inline redacted localhost browser replay>
```

Execution boundary:

- Read role credentials only in memory from local private fixture files.
- Did not print credential, token, session, cookie, localStorage, env, DB, raw DOM, screenshot, trace, or full content values.
- Did not execute Provider calls.
- Did not run staging/prod/deploy or Cost Calibration.

## Credential / Fixture Preflight

| Role label                  | Fixture result                                                                                                        |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `personal_standard_student` | blocked; current explicit 20260704 private fixture set did not provide a usable standard personal login material      |
| `personal_advanced_student` | usable via current 20260704 personal scenario account                                                                 |
| `org_standard_employee`     | usable via current 20260704 standard employee import material                                                         |
| `org_advanced_employee`     | blocked; current advanced employee import material was not directly usable as login material under session validation |
| `org_standard_admin`        | usable via current 20260704 organization admin material                                                               |
| `org_advanced_admin`        | usable via current 20260704 organization admin material                                                               |
| `content_admin`             | usable via current 20260704 content admin material                                                                    |

Initial 2026-06-23 role-separated account fixture and common dev seed credential family both returned login failure codes against the explicit 20260704 DB; they were not reused for conclusions.

## Replay Result

Aggregate result:

| Result  | Count |
| ------- | ----: |
| pass    |     2 |
| blocked |     5 |
| fail    |     0 |

Rows:

| Role                        | Workflow                                           | Result  | Safe category                                      |
| --------------------------- | -------------------------------------------------- | ------- | -------------------------------------------------- |
| `personal_standard_student` | learner AI generation denial                       | blocked | `fixture_missing_personal_standard_login_material` |
| `org_standard_employee`     | employee AI generation denial                      | pass    | `standard_learner_ai_unavailable`                  |
| `org_standard_admin`        | organization AI组卷 denial                         | pass    | `org_standard_admin_ai_unavailable`                |
| `personal_advanced_student` | personal AI组卷 browser submit to learning session | blocked | `provider_disabled_no_visible_generated_content`   |
| `org_advanced_employee`     | employee AI组卷 browser submit to learning session | blocked | `fixture_invalid_advanced_employee_login_material` |
| `org_advanced_admin`        | organization admin AI组卷 submit to training draft | blocked | `provider_disabled_no_admin_paper_assembly`        |
| `content_admin`             | content admin AI组卷 submit to review draft        | blocked | `provider_disabled_no_admin_paper_assembly`        |

Advanced submit details, redacted:

- `personal_advanced_student` visible AI组卷 default quantity was `30`.
- `personal_advanced_student` browser submit returned standard envelope code `0`, controlled runner ready, Provider not executed, result status `failed`, and no visible generated content; therefore no browser learning session could be started under the no-Provider boundary.
- `org_advanced_admin` and `content_admin` AI组卷 submit returned business code `409015` with error UI visible and no paper assembly. The replay did not treat prior or background history widgets as successful current-submit handoff evidence.

## Boundary Confirmation

- Source change: false.
- Test change: false.
- Dependency/package/lockfile change: false.
- Schema/migration/seed change: false.
- Destructive DB operation: false.
- Provider call: false.
- Provider credential value printed or recorded: false.
- Screenshots/traces/raw DOM: false.
- Staging/prod/deploy: false; requires fresh approval.
- Cost Calibration: false; requires fresh approval.
- Release readiness: not claimed.
- Production usability: not claimed.

## Conclusion Buckets

| Dimension                                   | Result                                                            |
| ------------------------------------------- | ----------------------------------------------------------------- |
| browser standard denial/unavailable states  | pass for sampled `org_standard_employee` and `org_standard_admin` |
| browser advanced current-submit closed loop | blocked under no-Provider boundary and current fixture gaps       |
| explicit 20260704 localhost browser replay  | partial                                                           |
| release readiness                           | not claimed                                                       |
| production usability                        | not claimed                                                       |
| staging                                     | not executed / requires fresh approval                            |
| Cost Calibration                            | not executed / requires fresh approval                            |

## Non-Claims

- No full seven-role browser pass.
- No browser-submitted AI组卷 learning-session pass.
- No browser-submitted admin AI组卷 draft handoff pass.
- No Provider-enabled browser submit evidence.
- No release, production, staging, or Cost Calibration claim.
