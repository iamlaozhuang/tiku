# 0704 Content Non-AI Publish Smoke Task Plan

## Goal

Validation-only localhost smoke for formal content maintenance after the AI closed-loop fixes, proving `content_admin` and
`super_admin` formal `question`, `material`, and `paper` lifecycle boundaries remain stable without rerunning AI generation
or mutating product content through localhost.

## Scope

- Branch: `codex/0704-content-non-ai-publish-smoke`
- Task id: `0704-content-non-ai-publish-smoke-2026-07-10`
- Acceptance source: `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- Allowed writes:
  - `docs/05-execution-logs/task-plans/2026-07-10-0704-content-non-ai-publish-smoke.md`
  - `docs/05-execution-logs/evidence/2026-07-10-0704-content-non-ai-publish-smoke-evidence.md`
  - `docs/05-execution-logs/audits-reviews/2026-07-10-0704-content-non-ai-publish-smoke-audit.md`
  - `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
  - `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
  - `docs/04-agent-system/state/project-state.yaml`
  - `docs/04-agent-system/state/task-queue.yaml`

## Required Reads Completed

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- Recent related evidence for paper lifecycle, question/material write loop, content AI formal adoption, and Stage 3.
- Targeted code/test entry points for admin UI, runtime handlers, services, validators, mappers, and repository guards.

## Validation Design

1. Run the 0704 private-account readiness preflight after reading the private index and canonical catalog. Evidence records
   only `roleLabel`, auth context category, and readiness category.
2. Run targeted tests that cover:
   - content admin and super admin formal content access;
   - `ops_admin` denial from content author surfaces;
   - `question` and `material` create/edit/disable/copy and locked copy-only behavior;
   - `paper` draft composition, publish, archive, copy, and paper asset metadata binding;
   - publish validation rejection for incomplete or invalid draft status categories;
   - published snapshot immutability and referenced source locking;
   - archive/takedown termination of unfinished learner starts while preserving historical status categories;
   - public identifier API routes and standard response envelopes.
3. Run localhost API smoke as read-only route checks only. Do not create, publish, archive, copy, disable, or edit product
   content through localhost.
4. Write redacted evidence and adversarial review. No account, password, cookie, session, token, env value, DB URL, raw DB
   row, internal id, Provider payload, raw prompt, raw AI output, raw answer, or full `question`/`paper`/`material` content.
5. Update the roadmap, coverage ledger, state, and queue to close Stage 4 and point Stage 5 as next.

## Commands

```powershell
corepack pnpm@10.26.1 exec vitest run tests/unit/admin-question-material-ui.test.ts tests/unit/admin-paper-ui.test.ts tests/unit/phase-9-content-question-material-runtime.test.ts tests/unit/phase-9-paper-composition-lifecycle-runtime.test.ts tests/unit/paper-draft-repository-composition-guard.test.ts tests/unit/paper-draft-repository-archive-termination.test.ts src/server/services/question-service.test.ts src/server/services/question-route.test.ts src/server/services/material-service.test.ts src/server/services/material-route.test.ts src/server/services/paper-draft-service.test.ts src/server/services/paper-draft-route.test.ts src/server/services/paper-asset-service.test.ts src/server/services/paper-asset-route.test.ts src/server/validators/question.test.ts src/server/validators/paper-draft.test.ts src/server/mappers/paper-mapper.test.ts src/server/repositories/question-repository.test.ts tests/unit/question-paper/question-paper-rest-layering.test.ts
corepack pnpm@10.26.1 exec prettier --check --ignore-unknown docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/project-state.yaml docs/05-execution-logs/task-plans/2026-07-10-0704-content-non-ai-publish-smoke.md docs/05-execution-logs/evidence/2026-07-10-0704-content-non-ai-publish-smoke-evidence.md docs/05-execution-logs/audits-reviews/2026-07-10-0704-content-non-ai-publish-smoke-audit.md docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md
git diff --check
corepack pnpm@10.26.1 run lint
corepack pnpm@10.26.1 run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-content-non-ai-publish-smoke-2026-07-10
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-content-non-ai-publish-smoke-2026-07-10 -SkipRemoteAheadCheck
```

## Stop Conditions

- Any readiness preflight failure stops business validation and becomes a separate account-readiness task.
- Any verified product defect stops this validation branch and requires a separate `codex/*` repair branch.
- Any sensitive output, Provider execution, direct DB connection, schema/migration/seed/package/lockfile diff, staging/prod,
  deploy, screenshot, raw DOM, or Cost Calibration action stops the task.

## Adversarial Review Checklist

- Role boundary: `content_admin` and `super_admin` are allowed; `ops_admin` is denied from content authoring surfaces.
- Data boundary: public identifiers and standard envelopes are used; no internal ids or raw rows are surfaced.
- Lifecycle boundary: published content is immutable where required; copies create draft status categories.
- Takedown boundary: archived content blocks new starts and preserves historical status categories.
- AI boundary: no AI generation, Provider call, raw AI output, or formal adoption rerun occurs.
- Evidence boundary: evidence remains redacted and contains only status categories, role labels, route labels, and command
  results.
