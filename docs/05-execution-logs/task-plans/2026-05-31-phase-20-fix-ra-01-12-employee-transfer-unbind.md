# Phase 20 Fix RA-01-12 Employee Transfer Unbind

## Task

- Task id: `phase-20-fix-ra-01-12-employee-transfer-unbind`
- Source finding: `F-RA-01-12-001`
- Branch: `codex/phase-20-fix-ra-01-12-employee-transfer-unbind`
- Scope: local runtime implementation and tests for employee organization-path unbind, quota release, and org_auth visibility removal after unbind.

## Read Standards

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/02-architecture/interfaces/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/local-human-verification.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/blocked-gates.yaml`

## Claim Check

- `Test-TaskClaimReadiness.ps1 -TaskId phase-20-fix-ra-01-12-employee-transfer-unbind` passed on the short-lived branch.
- Allowed files cover `src/**`, `tests/**`, `e2e/**`, task plans, evidence, audits, and state files.
- Blocked files include env files, package/lockfiles, schema, drizzle, and scripts; this plan avoids them.
- Risk types are limited to the user-approved `auth_permission_model`, `local_human_verification`, and `evidence_integrity`.

## Implementation Plan

1. Add targeted RED unit coverage for the organization-scoped unbind route and repository behavior:
   - `POST /api/v1/organizations/{publicId}/employees/{employeePublicId}/unbind` must call repository logic with both public IDs and return the standard envelope.
   - The repository must reject mismatched organization/employee pairs.
   - Employee unbind must release local org_auth quota by excluding unbound users from employee counts.
   - Effective org_auth lookup must require `user_type = employee` so an unbound user no longer receives org_auth.
2. Implement the narrow runtime changes:
   - Add nested organization employee unbind route and service handler.
   - Extend repository unbind input to optionally include `organizationPublicId`.
   - Filter quota/employee counts and effective org_auth queries by active employee binding.
3. Record evidence:
   - RED and GREEN targeted test outputs.
   - Full required validation outputs.
   - Security review notes for auth permission, local human verification, evidence redaction, no secrets, public IDs only, API camelCase, and standard response envelope.

## Risk Defense

- No dependency, lockfile, env, schema, migration, cloud, deploy, or real provider changes.
- No destructive operation beyond local runtime session invalidation already present in employee unbind.
- No self-increment numeric IDs exposed in URLs or API payloads.
- Audit metadata remains redacted and does not include phone, token, password, or raw secret values.
