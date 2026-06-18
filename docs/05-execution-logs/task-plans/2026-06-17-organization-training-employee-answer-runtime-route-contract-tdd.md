# Organization Training Employee Answer Runtime Route Contract TDD Plan

## Task

- taskId: `organization-training-employee-answer-runtime-route-contract-tdd`
- branch: `codex/organization-training-employee-answer-runtime-route-contract-tdd`
- executionProfile: `local_unit_tdd`
- targetUseCase: `UC-ADV-EMPLOYEE-TRAINING-ANSWER`
- targetStatusTransition: `partial_to_route_contract_ready_no_experience_closed_claim`
- Cost Calibration Gate remains blocked.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/stories/epic-02-organization-training.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/local-experience-coverage-matrix.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-runtime-api-gap-boundary-audit.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-version-takedown-runtime-route-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-employee-answer-runtime-repository-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-17-organization-training-employee-answer-runtime-route-contract-tdd-queue-materialization.md`

## Pre-Edit Diagnostics

- `git switch master`, `git fetch --prune origin`, clean status, matching `HEAD/master/origin/master`, and no `codex/*`
  refs were verified before this branch was created.
- `Get-TikuProjectStatus.ps1`: selected `organization-training-employee-answer-runtime-route-contract-tdd` as the next
  executable task and reported the repository safe to proceed.
- `Get-TikuNextAction.ps1 -VerboseHistory`: ready set selected this task and reported no blocking historical drift for
  the current run.

## Implementation Approach

1. RED: add focused route, validator, and repository tests for:
   - employee visible assigned training list;
   - metadata-only draft save;
   - metadata-only submit;
   - readonly summary;
   - malformed payload rejection and redaction of raw/private answer fields.
2. GREEN:
   - add employee answer validator normalization for draft save and submit payloads;
   - add repository read methods needed by runtime route composition without schema changes;
   - wire runtime route store to existing metadata-only repository methods;
   - add thin App Router entrypoints under `/api/v1/organization-trainings/**`;
   - keep service as the business-rule owner and route handlers as thin adapters returning `{ code, message, data }`.
3. Validation:
   - run the declared focused unit command;
   - run e2e list-only discovery;
   - run scoped Prettier, lint, typecheck, git diff check, and Module Run v2 readiness gates.

## Risk Controls

- No `.env*`, package/lockfile/dependency, schema/drizzle/migration, provider/model, dev server, Browser/Playwright
  runtime, full e2e, staging/prod/cloud/deploy/payment/external-service, PR, force-push, or Cost Calibration Gate work.
- No raw answer persistence, raw answer evidence, Authorization header evidence, public identifier inventories, row data,
  or private data.
- Do not claim `experience_closed`; employee UI entry surface and approved local full-flow validation remain blocked.
