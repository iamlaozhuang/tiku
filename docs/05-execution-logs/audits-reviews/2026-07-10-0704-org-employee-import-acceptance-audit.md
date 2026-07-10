# 2026-07-10 0704 Org Employee Import Acceptance Audit

## Scope

- taskId: `0704-org-employee-import-acceptance-2026-07-10`
- branch: `codex/0704-org-employee-import-acceptance`
- audit mode: adversarial review after validation-only source inspection and targeted tests

## Finding

The validation task is blocked by a real product capability gap. Existing implementation supports text-based CSV/TSV import, but the 0704 acceptance standard requires a roster document upload entry, a downloadable reusable template, inherited authorization/quota preview categories, and broader safe-failure categories.

## Adversarial Review

- Role boundary: employee import remains platform operations owned; no organization admin mutation permission was introduced.
- Data boundary: validation did not read DB rows or private fixture values; evidence stays at file-path and status-category level.
- Sensitive information: no credential, token, password, private account, raw employee row, plaintext `redeem_code`, or internal id was recorded.
- Standard/advanced boundary: import rows must not carry edition or authorization scope fields; current guard partially enforces this and repair must preserve it.
- Employee/admin isolation: organization admins remain read-only for roster/status in first release; repair must not delegate import to org admins.
- Capability gap severity: P0 for this serial run because the owner explicitly called out missing roster document upload/template as a priority repair gate.

## Repair Requirements

The next repair task should minimally implement and verify:

- file upload entry for roster import without adding dependencies;
- downloadable spreadsheet-compatible template or an approved no-dependency template file;
- template fields limited to phone, name, and optional initial password;
- pre-submit preview with row counts, validation failures, inherited authorization categories, quota impact, and confirmation state;
- safe category handling for malformed rows, duplicates, insufficient quota, disabled accounts, cross-domain conflict, and cross-organization conflict where the current service can determine them;
- preservation of redacted evidence and one-time initial-password distribution boundaries.

## Non-Actions

- No source or test files were changed in this validation task.
- No package, lockfile, schema, migration, seed, DB, Provider, env/secret, staging/prod/deploy, screenshot, raw DOM, or Cost Calibration action was executed.

## Decision

- Queue continuation is blocked.
- Next task: `0704-org-employee-import-template-fix-2026-07-10`.
- After repair closeout, run `0704-org-employee-import-acceptance-rerun-2026-07-10`.
