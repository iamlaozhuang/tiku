# Authorization Overlap Concurrency Proof Evidence

**Task id:** `phase-21-authorization-overlap-concurrency-proof`

**Branch:** `codex/phase-21-authorization-overlap-concurrency-proof`

## Summary

- Result: validated locally; pending commit, merge, push, and cleanup.
- Scope: authorization/org_auth overlap write path only.
- Changed surfaces: task state, task plan, evidence, security review, org_auth runtime service, org_auth runtime repository, and focused unit proof.
- Gates: pass.
- Forbidden scope (`forbiddenScope`): `.env.local`, `.env.example`, dependency, lockfile, schema, migration, drizzle, scripts, staging, prod, cloud, deploy, real provider, external service, destructive data, force push, employee import, redeem_code, model config, and other write paths remain blocked.
- Residual gaps (`residualGaps`): none identified inside the approved scope after focused proof; database schema uniqueness was not added because the existing repository already uses a transaction-scoped advisory lock and in-transaction overlap recheck.

## Startup Inventory

- `master` / `origin/master` recovery SHA before branch: `60de527282fa2de3f485d001939ac2507c9039e1`.
- `git status --short --branch` before branch: `## master...origin/master`.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- `git branch --list "codex/*"`: no output.
- `git branch --no-merged master --format="%(refname:short)"`: no output.
- `git worktree list`: `D:/tiku  60de5272 [master]`.

## Investigation Notes

- `src/server/repositories/admin-organization-org-auth-runtime-repository.ts` already wraps `createOrgAuth` in `database.transaction(...)`.
- The write transaction resolves the target organization scope, calls `lockOrgAuthQuotaScope(...)`, rechecks `hasOverlappingOrgAuthWithOrganizationIds(...)`, counts active employees, and only then inserts `org_auth` and `org_auth_organization` rows.
- Concurrency strategy: transaction-scoped `pg_advisory_xact_lock` serializes writes for the affected organization/profession/level scope before the overlap predicate and insert. The lock key intentionally serializes more broadly than the overlap predicate; the predicate carries the business overlap dimensions.
- Required overlap dimensions after the fix: `organization`, `auth_scope_type`, `profession`, `level`, and effective date range (`starts_at < input.expiresAt` and `expires_at > input.startsAt`).
- `src/server/services/admin-organization-org-auth-runtime.ts` performs a preflight overlap check before create. The repository also performs the authoritative in-transaction overlap check. A racing loser now rechecks overlap after `createOrgAuth(...)` returns `null` and maps the result to the existing `409005` API envelope.

## TDD Log

- RED: `npm.cmd run test:unit -- tests/unit/phase-21-authorization-overlap-concurrency-proof.test.ts` failed with 2/3 tests failing.
  - Missing `eq(orgAuth.auth_scope_type, input.authScopeType)` in the overlap predicate.
  - Missing post-create overlap recheck in the service response mapping for racing writes.
- GREEN: Added the missing `auth_scope_type` predicate and the post-create overlap envelope mapping. Re-ran the focused command and it passed with 1 file / 3 tests.
- No schema, migration, dependency, script, environment, deployment, external provider, or destructive data operation was used.

## Validation Results

| Command                                                                                                                             | Result | Notes                                                                          |
| ----------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------ |
| `npm.cmd run test:unit`                                                                                                             | pass   | 153 files / 631 tests passed.                                                  |
| `npm.cmd run test:e2e`                                                                                                              | pass   | 26/26 Playwright tests passed.                                                 |
| `git diff --check`                                                                                                                  | pass   | No whitespace errors.                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                      | pass   | Required docs, scripts, npm scripts, and skill capability anchors present.     |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` | pass   | Reported only current task files as expected; no staged changes.               |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                         | pass   | Source files scanned; banned/risky terms absent; API/DTO naming checks passed. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                             | pass   | lint, typecheck, test:unit (153 files / 631 tests), and format:check passed.   |

## Closeout Record

- Commit: local task commit created with message `fix(auth): prove org auth overlap concurrency`; exact SHA is available from Git history after commit/amend.
- Merge: pending.
- Push: pending.
- Cleanup: pending.
