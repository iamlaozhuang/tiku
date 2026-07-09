# 2026-07-09 Content AI Paper Formal Publish Loop Task Plan

## Task

- Task id: `content-ai-paper-formal-publish-loop-2026-07-09`
- Branch: `codex/content-ai-paper-formal-publish-loop`
- Base: latest `origin/master` confirmed at `ab9882913`
- Goal: make content-admin AI paper generation land as a formal paper draft composed from selected formal question references, then keep publish through the existing paper draft detail and publish validation path.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/03-standards/ui-code.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Recent 2026-07-09 AI generation evidence and audits for adoption read model, formal draft detail entry, question formal publish loop, and org paper section validation.

## Code Read List

- `src/server/services/admin-ai-generation-formal-adoption-service.ts`
- `src/server/services/admin-ai-generation-formal-adoption-runtime.ts`
- `src/server/services/admin-ai-generation-formal-draft-adapter.ts`
- `src/server/contracts/admin-ai-generation-formal-draft-adapter-contract.ts`
- `src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`
- `src/lib/admin-ai-generation-formal-draft-payload.ts`
- `src/lib/admin-ai-generation-formal-draft-payload.test.ts`
- `src/features/admin/ai-generation/AdminAiGenerationEntryPage.tsx`
- `tests/unit/admin-ai-generation-entry-surface.test.ts`
- `src/server/services/admin-ai-generation-local-contract-route.ts`
- `src/server/services/admin-ai-generation-local-contract-route.test.ts`
- `src/server/services/paper-draft-service.ts`
- `src/server/services/paper-draft-service.test.ts`
- `src/server/repositories/paper-draft-repository.ts`
- `src/features/admin/paper-management/AdminPaperManagementClient.tsx`
- `tests/unit/admin-paper-ui.test.ts`

## Requirement Mapping Result

- Content-admin AI paper generation must use platform formal question bank as source.
- AI paper Provider output is plan-only; the real paper draft must be composed locally from selected eligible formal question references.
- Content-admin adoption must create a formal paper draft, not an organization training draft and not a directly published paper.
- Formal paper draft detail remains the governed editing, review, validation, publish, archive, and copy surface.
- Employee, organization admin, and personal advanced AI generation surfaces must not regress.
- Evidence must stay redacted: no credentials, env values, raw DB rows, internal numeric ids, Provider payloads, raw prompts, raw AI output, full question, full paper, full material, or chunk content.

## Current Code Findings

- The content-admin reviewed draft helper already maps `paperAssembly.container.sections[].selectedQuestions[]` into `paperSections[].paperQuestions[]` using `questionPublicId` and `companionQuestionDraft: null`.
- The paper draft repository/service composes draft papers from source question public ids and publish locks source public ids through the existing publish path.
- The formal draft adapter still accepts companion question drafts for paper composition, which conflicts with the current content-admin AI paper contract because it could create AI-generated formal questions during paper adoption.

## Implementation Plan

1. Add red tests that content AI paper adoption rejects paper questions without an existing formal `questionPublicId`, and does not call the question writer for companion question drafts.
2. Keep the existing content-admin paper assembly reviewed-draft behavior intact and covered.
3. Narrowly change the formal draft adapter so paper composition only accepts existing formal question references.
4. Do not change organization training draft creation, personal AI generation, Provider execution, DB schema, package files, learner surfaces, or question publish logic.
5. Verify paper draft publish path remains governed through existing paper draft service/UI tests.

## Validation Plan

- TDD red:
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts --reporter=dot`
- Targeted green:
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/lib/admin-ai-generation-formal-draft-payload.test.ts tests/unit/admin-ai-generation-entry-surface.test.ts tests/unit/admin-paper-ui.test.ts src/server/services/paper-draft-service.test.ts --reporter=dot`
- Adjacent role boundary:
  - `corepack pnpm@10.26.1 exec vitest run src/server/services/admin-ai-generation-local-contract-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/organization-training-route.test.ts tests/unit/organization-training-admin-entry-surface.test.ts --reporter=dot`
- Quality gates:
  - `corepack pnpm@10.26.1 run typecheck`
  - `corepack pnpm@10.26.1 run lint`
  - `git diff --check`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId content-ai-paper-formal-publish-loop-2026-07-09`
  - `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId content-ai-paper-formal-publish-loop-2026-07-09 -SkipRemoteAheadCheck`

## Risk Defense

- No Provider execution.
- No DB connection or mutation.
- No package or lockfile changes.
- No schema, migration, seed, staging, production, deploy, secret, or Cost Calibration action.
- No screenshots, raw DOM, localStorage, cookies, session, tokens, auth headers, or env reads.
- The paper branch must not weaken personal advanced, organization advanced employee, or organization advanced admin AI question/paper behavior.
