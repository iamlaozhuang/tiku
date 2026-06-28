# Full Acceptance Matrix Execution Plan

- Task id: `full-acceptance-matrix-execution-2026-06-28`
- Branch: `codex/full-acceptance-matrix-execution-20260628`
- Status: closed partial
- Date: `2026-06-28`

## Goal

Execute the all-role, all-flow, all-function local acceptance matrix after the full unit baseline is green. Record only
redacted pass/fail/blocked evidence. Do not claim final Pass or release readiness.

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/03-student-experience.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`

## Requirement Mapping Result

- Student role: session state, authorization scope, practice/mock entry, mistake book, personal AI surfaces.
- Organization roles: organization portal, employee/training/analytics, organization AI question/paper draft surfaces.
- Ops/content/admin roles: content, paper, question/material, knowledge/resource, user/org auth/redeem_code surfaces.
- System boundaries: auth redaction, owner-facing labels, no raw internal identifiers in evidence, no Provider/DB direct access.

## Boundaries

- Browser/dev-server: local app only after this materialization; reuse existing localhost server when available.
- DB: direct DB connection/read/write/migration/seed/destructive operation is blocked for this task.
- AI/Provider: provider calls, provider config/credential reads, prompt payload capture, raw AI input/output, and Cost Calibration
  Gate are blocked.
- Credentials: do not capture passwords, cookies, tokens, sessions, localStorage values, Authorization headers, or env content.
- Source/test repair: blocked in this acceptance task. Any repair must be split into a separately materialized task.

## Execution Matrix

| Area          | Acceptance rows                                                                    |
| ------------- | ---------------------------------------------------------------------------------- |
| Student       | session state, authorization state, practice/mock entry, mistake book, personal AI |
| Organization  | portal, training, analytics, AI question generation, AI paper generation           |
| Ops/Admin     | content knowledge, paper, question/material, user/org auth, redeem_code            |
| Cross-cutting | unauthorized state, standard/advanced gating, redaction, owner-facing labels       |

## Evidence Policy

- Allowed: role label, route/page label, workflow label, pass/fail/blocked status, redacted gap summary, command name, counts.
- Forbidden: raw DOM, screenshots, traces, HTML reports, credentials, cookies, tokens, sessions, localStorage values,
  Authorization headers, raw DB rows/internal ids, phone/email/plaintext redeem_code, Provider payloads/prompts/raw AI
  input/output, complete question/paper/material/resource/chunk content.

## Validation Commands

- `npm.cmd run test:unit`
- local browser/dev-server checks after materialization
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId full-acceptance-matrix-execution-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId full-acceptance-matrix-execution-2026-06-28`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId full-acceptance-matrix-execution-2026-06-28 -SkipRemoteAheadCheck`

## Closeout Policy

Local commit, fast-forward merge to `master`, push `origin/master`, and deletion of the merged short branch are approved by
the current user's per-task closeout instruction. PR, force-push, deployment, release readiness, final Pass, DB direct access,
Provider execution, schema/migration/seed, package/lockfile changes, and source/test repair remain blocked without a new
materialized task and fresh approval where required.
