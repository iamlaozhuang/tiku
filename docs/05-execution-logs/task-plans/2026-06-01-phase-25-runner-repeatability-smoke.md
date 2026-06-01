# Phase 25 Runner Repeatability Smoke Plan

## Scope

- Task id: `phase-25-runner-repeatability-smoke`.
- Branch: `codex/phase-25-fresh-validation-runner-hardening`.
- Task kind: `local_verification`.
- Fresh local/dev target: `tiku_fresh_phase25_20260601_001`.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/local-ci.md`
- `docs/03-standards/testing-tdd.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/04-agent-system/sop/fresh-local-dev-db-validation-playbook.md`
- `docs/04-agent-system/state/blocked-gates.yaml`
- `docs/05-execution-logs/evidence/2026-06-01-phase-25-runner-preflight-and-diagnostics.md`

## Verification Plan

1. Run `Invoke-FreshValidationRun.ps1 -DatabaseName tiku_fresh_phase25_20260601_001 -PreflightOnly`.
2. Confirm the preflight summary records only `hostClass`, `databaseName`, `mode`, and `result`, with no URL or secret values.
3. Run the full approved fresh local/dev validation chain through `Invoke-FreshValidationRun.ps1 -DatabaseName tiku_fresh_phase25_20260601_001`.
4. If local Docker API access is blocked by sandboxing, rerun the same approved local/dev runner command with escalation and record that the boundary remains local/dev.
5. Stop and record a blocked gate if success would require raw SQL, destructive DB operation, migration repair, dependency/package/lockfile changes, schema/migration edits, staging/prod/cloud/deploy, real provider, external service, or secret disclosure.
6. Run `git diff --check` after smoke.

## Risk Controls

- `.env.local` may be read and databaseName-updated only through the approved runner mechanism.
- Evidence records only target classification and command outcomes.
- Do not record DB URL, username, password, token, provider payload, raw prompt, raw student answer, raw model response, or plaintext `redeem_code`.
- No deletion, truncation, reset, migration repair, or raw SQL is allowed if the fresh target is not usable.
