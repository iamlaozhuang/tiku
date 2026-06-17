# Task Plan: batch-201 organization-training draft flow

## Task

- id: `batch-201-organization-training-organization-admin-training-draft-publish-ta`
- module: `organization-training`
- target closure: organization admin training draft, publish, takedown, and copy flow
- executionProfile: `local_unit_tdd`
- evidenceMode: `full`

## Norms Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/execution-profiles.yaml`
- `docs/04-agent-system/state/mechanism-source-of-truth-index.yaml`

## Scope

Allowed:

- `src/server/models/**`
- `src/server/contracts/**`
- `src/server/validators/**`
- `src/server/services/**`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/**`
- `docs/05-execution-logs/evidence/**`
- `docs/05-execution-logs/audits-reviews/**`

Blocked:

- `.env.local`, `.env.example`, and all secret/env value access
- `package.json`, lockfiles, dependency changes
- `src/db/schema/**`, `drizzle/**`, schema/migration work
- provider/model calls, cloud/deploy/payment/external-service, PR/force-push
- Cost Calibration Gate

## Implementation Plan

1. Keep the implementation in the service/contract layer only.
2. Add a red-first unit test for a metadata-only organization-training admin lifecycle flow read-model.
3. Implement the smallest contract and pure service helper needed to describe draft, published, and taken-down admin actions without exposing raw question body, standard answer, analysis, provider payload, row data, or internal ids.
4. Re-run focused unit tests, lint, typecheck, `git diff --check`, and closeout readiness.
5. Record redacted evidence and audit review before commit.

## Risk Controls

- No database execution and no repository/schema edits.
- No route/UI changes.
- Evidence will include command names and pass/fail summaries only.
- Public identifier values may appear only as fixture-like single references already used in local unit tests, never as inventories.
