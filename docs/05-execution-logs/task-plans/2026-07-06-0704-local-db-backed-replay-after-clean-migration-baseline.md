# 2026-07-06 0704 Local DB-backed Replay After Clean Migration Baseline Plan

## Task

- Task id: `0704-local-db-backed-replay-after-clean-migration-baseline-2026-07-06`
- Branch: `codex/0704-local-db-backed-replay-after-clean-migration-baseline-2026-07-06`
- Trigger: after Drizzle journal drift repair was merged and pushed to `origin/master`, rerun a DB-backed local replay against the configured 0704 local acceptance DB.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- AI generation traceability overlays through `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest DB-backed replay, local DB schema/materialization alignment, and Drizzle journal drift replay evidence/audit.

## Scope

1. Confirm `master` closeout baseline is pushed and branch is clean.
2. Use the configured local 0704 DB through existing local runtime configuration.
3. Apply only the repo-owned, non-destructive Drizzle migrate path if the fixed journal entry has not yet been recorded in the local DB.
4. Run metadata diagnostics for required schema, migration count, and journal alignment.
5. Run DB-backed replay for:
   - personal learning session creation, answer feedback, progress/statistics;
   - organization admin lifecycle version query;
   - organization employee visible version query and answer path where fixture permits;
   - AI组卷 plan-and-select source resolution for `personal_advanced_student`, `org_advanced_employee`, `org_advanced_admin`, and `content_admin`.
6. Decide whether the 0704 DB still needs org admin enterprise-source fixture/materialization.

## Boundaries

- No Provider-enabled call.
- No Provider payload, raw prompt, or raw AI output inspection.
- No staging/prod/deploy/cloud action.
- No Cost Calibration.
- No package or lockfile change.
- No source runtime change.
- No destructive DB operation.
- No screenshots, DOM dumps, traces, raw DB rows, internal ids, DB URL, credentials, sessions, cookies, tokens, env values, full question/answer/paper/material/resource/chunk content, private fixture values, employee raw answers, or plaintext `redeem_code` in evidence.

## Execution Notes

- Use temporary local harness files only if needed; delete them before closeout.
- Record only aggregate counts, role labels, workflow stages, command statuses, and safe blocked categories.
- If a source-code defect is reproduced, stop replay classification and split a separate fix branch.

## Validation

- `npm.cmd exec -- drizzle-kit migrate`
- temporary DB-backed replay harness
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- focused Vitest for affected committed source tests
- `git diff --check`
- scoped Prettier check
- Module Run v2 pre-commit hardening
