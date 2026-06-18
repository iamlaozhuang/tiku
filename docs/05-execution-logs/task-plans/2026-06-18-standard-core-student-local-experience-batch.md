# Standard Core Student Local Experience Batch Plan

## Scope

- Task: `standard-core-student-local-experience-batch`
- Batch id: `standard-core-student-local-experience-batch`
- Profile: `local_low_risk_experience_batch`
- Use cases:
  - `UC-STD-ACCOUNT-SESSION`
  - `UC-STD-PERSONAL-AUTH-REDEEM`
  - `UC-STD-PRACTICE`
  - `UC-STD-MOCK-EXAM`
  - `UC-STD-REPORT-MISTAKE-BOOK`

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

1. Create a parent low-risk local experience batch and five child audit result records.
2. Reuse one focused unit surface across the five standard student use cases.
3. Run `npm.cmd run test:e2e -- --list` once for the batch.
4. Keep all five rows at `local_experience_ready` unless fresh runtime full-flow evidence exists in this task.
5. Seed a follow-up local full-flow validation task for the student core chain because this batch is not allowed to run Browser/Playwright runtime.
6. Run shared lint, typecheck, diff, and Module Run v2 readiness gates once at batch closeout.

## Risk Controls

- No product source, `.env*`, dependency, package/lockfile, schema/drizzle/migration, e2e spec, provider/model, external service, staging/prod, deploy, payment, PR, force-push, or Cost Calibration Gate changes.
- No Browser/Playwright runtime execution in this batch.
- No `experience_closed` claim from this batch.
- No test-only fixture repair is planned. The evidence still records RED/GREEN as not-used anchors for the batch mechanism.
