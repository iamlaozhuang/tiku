# 2026-07-03 Stage B DB-Backed 8-Role Local Acceptance Boundary

## Decision

The DB-backed Stage B 8-role local acceptance task was opened with a boundary first. Fresh approval was received on
2026-07-04 for local browser/e2e runtime, read-only DB checks, private fixture in-memory login use, and stop-on-fail.

The approved local Stage B execution completed with 8/8 command pass, 0 fail, and 0 block. This is a local DB-backed
Stage B acceptance result only. It is not release readiness, final Pass, production usability, Provider readiness,
staging readiness, or Cost Calibration.

## Runtime Boundary

| Area                  | Allowed after fresh approval                                                                             | Forbidden in this boundary task                                                                    |
| --------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| Browser/e2e           | Local-only `127.0.0.1:3000`, Playwright Chromium, line reporter, trace off.                              | Committing screenshots, traces, video, raw DOM, cookies, storage, tokens, or headers.              |
| DB read               | Selector-scoped aggregate/status queries on `tiku-postgres`, DB label `tiku_fresh_phase25_20260601_001`. | Raw rows, internal IDs, connection strings, or broad inspection.                                   |
| Direct DB write       | None.                                                                                                    | Provisioning, cleanup, reset, delete, truncate, drop, DDL, migration, seed, or `drizzle-kit push`. |
| Private fixture       | In-memory login input only after fresh approval.                                                         | Recording credentials, phone/email, passwords, hashes, tokens, sessions, or raw fixture rows.      |
| Provider/staging/prod | None.                                                                                                    | Provider calls, staging/prod/cloud/deploy, Cost Calibration, release readiness, final Pass.        |

## Role Matrix

| Order | Role                        | Required target shape                                                                   | Positive proof target                                                                              | Negative proof target                                                               |
| ----- | --------------------------- | --------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 1     | `personal_standard_student` | Personal learner with active standard `personal_auth`.                                  | Practice, answer submit, mock report, and mistake-book learner surface.                            | Advanced learner AI and organization/admin routes denied or upgrade-guided.         |
| 2     | `personal_advanced_student` | Personal learner with active advanced `personal_auth`.                                  | Advanced learner AI entry and no-Provider advanced route use.                                      | Organization backend, content, ops, and admin routes denied.                        |
| 3     | `org_standard_employee`     | Employee bound to standard organization authorization context.                          | Standard organization-authorized learning entry and assigned employee surface.                     | Advanced organization training, analytics, learner AI, and admin routes denied.     |
| 4     | `org_advanced_employee`     | Employee bound to advanced organization authorization context.                          | Organization training assignment and learner AI entry without Provider.                            | Organization admin, content, ops, and invalid/expired auth paths denied or blocked. |
| 5     | `org_standard_admin`        | Organization-bound admin with `admin_role=org_standard_admin` and standard org context. | Organization workspace, roster boundary, employee envelope, and standard auth summary.             | Advanced organization AI/training/analytics creation denied.                        |
| 6     | `org_advanced_admin`        | Organization-bound admin with `admin_role=org_advanced_admin` and advanced org context. | Organization training publish, analytics summary, and organization AI UI entry.                    | Ops/content/system-admin routes denied; employee private answer text redacted.      |
| 7     | `content_admin`             | Backend admin with `admin_role=content_admin`.                                          | Content resource management and content AI draft/review/adoption boundary.                         | Ops authorization, user management, and organization workspace denied.              |
| 8     | `ops_admin`                 | Backend admin with `admin_role=ops_admin`.                                              | `redeem_code`, `org_auth`, employee import/password, overlap closure, and user-management surface. | Content AI draft/adoption and organization learner routes denied.                   |

`super_admin` is supplementary only. It cannot replace any of the 8 primary role rows.

## Stop-On-Fail Contract

- Run roles in the exact order above.
- Stop at the first fail or block.
- Do not continue later roles after a fail or block.
- Split a dedicated repair, provisioning, or harness task with its own allowed files and approval boundary.
- After repair closeout, restart the full 8-role sequence from `personal_standard_student`.
- A missing fixture, DB target mismatch, selector mismatch, credential login failure, app/DB target mismatch, or Provider/env/staging/cost need is a block unless separately approved and resolved.

## Evidence Contract

Allowed evidence:

- task IDs, role labels, route or surface labels, status categories, aggregate counts, pass/fail/block, command status, and redacted reason categories.

Forbidden evidence:

- credentials, passwords, password hashes, tokens, cookies, sessions, authorization headers, env values, connection strings, raw DB rows, internal IDs, PII, phone, email, plaintext `redeem_code`, Provider payloads, prompt text, raw AI input/output, full question/paper/material/resource/chunk content, screenshots, traces, video, raw DOM, or exports.

## Execution Result

The post-repair Stage B-0.3 preflight passed all 8 role fixture rows against `tiku_fresh_phase25_20260601_001`.
Fresh-approved local DB-backed browser/e2e execution then completed under the stop-on-fail rule.

The 2026-07-04 execution added:

- selector-scoped read-only DB aggregate/status preflight: 8 roles pass, 0 fail, 0 block;
- Playwright Chromium local e2e command sequence: 8 commands pass, 0 fail, 0 block;
- dev server start/restart: not executed;
- direct DB write, cleanup, reset, seed, migration, DDL, Provider, staging/prod, source/test/dependency change: not executed;
- local app workflow mutations from approved positive browser/e2e paths: executed as test-owned product workflow data.
