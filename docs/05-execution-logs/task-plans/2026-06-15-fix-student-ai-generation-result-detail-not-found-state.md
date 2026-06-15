# Task Plan: Fix Student AI Generation Result Detail Not-Found State

## Task

- Task id: `fix-student-ai-generation-result-detail-not-found-state`
- Branch: `codex/fix-student-ai-generation-result-detail-not-found-state`
- Date: 2026-06-15
- Baseline: `5c3e4741f704e7a788cee2decaff829730a5061a`
- Scope: narrow student UI bugfix.

## Read Before Edit

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
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- Recent evidence/audit for:
  - `advanced-personal-ai-generation-result-redacted-detail-read-model-service`
  - `advanced-personal-ai-generation-result-redacted-detail-readonly-route`
  - `advanced-student-ai-generation-result-detail-ui`
  - `advanced-personal-ai-generation-result-detail-flow-readonly-audit`

## Repository Gate

- `git switch master`: pass.
- `git fetch --prune origin`: pass.
- Worktree clean before branch creation: pass.
- `HEAD == master == origin/master`: pass at `5c3e4741f704e7a788cee2decaff829730a5061a`.
- No local or remote `codex/*` branch residue: pass.

## Problem Statement

The readonly audit found a UI/service contract mismatch:

- detail service and readonly route return not-found as `404045`;
- the student UI detail affordance currently maps only `404019` to the empty detail state.

Result: a real service/route detail not-found response would display the generic error state instead of the intended
redacted empty detail state.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-15-fix-student-ai-generation-result-detail-not-found-state.md`
- `docs/05-execution-logs/evidence/2026-06-15-fix-student-ai-generation-result-detail-not-found-state.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-fix-student-ai-generation-result-detail-not-found-state.md`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`

## Blocked Gates

- No `.env*` read, output, summary, or modification.
- No DB access or direct row/private data access.
- No provider/model call or provider configuration.
- No quota/cost measurement or Cost Calibration Gate.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service work.
- No schema, migration, drizzle, script, package, lockfile, or dependency change.
- No route, service, repository, mapper, formal adoption write, authorization-model change, PR, or force-push.
- No raw prompt, raw answer, provider payload, secret, token, cookie, Authorization header, database URL, row data, or
  private data exposure.

## TDD Plan

1. RED: change the focused detail empty-state component test so the mocked detail response uses actual route/service
   not-found code `404045`. Run the focused unit test and confirm it fails by rendering the error state instead of the
   empty state.
2. GREEN: update the student UI detail response handling so `404045` maps to the redacted empty detail state.
3. Regression: run the focused component test, whitespace diff check, lint, typecheck, and Module Run v2 closeout gates.

## Risk Controls

- Keep the implementation to one UI condition and one focused test assertion.
- Do not change REST route, service, DTO, schema, provider, dependency, or formal adoption behavior.
- Preserve `redacted`, `local_contract_only`, `metadata_only`, and `blocked_without_follow_up_task` semantics.
