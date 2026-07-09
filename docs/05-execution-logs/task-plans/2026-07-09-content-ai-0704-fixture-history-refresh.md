# Content AI 0704 Fixture History Refresh Plan

## Scope

- Task id: `content-ai-0704-fixture-history-refresh-2026-07-09`
- Branch: `codex/content-ai-0704-fixture-history-refresh`
- Approval path: Option B from `docs/05-execution-logs/acceptance/2026-07-09-content-ai-0704-next-proof-approval-package.md`.

## Fresh Approval

User approval received in this thread:

> 批准对本地 0704 DB 做一次非破坏性、脱敏的内容 AI 出题/组卷验收历史补齐，按审批包脱敏约束执行。

## Required Reading Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/acceptance/2026-07-09-content-ai-0704-next-proof-approval-package.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-final-localhost-acceptance.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-final-acceptance-closeout-state.md`

## Implementation Plan

1. Read affected schema/service code for content AI generation, formal adoption, formal draft writers, paper/question publish paths, and current DB connection helpers.
2. Confirm the local process DB target is the 0704 acceptance DB without printing connection strings, credentials, raw DB rows, or internal numeric ids.
3. Inspect only aggregate/status-level preconditions needed to identify whether minimal publishable content AI history already exists.
4. Execute one non-destructive fixture/history refresh if needed:
   - create or update the minimum content AI出题 review target that can be adopted into a formal question draft;
   - create or update the minimum content AI组卷 review target and paper draft target that can satisfy publish replay preconditions;
   - use public ids and stable selector labels only in logs/evidence;
   - never delete, truncate, reset, or rewrite unrelated rows.
5. Validate via aggregate/status probes and targeted tests.
6. Write redacted evidence and adversarial audit.
7. Commit, merge, push, and delete short branch before the next proof/replay branch.

## Boundaries

- Localhost / 0704 acceptance DB only.
- Direct DB connection and non-destructive mutation are approved only for this fixture/history refresh.
- No Provider call.
- No env value, DB URL, credential, session, cookie, token, localStorage, Authorization header, raw DB row, internal numeric id, Provider payload, raw prompt, raw AI output, or full question/paper/material/resource/chunk in evidence or chat.
- No schema, migration, seed, package, or lockfile change.
- No staging/prod/deploy/Cost Calibration.
- No screenshot or raw DOM capture.
- Do not modify personal advanced learner, organization advanced employee, or organization advanced admin implementation.

## Validation Plan

- Redacted DB target confirmation before mutation.
- Redacted aggregate before/after fixture status.
- Targeted content AI/formal draft/paper publish tests.
- Targeted personal learner AI regression tests.
- Targeted organization training/admin/employee regression tests.
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 typecheck`
- `git diff --check`
- Module Run v2 precommit/prepush gates.
