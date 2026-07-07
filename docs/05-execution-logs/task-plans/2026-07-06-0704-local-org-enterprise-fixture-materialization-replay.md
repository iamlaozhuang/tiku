# 2026-07-06 0704 Local Org Enterprise Fixture Materialization Replay Plan

## Task

- Task id: `0704-local-org-enterprise-fixture-materialization-replay-2026-07-06`
- Branch: `codex/0704-local-org-enterprise-fixture-materialization-replay-2026-07-06`
- Trigger: the configured 0704 local DB-backed replay passed schema/journal checks and personal/content bounded replay, but organization employee/admin enterprise-source replay was blocked by missing same-organization published training snapshot fixture.

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
- Latest local DB schema/materialization, Drizzle journal drift, and 0704 DB-backed replay evidence/audit.

## Scope

1. Confirm `master` closeout was merged, pushed, and cleaned before starting this task.
2. Use only the configured local 0704 acceptance DB through existing runtime configuration.
3. Inventory whether a same-organization published training version with non-empty `question_snapshot` already exists for organization AI组卷.
4. If missing, perform a non-destructive local fixture/materialization only:
   - prefer reusing existing local organization, employee, and `org_auth` rows;
   - create only minimal synthetic local fixture rows when required;
   - create or reuse a same-organization published training version with a redacted snapshot sufficient for AI组卷 source selection.
5. Rerun organization DB-backed replay for:
   - `org_advanced_employee` AI组卷 enterprise-source assembly;
   - `org_advanced_admin` AI组卷 enterprise-source assembly;
   - organization employee visible version query;
   - organization employee answer submission/readback where fixture permits.

## Boundaries

- No Provider-enabled call.
- No Provider payload, raw prompt, or raw AI output inspection.
- No staging/prod/deploy/cloud action.
- No Cost Calibration.
- No package or lockfile change.
- No source runtime change.
- No schema source or migration file change.
- No destructive DB operation.
- No DB URL, credentials, sessions, cookies, tokens, headers, env values, raw DB rows, internal ids, account values, full question/answer/paper/material/resource/chunk content, private fixture values, employee raw answers, or plaintext `redeem_code` in evidence.

## Execution Notes

- Temporary local harness files are allowed only for execution and must be deleted before closeout.
- Evidence records only aggregate counts, role labels, workflow stages, command statuses, and safe pass/blocked categories.
- If a runtime source-code defect is reproduced, stop fixture replay classification and split a separate fix branch.

## Validation

- temporary DB-backed fixture/replay harness
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- focused Vitest for affected committed source tests
- `git diff --check`
- scoped Prettier check
- Module Run v2 pre-commit hardening
