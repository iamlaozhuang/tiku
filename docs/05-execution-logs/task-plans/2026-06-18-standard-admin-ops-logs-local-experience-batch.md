# Standard Admin Ops Logs Local Experience Batch Plan

## Scope

- Task: `standard-admin-ops-logs-local-experience-batch`
- Batch id: `standard-admin-ops-logs-local-experience-batch`
- Profile: `local_low_risk_experience_batch`
- Use case: `UC-STD-ADMIN-OPS-LOGS`

## Read Norms

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/sop/local-experience-closure-governance.md`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`

## Implementation Plan

1. Create a parent low-risk local experience batch and one child audit result for `UC-STD-ADMIN-OPS-LOGS`.
2. Run the focused unit surface for admin AI audit log baseline and admin log retention/redaction layering.
3. Run `npm.cmd run test:e2e -- --list` once for this separate batch.
4. Keep the row at `local_experience_ready` because Browser/Playwright runtime full-flow is not allowed in this batch.
5. Seed a follow-up local full-flow validation task for admin ops/logs.
6. Run shared lint, typecheck, diff, and Module Run v2 readiness gates once at batch closeout.

## Risk Controls

- No product source, `.env*`, dependency, package/lockfile, schema/drizzle/migration, e2e spec, provider/model, external service, staging/prod, deploy, payment, PR, force-push, destructive DB, or Cost Calibration Gate changes.
- No Browser/Playwright runtime execution in this batch.
- No `experience_closed` claim from this batch.
- No test-only fixture repair is planned. The evidence still records RED/GREEN as not-used anchors for the batch mechanism.
