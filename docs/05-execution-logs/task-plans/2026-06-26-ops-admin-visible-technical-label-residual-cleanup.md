# Ops Admin Visible Technical Label Residual Cleanup Task Plan

Task id: `ops-admin-visible-technical-label-residual-cleanup-2026-06-26`

## Fresh Approval

This task is executed under the active goal approval for serial smallest-necessary repairs toward the full eight-row
role-separated browser acceptance. The predecessor full eight-row rerun on 2026-06-26 passed seven rows and left only the
`ops_admin` row blocked by visible technical labels on operations routes.

## Task Type

Focused local source repair with RED/GREEN unit coverage and focused local browser rerun.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/01-requirements/traceability/role-experience-fulfillment-matrix.md`

## Evidence Inputs

- `docs/05-execution-logs/evidence/2026-06-26-role-separated-full-8-row-post-visible-label-private-credential-browser-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-role-separated-full-8-row-post-visible-label-private-credential-browser-rerun.md`
- `docs/05-execution-logs/evidence/2026-06-25-visible-chinese-ui-technical-label-runtime-cleanup-residual-repair.md`

## Allowed Scope

- Update only the operations organization/redeem-code UI source where the visible labels are rendered.
- Add or update focused unit assertions in `tests/unit/admin-user-org-auth-ops-baseline.test.ts`.
- Use the local private role-account credential file only for local browser login, with evidence redacted.
- Run a focused local browser rerun for `ops_admin` on `/ops/users`, `/ops/organizations`, and `/ops/redeem-codes`.
- Update task plan, evidence, audit-review, project state, and task queue.
- Commit, fast-forward merge to `master`, push `origin/master`, and delete the merged short branch after gates pass.

## Blocked Scope

- DB writes, seed writes, schema changes, migrations, Drizzle schema changes, or account/user/employee/authorization
  mutation.
- Reading or writing `.env*`.
- Provider calls, Provider configuration, Cost Calibration Gate, staging/prod/cloud/deploy, payment, external services,
  PR, force-push, dependency/package/lockfile changes, or final MVP Pass claim.
- Full eight-row browser rerun; that must be a separate task after this repair closes.
- Evidence containing raw credentials, account identifiers, tokens, cookies, local/session storage, Authorization
  headers, raw DB rows, raw public ids, raw DOM dumps, screenshots, traces, Provider payloads, prompts, generated
  content, or private answer content.

## Repair Plan

1. Inspect the existing operations org-auth/redeem component and focused unit file.
2. Add a RED unit assertion that the rendered operations UI does not expose the sampled visible technical labels:
   `publicId`, `org_auth`, `runtime API`, and `contact_config`.
3. Replace only user-visible copy with Chinese operator/business labels while preserving internal API keys, route paths,
   data attributes, and test identifiers.
4. Rerun the focused unit test to GREEN.
5. Execute a focused browser rerun for the `ops_admin` row and record redacted route/status/count evidence.

## Validation Plan

- `npm.cmd run test:unit -- tests/unit/admin-user-org-auth-ops-baseline.test.ts`
- `npx.cmd playwright --version`
- Focused local browser rerun for `ops_admin` routes with redacted status/count evidence.
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown` on changed source/docs/state files.
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ops-admin-visible-technical-label-residual-cleanup-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId ops-admin-visible-technical-label-residual-cleanup-2026-06-26 -SkipRemoteAheadCheck`
