# Formal paper draft composition adapter TDD task plan

Task id: `formal-paper-draft-composition-adapter-tdd-2026-06-26`

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
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Content admin generated `paper` output may become formal content only through governed review and formal draft adoption.
- This task implements the approved draft composition TDD from
  `docs/05-execution-logs/acceptance/2026-06-26-formal-paper-draft-composition-adoption-approval-package.md`.
- The approved strategy is `mixed_existing_or_companion_question_draft_via_adapter`.
- Publish, Provider/Cost, staging/prod, payment, external service, and final Pass remain blocked.

## Requirement Mapping

The implementation will extend the adapter/service contract so a reviewed generated `paper` draft can produce an
editable formal `paper` draft that includes `paper_section` and `paper_question` composition. It will use existing
writer/service boundaries and return only redacted identifiers/status/counts.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-formal-paper-draft-composition-adoption-approval-package.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-content-paper-generated-result-local-route-setup-and-formal-draft-route-smoke.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-route-integration-and-metadata-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md`

## Conflict Check

No conflict found. Existing `paper-draft-service` already exposes `createPaper` and `addQuestionToDraftPaper`, and the
current DB schema already includes `paper_section` and `paper_question`. This task will not change schema or run DB.

## TDD Plan

1. RED: add failing adapter tests for composing a generated paper with an existing formal `question` reference.
2. RED: add failing adapter tests for creating a companion formal `question` draft before adding it to the formal
   `paper` draft.
3. GREEN: extend adapter contract and service writer port minimally to satisfy tests.
4. GREEN: update runtime default writer wiring so the route can call the new paper composition writer path in a later
   smoke.
5. Run focused unit tests, lint, typecheck, scoped Prettier, diff check, and Module Run v2 gates.

## Scope

Allowed:

- `admin-ai-generation-formal-draft-adapter` contract/service/tests.
- `admin-ai-generation-formal-adoption-runtime` wiring/tests.
- Task plan, evidence, audit review, project state, and task queue updates.

Blocked:

- Live DB connection or route smoke.
- Schema/migration/drizzle changes.
- Direct DB seed/fixture/destructive work.
- Provider/model calls or credential access.
- Formal publish/student-visible content.
- Staging/prod/cloud/deploy/payment/external-service work.
- Dependency or lockfile changes.
- Final Pass claim.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown <changed docs/state/source/test files>`
- `npx.cmd prettier --check --ignore-unknown <changed docs/state/source/test files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId formal-paper-draft-composition-adapter-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId formal-paper-draft-composition-adapter-tdd-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

- A repository contract or schema change becomes necessary.
- Live DB route smoke is needed before TDD can pass.
- Evidence would expose raw generated content, raw reviewed draft, full formal content, DB rows, secret, token, DB URL,
  Authorization header, prompt, Provider payload, or credential material.
