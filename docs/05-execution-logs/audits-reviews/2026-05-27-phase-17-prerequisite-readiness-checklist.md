# Phase 17 Prerequisite Readiness Checklist

**Date:** 2026-05-27

**Task:** `phase-17-local-e2e-prerequisite-readiness-audit`

## Purpose

Define the local readiness checks that must run before Phase 16 requirement audit execution. This checklist is a planning artifact; it does not assert that the prerequisites are currently satisfied.

## Status Legend

- `not_checked`: not yet verified in Phase 17 execution.
- `ready`: verified locally.
- `partial`: partially verified or unstable.
- `blocked`: cannot proceed without a prerequisite task or approval gate.
- `not_applicable`: not relevant to local prerequisite readiness.

## Checklist

| checkId | Area                    | Check                                                                                                                             | Evidence expected                                                        | Status      | Follow-up task |
| ------- | ----------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----------- | -------------- |
| P17-01  | Git/runtime baseline    | Worktree is clean before local verification branch work starts; `master` is aligned with `origin/master`.                         | Git status and ahead/behind count.                                       | not_checked | TBD            |
| P17-02  | Dev server              | Existing local dev server command is discoverable from current package scripts without editing package files.                     | Script name and command summary, no dependency changes.                  | not_checked | TBD            |
| P17-03  | Dev server              | Dev server starts on a local-only host and remains reachable long enough for smoke verification.                                  | Process id, local URL, HTTP/browser reachability, log summary.           | not_checked | TBD            |
| P17-04  | Database                | Local database service availability can be determined without reading env files or using staging/prod/cloud.                      | Docker/local process status or blocked reason.                           | not_checked | TBD            |
| P17-05  | Database                | Database schema/fixture readiness can be inferred through existing non-destructive commands or app behavior.                      | Non-destructive command result or blocked reason.                        | not_checked | TBD            |
| P17-06  | Fixtures                | Synthetic baseline data exists or can be verified for published papers, questions, materials, reports, knowledge nodes, and logs. | Route/API/e2e fixture signal summary, no sensitive data.                 | not_checked | TBD            |
| P17-07  | Roles                   | `student` role account coverage is available for local audit flows.                                                               | Existence-only account fixture signal; no password or secret values.     | not_checked | TBD            |
| P17-08  | Roles                   | `super_admin` role account coverage is available for local audit flows.                                                           | Existence-only account fixture signal; no password or secret values.     | not_checked | TBD            |
| P17-09  | Roles                   | `ops_admin` role account coverage is available for local audit flows.                                                             | Existence-only account fixture signal; no password or secret values.     | not_checked | TBD            |
| P17-10  | Roles                   | `content_admin` role account coverage is available for local audit flows.                                                         | Existence-only account fixture signal; no password or secret values.     | not_checked | TBD            |
| P17-11  | E2E runner              | Existing e2e script is discoverable and can be invoked in a non-destructive way.                                                  | Script presence, dry/list/smoke result, or blocked reason.               | not_checked | TBD            |
| P17-12  | Browser/IAB             | Browser/IAB or Playwright can reach the local dev URL.                                                                            | Backend used, URL, visible state summary, console/network error summary. | not_checked | TBD            |
| P17-13  | Env restriction         | `.env.local` and `.env.example` contents remain unread; any env dependency is recorded as a blocked gate.                         | Explicit evidence statement.                                             | not_checked | TBD            |
| P17-14  | Real provider gate      | Real provider calls remain blocked; local mock/deterministic provider is the only allowed runtime path.                           | Gate mapping to `real-provider-staging-redaction`.                       | not_checked | TBD            |
| P17-15  | Staging/prod/cloud gate | Staging/prod/cloud/deploy actions remain blocked.                                                                                 | Gate mapping to `deploy-and-cloud-change` and related gates.             | not_checked | TBD            |
| P17-16  | Dependency gate         | Missing tooling is not fixed by changing dependencies inside Phase 17.                                                            | Gate mapping to `dependency-change`.                                     | not_checked | TBD            |
| P17-17  | Destructive data gate   | Fixture verification avoids destructive resets unless separately approved.                                                        | Gate mapping to `destructive-data-operation`.                            | not_checked | TBD            |
| P17-18  | Queue output            | Missing prerequisites are registered as future tasks with clear scope and validation.                                             | Queue diff summary.                                                      | not_checked | TBD            |

## Execution Boundaries

The execution task may read source, tests, e2e files, scripts, and package metadata for inventory only when needed to understand local readiness. It must not edit those files.

The execution task must not:

- read `.env.local` or `.env.example`;
- modify package manifests or lockfiles;
- modify runtime, test, e2e, schema, migration, or script files;
- call real providers;
- use staging/prod/cloud resources;
- deploy;
- perform destructive data operations;
- fix bugs discovered during readiness checks.

## Output Requirements

The execution task must produce:

- a task plan;
- an evidence file with command summaries;
- a readiness audit report using this checklist;
- queue updates for missing prerequisites when applicable;
- a final statement of whether Phase 16 audits can proceed directly, partially, or must wait on prerequisite tasks.
