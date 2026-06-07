# Phase 33 Advanced Edition Requirements Reading Surface Maintenance Plan

## Task

- Task id: `phase-33-advanced-edition-requirements-reading-surface-maintenance`
- Type: docs-only SOP and index maintenance
- Branch: `codex/phase-33-post-merge-governance-state-sha-sync`
- User approval: user approved continuing the second, third, and fourth recommended docs-only tasks under the project mechanism.

## Objective

Create a reusable maintenance rule for keeping advanced edition source documents and `docs/01-requirements/advanced-edition/**` synchronized without disturbing standard edition requirements.

## Scope

In scope:

- Add `docs/04-agent-system/sop/advanced-edition-requirements-reading-surface-maintenance.md`.
- Link the SOP from the advanced edition source-of-truth index.
- Link the SOP from the derived advanced edition requirements index.
- Record evidence and review.

Out of scope:

- No source requirement content rewrite.
- No file move or deletion.
- No product code, schema, migration, API, service, UI, tests, e2e, scripts, dependency, package, or lockfile changes.
- No provider call, provider cost calibration, env/secret, staging/prod/cloud/deploy, payment, or external-service action.
- No code-stage queue seeding.

## Validation

- `git diff --check`
- Prettier check on changed docs/state files.
- `Select-String` confirms the maintenance SOP includes source/reading surface roles, conflict rule, required checks, forbidden term checks, and blocked gate wording.
- `Test-Path` confirms standard edition and advanced edition requirement files remain present.
