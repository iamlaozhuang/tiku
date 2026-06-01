# Phase 25 Runner Preflight And Diagnostics Plan

## Scope

- Task id: `phase-25-runner-preflight-and-diagnostics`.
- Branch: `codex/phase-25-fresh-validation-runner-hardening`.
- Task kind: `implementation`.
- Allowed implementation files:
  - `scripts/local/Invoke-FreshValidationRun.ps1`
  - `tests/unit/fresh-validation-runner.test.ts`

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/sop/automation-loop.md`
- `docs/04-agent-system/sop/security-review-gate.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/audits-reviews/2026-06-01-phase-25-runner-hardening-design.md`

## TDD Plan

1. RED: Add focused unit tests for:
   - `-PreflightOnly` validates local/dev target and returns a redacted summary without changing the env file.
   - phase-25 fresh database names are accepted while still requiring the `tiku_fresh_phase*` local/dev prefix.
   - non-loopback targets fail with `failureCategory=target_not_local_dev` and do not leak the URL or password.
2. GREEN: Update the PowerShell runner minimally:
   - add `-PreflightOnly`;
   - split env target inspection from env target mutation;
   - add stable failure categories and redacted summary output;
   - allow phase-numbered fresh database prefixes.
3. Verify targeted unit, full unit, `git diff --check`, and naming gate.

## Risk Controls

- Unit tests use temporary env files with synthetic placeholder values only.
- The real `.env.local` is not read by tests.
- No dependencies, package/lockfile, schema, migration, drizzle, raw SQL, destructive DB operation, staging/prod/cloud/deploy, real provider, external service, or `.env.example` changes.
- Runner output must never include full DB URL, username, password, token, provider payload, raw prompt, raw student answer, raw model response, or plaintext `redeem_code`.
