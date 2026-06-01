# Phase 23 Validation Data Prep Mechanism Plan

## Scope

- Implement or expose the minimum rerunnable local/dev synthetic validation-data prep mechanism.
- Prefer existing local/dev APIs or existing safe service boundaries.
- Cover only the data required for full e2e first pass: `org_auth`, `material`, `mistake_book`, `ai_call_log`, and required baseline relationships.
- Add focused tests or e2e setup changes only where needed.

## Security Review

- Required because this touches auth/session/data prep boundaries.
- Review artifact: `docs/05-execution-logs/audits-reviews/2026-06-01-phase-23-validation-data-prep-mechanism-security-review.md`

## Stop Conditions

- Dependency change.
- Schema/migration/drizzle change.
- Raw SQL or destructive DB operation.
- Secret disclosure or evidence of sensitive payloads.
- Staging/prod/cloud/deploy/real provider/external service.

## Validation Commands

- `npm.cmd run test:unit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`
