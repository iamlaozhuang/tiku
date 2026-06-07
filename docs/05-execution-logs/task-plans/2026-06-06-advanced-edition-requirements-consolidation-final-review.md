# Advanced Edition Requirements Consolidation Final Review Plan

## Task

- Task id: `phase-33-advanced-edition-requirements-consolidation-final-review`
- Type: docs-only governance review
- Branch: `codex/phase-33-advanced-edition-requirements-consolidation-final-review`
- Request: run one more review to ensure no advanced edition requirements consolidation information was missed.

## Scope

In scope:

- Re-check `docs/01-requirements/advanced-edition/**` as the derived advanced edition reading surface.
- Re-check root requirements index linkage.
- Re-check standard edition source requirements remain in place.
- Re-check advanced edition source specs and plans remain in place.
- Re-check terminology and blocked gate wording.
- Update governance state if the review finds state drift.
- Record evidence and audit review.

Out of scope:

- No product code, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No file move or deletion.
- No provider call, provider cost calibration, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
- No code-stage queue seeding.

## Required Context Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Review Checks

1. Confirm the advanced edition reading surface contains the expected 14 files.
2. Confirm `docs/01-requirements/00-index.md` links to `docs/01-requirements/advanced-edition/00-index.md`.
3. Confirm standard edition source module and story documents still exist.
4. Confirm advanced edition source specs and plans still exist.
5. Confirm advanced edition derived docs use required project terms: `authorization`, `paper`, `mock_exam`, `redeem_code`, `audit_log`, `ai_call_log`.
6. Confirm forbidden terms `license` and `exam_paper` do not appear in the derived advanced edition requirements docs.
7. Confirm `Cost Calibration Gate remains blocked` appears in the derived advanced edition requirements docs.
8. Confirm `project-state.yaml` tracks the current master and origin/master SHA after the prior merge.

## Expected Outcome

- If no content omission is found, record pass evidence.
- If governance state drift is found, fix only `project-state.yaml` and `task-queue.yaml`.
- Keep Cost Calibration Gate blocked.
