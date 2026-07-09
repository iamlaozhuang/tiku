# 2026-07-09 content AI question formal publish loop task plan

## Task

- Task id: `content-ai-question-formal-publish-loop-2026-07-09`
- Branch: `codex/content-ai-question-formal-publish-loop`
- Goal: make content-admin AI question adoption land as a non-user-usable formal question draft first, then let content staff explicitly publish it through the existing question edit/save path.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-formal-draft-detail-entry.md`

## Code Read List

- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/services/admin-ai-generation-formal-draft-adapter.ts`
- `src/server/contracts/admin-ai-generation-formal-draft-adapter-contract.ts`
- `src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts`
- `src/server/services/question-service.ts`
- `src/server/services/question-service.test.ts`
- `src/server/repositories/question-repository.ts`
- `src/server/services/question-route.ts`
- `src/db/schema/paper.ts`
- `src/features/admin/question-material-management/AdminQuestionMaterialManagementClient.tsx`
- `tests/unit/admin-question-material-ui.test.ts`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`

## Requirement Mapping Result

- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md` and `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md` require content AI出题 adoption to create a reviewable formal draft rather than immediately usable learner content.
- `docs/01-requirements/modules/02-question-paper.md` confirms the current formal question model has no full publish workflow; this task therefore uses the existing non-user-usable question status as the smallest no-schema draft gate.
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md` and ADR-007 keep authorization source of truth out of this task; personal AI, organization AI, organization training, and employee visibility remain unchanged.
- Paper publish loop, RAG traceability summary, Provider execution, DB runtime, and schema migration remain out of scope for later serial branches.

## Current Finding

- `question_status` currently supports only `available` and `disabled`; the base question requirements explicitly say questions do not have a complete publish workflow.
- Content AI closed-loop requirements require AI出题 to create reviewable question drafts and not directly write user-usable formal questions.
- Current formal draft adapter calls `questionWriter.createQuestion(...)` for AI question adoption without an initial status override, and the question repository default writes `available`.

## Implementation Plan

1. Add failing unit coverage showing content AI question formal adoption asks the question writer to create the adopted question as a non-user-usable draft status using the existing `disabled` status.
2. Add failing service/repository contract coverage showing normal manual question creation still defaults to `available`, while internal formal-draft creation can explicitly request `disabled`.
3. Add UI coverage for a disabled AI-targeted question opened through `questionPublicId`: the action label is explicit publish wording and the PATCH payload sets `status: "available"`.
4. Implement the smallest API-internal option surface:
   - extend the formal draft question writer with optional creation options;
   - extend question service/repository create calls with optional `initialStatus`;
   - apply `initialStatus: "disabled"` only to top-level content AI question adoption, not to AI paper companion questions.
5. Keep manual content question creation, question edit, question disable/copy, personal AI, organization AI, organization training, paper adoption, Provider, DB schema, migrations, and dependencies unchanged.

## Risk Defense

- No schema or migration: use existing `disabled` as the non-user-usable draft gate for AI-created formal question drafts.
- Do not change paper companion question behavior in this branch, because paper draft composition currently depends on attachable available source questions.
- Do not change authorization or edition code.
- Do not expose raw AI output, full question text, internal numeric ids, credentials, session/cookie/token/localStorage/Auth header, env values, DB URL, raw DB rows, Provider payload, raw prompt, raw AI output, screenshots, traces, or raw DOM in evidence.

## Validation Plan

- Red/green targeted tests:
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/services/question-service.test.ts tests/unit/admin-question-material-ui.test.ts --reporter=dot`
- Adjacent role-boundary regression:
  - `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-generation-entry-surface.test.ts src/server/services/admin-ai-generation-formal-adoption-runtime.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 run typecheck`
- `corepack pnpm@10.26.1 run lint`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-question-formal-publish-loop-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-question-formal-publish-loop-2026-07-09 -SkipRemoteAheadCheck`

## Out Of Scope

- No DB connection, DB mutation outside unit tests, schema migration, seed, fixture rewrite, dependency, package/lockfile, Provider execution, prompt/provider payload work, browser runtime, screenshot evidence, staging/prod/deploy/env/secret, PR, force-push, or Cost Calibration.
- No paper publish loop repair; paper branch remains the next serial task.
