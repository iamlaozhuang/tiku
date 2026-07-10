# 2026-07-10 0704 Org Employee Import Template Fix Audit

## Scope

- taskId: `0704-org-employee-import-template-fix-2026-07-10`
- branch: `codex/0704-org-employee-import-template-fix`
- audit mode: adversarial review after targeted implementation and tests

## Finding

The priority gap from `0704-org-employee-import-acceptance-2026-07-10` is repaired within the approved no-dependency boundary. The operations employee import surface now supports a reusable template, roster file upload, inherited authorization preview, quota-impact preview, safer reason categories, and the documented 500-row ceiling.

## Adversarial Review

- Role boundary: employee import remains platform operations owned. No organization-admin self-service mutation was introduced.
- Data boundary: the template and guard keep `profession`, `level`, `subject`, `edition`, and authorization-scope fields out of employee import rows.
- Authorization boundary: employee capability is described as inherited from active `org_auth`; import does not write per-employee authorization or edition.
- Quota boundary: the client preview blocks obvious insufficient-quota imports from the loaded operations summaries. Server-side quota attribution still depends on the existing repository/service boundary and should be revisited with future atomic `org_auth_scope` schema work.
- Sensitive information: generated initial passwords remain only in the one-time result surface. Evidence and audit do not record roster rows, generated passwords, credentials, tokens, DB values, Provider payloads, raw prompts, or raw AI output.
- Standard/advanced boundary: standard/advanced access is not imported from the roster; it remains derived from organization authorization.
- Regression boundary: existing text import and legacy controlled binding import behavior remain covered by targeted tests.

## Non-Actions

- No package, lockfile, dependency, schema, migration, seed, DB, Provider, env/secret, staging/prod/deploy, screenshot, raw DOM, or Cost Calibration action was executed.
- No browser runtime login was executed because this repair task explicitly blocks browser/dev-server probes.

## Closeout Decision

- Scoped prettier check and Module Run v2 gates passed.
- After merge, run `0704-org-employee-import-acceptance-rerun-2026-07-10` before continuing to `0704-personal-redeem-code-acceptance-2026-07-10`.
