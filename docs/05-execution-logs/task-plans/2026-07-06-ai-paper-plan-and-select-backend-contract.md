# AI Paper Plan-And-Select Backend Contract Plan

## Task

- Task id: `ai-paper-plan-and-select-backend-contract-2026-07-06`
- Branch: `codex/ai-paper-plan-and-select-backend-contract-2026-07-06`
- Goal packet: 1 of the post-recontract implementation packets.
- User approval: current user created the parent Goal and approved this first package on 2026-07-06.

## SSOT Read List

Read before source work:

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- current AI generation baseline evidence and audit.

## Scope

Implement the backend contract foundation for the new AI组卷 semantics:

- AI plan DTO;
- paper container DTO;
- role-aware source policy;
- platform formal question selector;
- enterprise published-training snapshot selector;
- duplicate removal;
- degradation and insufficiency categories.

This task must not wire UI, browser flows, Provider execution, DB runtime probes, schema, migration, seed, dependency, or staging/prod behavior.

## Implementation Approach

1. Add a contract file for plan, source, selected question, degradation, and paper container DTOs.
2. Add a pure service that accepts an AI assembly plan plus already loaded source candidates.
3. Enforce role source boundaries:
   - `personal_advanced_student`: authorized platform formal questions only.
   - `org_advanced_employee`: authorized platform formal questions plus same-organization enterprise snapshots.
   - `org_advanced_admin`: authorized platform formal questions plus same-organization enterprise snapshots.
   - `content_admin`: platform formal questions only.
4. Exclude AI-generated drafts and non-formal sources.
5. Select exact matches first, then parent-knowledge matches, then same scope matches.
6. Return insufficiency instead of inventing questions.
7. Keep output redaction safe: no full question text or answer bodies in evidence.

## TDD Plan

RED first in `src/server/services/ai-paper-plan-and-select-service.test.ts`:

- reject plan payloads that contain nested generated question bodies;
- personal learner uses only platform formal questions;
- organization roles include only same-organization enterprise snapshots;
- content admin uses platform formal questions only;
- degradation reports exact / nearby knowledge / same scope / insufficient categories;
- assembled paper container reports target count, actual count, source composition, sections, and match quality.

GREEN:

- implement only enough contract/service code for the RED cases.

## Risk Controls

- Do not change `package.json` or lockfiles.
- Do not change `src/db/schema/**`, `drizzle/**`, `migrations/**`, or `seed/**`.
- Do not read or write `.env*`.
- Do not execute Provider, browser, DB runtime, staging/prod, deploy, or Cost Calibration.
- If actual repository adapters require schema or runtime DB probing, stop and split.

## Validation

- `npm.cmd run test:unit -- src/server/services/ai-paper-plan-and-select-service.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `git diff --check`
- scoped Prettier check for changed files
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-plan-and-select-backend-contract-2026-07-06`
