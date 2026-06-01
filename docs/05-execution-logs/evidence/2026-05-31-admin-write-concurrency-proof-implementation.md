# Admin Write Concurrency Proof Implementation Evidence

**Task id:** `phase-21-admin-write-concurrency-proof-implementation`

**Branch:** `codex/phase-21-admin-write-concurrency-proof-implementation`

## Summary

- Result: pass.
- Scope: implementation for one admin write path, `redeem_code` generation or duplicate-submit concurrency proof.
- Changed surfaces: `admin-redeem-code-runtime-repository`, `admin-redeem-code-runtime` service, focused unit tests, task state, task plan, evidence, and security review.
- Gates: focused unit pass; `test:unit` pass; `test:e2e` pass; `build` pass; `git diff --check` pass; readiness pass; naming pass; quality gate pass.
- Forbidden scope (`forbiddenScope`): `.env.local`, `.env.example`, dependency, lockfile, schema, migration, scripts, staging, prod, cloud, deploy, real provider, external service, destructive data, and force push remain blocked. `next build` reported `.env.local` as an environment file name only; no env contents were opened, copied, or recorded by the agent.
- Residual gaps (`residualGaps`): duplicate-submit idempotence is not claimed because the current request contract has no stable idempotency key and schema changes are not approved.

## Startup Recovery

- Startup branch `codex/phase-21-admin-write-concurrency-proof-startup` was merged into `master`.
- `master` was pushed to `origin/master`.
- The merged startup branch was deleted after an initial sandbox permission failure and an approved elevated retry.
- Post-cleanup inventory before this task:
  - `git status --short --branch`: `## master...origin/master`
  - `git branch --list "codex/*"`: no output
  - `git branch --no-merged master`: no output
  - `git worktree list`: `D:/tiku  c7d7e8fc [master]`
  - `git rev-list --left-right --count master...origin/master`: `0 0`

## Human Approval Record

User approved fresh implementation task: `Admin write concurrency proof implementation`.

Approved risk types:

- `admin_ops`
- `transaction_concurrency`
- `data_contract`
- `authorization`
- `local_human_verification`
- `evidence_integrity`

Approved slice:

- Preferred and only current implementation slice: `redeem_code` generation or duplicate-submit concurrency proof.
- Stop condition: if the existing code cannot prove `redeem_code` concurrency safety without schema changes, stop and report.

## Security Plan

- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-31-admin-write-concurrency-proof-implementation-security-review.md`.
- No permission behavior change is planned.
- No schema or migration change is approved.
- No clear-text production redeem codes, secrets, tokens, database URLs, raw private data, or provider payloads may be recorded in evidence.
- API contract must remain `{ code, message, data, pagination? }` with camelCase JSON fields.
- External DTOs and URLs must use `publicId` or generation public identifiers only; internal numeric ids stay internal.

## TDD Log

- RED 1:
  - Command: `npm.cmd run test:unit -- tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`
  - Result: failed as expected.
  - Failure: `TypeError: database.insert is not a function`.
  - Interpretation: current repository generated directly on the outer database handle and did not use a transaction boundary.
- GREEN 1:
  - Command: `npm.cmd run test:unit -- tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`
  - Result: pass after adding transaction-scoped generation and deterministic test hooks. One intermediate assertion-only failure was corrected to assert only the fields relevant to the concurrency proof.
- RED 2:
  - Command: `npm.cmd run test:unit -- tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`
  - Result: failed as expected.
  - Failure: `RedeemCodeGenerationConflictError` escaped the route handler.
  - Interpretation: persistent generation conflicts were not mapped into the API response envelope.
- GREEN 2:
  - Command: `npm.cmd run test:unit -- tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`
  - Result: 1 file / 2 tests passed.

## Concurrency Strategy Record

- Scope proven: `redeem_code` admin batch generation only.
- Transaction boundary: `createRedeemCodeBatch` now wraps the batch in `database.transaction(...)`; an exhausted conflict aborts the transaction instead of committing a partial batch.
- Uniqueness boundary: existing database unique constraints `udx_redeem_code_code_hash` and `udx_redeem_code_public_id` remain the concurrency guard. No schema, index, or migration change was made.
- Retry rule: generation retries only PostgreSQL unique violations (`23505`) for the known redeem_code unique constraints. Non-unique errors are rethrown.
- Conflict contract: persistent unique conflicts throw `RedeemCodeGenerationConflictError`; the admin route maps it to `{ code: 409601, message, data: null }`.
- Duplicate-submit idempotence: not claimed. The route has no existing idempotency key or stable client request public identifier, and adding one would require a broader API/schema decision outside this approval.

## Implementation Notes

- Added deterministic generator hooks to the repository options for tests. Production defaults still use `randomUUID()` and `randomInt()`.
- Kept clear-text redeem code visibility unchanged: generated code plaintext remains only in the creation response.
- Did not change admin role or permission behavior.
- Did not touch `src/db/schema/**`, `drizzle/**`, package files, lockfiles, scripts, env files, staging/prod/cloud/deploy, real provider, or external services.

## Validation Results

| Command                                                                                                                                                                                                 | Result | Notes                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `npm.cmd run test:unit -- tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`                                                                                                                    | fail   | RED 1: failed with `database.insert is not a function`, proving missing transaction boundary.                                  |
| `npm.cmd run test:unit -- tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`                                                                                                                    | pass   | GREEN 1 after transaction and unique-conflict retry implementation.                                                            |
| `npm.cmd run test:unit -- tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`                                                                                                                    | fail   | RED 2: route leaked `RedeemCodeGenerationConflictError`.                                                                       |
| `npm.cmd run test:unit -- tests/unit/phase-21-admin-redeem-code-concurrency.test.ts`                                                                                                                    | pass   | GREEN 2: 1 file / 2 tests passed after mapping conflict to standard envelope.                                                  |
| `npm.cmd run test:unit -- tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-21-admin-redeem-code-concurrency.test.ts` | pass   | 3 files / 10 tests passed before formatting.                                                                                   |
| `node .\node_modules\prettier\bin\prettier.cjs --write ...`                                                                                                                                             | fail   | Initial sandbox run failed with `EPERM` reading local Prettier entrypoint. No project files were changed by the failed run.    |
| `node .\node_modules\prettier\bin\prettier.cjs --write ...`                                                                                                                                             | pass   | Approved elevated rerun formatted only allowed touched files; only `src/server/services/admin-redeem-code-runtime.ts` changed. |
| `npm.cmd run test:unit -- tests/unit/phase-8-admin-redeem-code-runtime.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/phase-21-admin-redeem-code-concurrency.test.ts` | pass   | 3 files / 10 tests passed after formatting.                                                                                    |
| `npm.cmd run test:unit`                                                                                                                                                                                 | pass   | 151 files / 625 tests passed.                                                                                                  |
| `npm.cmd run test:e2e`                                                                                                                                                                                  | pass   | 26 Playwright tests passed.                                                                                                    |
| `npm.cmd run build`                                                                                                                                                                                     | pass   | Next.js production build passed. Output reported `Environments: .env.local`; no env contents were opened, copied, or recorded. |
| `git diff --check`                                                                                                                                                                                      | pass   | No whitespace errors.                                                                                                          |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-AgentSystemReadiness.ps1`                                                                                          | pass   | Readiness check passed.                                                                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-NamingConventions.ps1`                                                                                             | pass   | Naming scan completed.                                                                                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                     | pass   | Inventory completed; showed expected modified and untracked task files.                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Invoke-QualityGate.ps1`                                                                                                 | pass   | `lint`, `typecheck`, `test:unit` (151 files / 625 tests), and `format:check` passed.                                           |
| `git diff --check`                                                                                                                                                                                      | pass   | Post-evidence whitespace check passed.                                                                                         |
| `node .\node_modules\prettier\bin\prettier.cjs --check ...`                                                                                                                                             | pass   | Post-evidence scoped Prettier check passed after approved elevated run.                                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                     | pass   | Post-evidence inventory showed only expected task files before staging.                                                        |

## Security Review

- Security review path: `docs/05-execution-logs/audits-reviews/2026-05-31-admin-write-concurrency-proof-implementation-security-review.md`.
- Verdict: `APPROVE`.

## Closeout Record

- Commit: pending.
- Merge: pending.
- Push: pending.
- Cleanup: pending.
