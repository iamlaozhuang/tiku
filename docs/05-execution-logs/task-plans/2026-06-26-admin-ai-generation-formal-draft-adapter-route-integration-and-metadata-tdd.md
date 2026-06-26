# Admin AI generation formal draft adapter route integration and metadata TDD task plan

Task id: `admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`

## Requirement Decision Map

- Content admin AI generated results may become formal `question` or `paper` drafts only after governed review.
- Formal adoption must preserve source attribution, reviewer attribution, validation result, timestamp, and redacted audit evidence.
- Existing formal `QuestionService.createQuestion` and `PaperDraftService.createPaper` remain the writer boundary.
- Direct publish, organization-scoped adoption, Provider/Cost, staging/prod, payment, external service, and final Pass remain blocked.

## Requirement Mapping

This task maps reviewed content admin generated results into formal draft creation without publishing. It should extend
the existing route/service/repository path so a successful content adoption can:

1. create or reuse adoption metadata;
2. invoke the formal draft adapter with the reviewed draft payload;
3. persist the formal draft public id back to adoption metadata as `draft_created`;
4. return only redacted identifiers/status.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-route-integration-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md`

## Conflict Check

No conflict found. The task is implementation TDD under an approved local source boundary and does not execute live DB,
route smoke, Provider, migration, seed, staging/prod, release, or payment work.

## TDD Plan

RED tests:

- Runtime route: content admin question adoption invokes the formal draft adapter and adoption metadata update, returning `draft_created` and public draft id without raw content.
- Runtime route: content admin paper adoption follows the same path.
- Repository: metadata update persists only the matching formal draft id and rejects target mismatches.
- DB adapter: mapper accepts `draft_created` rows only when exactly one matching formal draft public id is present.

GREEN implementation:

- Extend the formal adoption repository contract with a narrow draft-created metadata update method.
- Allow mapping `draft_created` adoption rows while preserving validation against unsafe mixed ids.
- Inject formal draft adapter into the adoption service/runtime.
- Keep route handler thin and keep default runtime wiring inside service/repository boundaries.

## Scope

Allowed source/test files are exactly those listed in `task-queue.yaml` for this task. This task may not change schema,
migration, package/lockfile, env files, e2e, frontend, or generated artifacts.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts src/server/repositories/admin-ai-generation-formal-adoption-db-adapter.test.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- scoped `prettier --write` and `prettier --check`
- `git diff --check`
- `Test-ModuleRunV2PreCommitHardening.ps1`
- `Test-ModuleRunV2PrePushReadiness.ps1 -SkipRemoteAheadCheck`

## Stop Conditions

- A schema or migration change becomes necessary.
- A live DB route smoke or local data mutation becomes necessary.
- A Provider call, credential read, env change, dependency change, staging/prod/deploy/payment/external-service action, PR, force push, or Cost Calibration work becomes necessary.
- Evidence would need to expose raw generated content, prompt, raw output, provider payload, secret, DB URL, token, cookie, Authorization header, internal numeric id, or full formal content.
