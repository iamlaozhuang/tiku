# AI Paper Source Adapters Plan

## Task

- Task id: `ai-paper-source-adapters-2026-07-06`
- Branch: `codex/ai-paper-source-adapters-2026-07-06`
- Goal packet: package 2 of the post-recontract implementation chain.
- Base: stacked on `codex/ai-paper-plan-and-select-backend-contract-2026-07-06` because package 1 is locally committed but not yet merged to `master`.

## SSOT Read List

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/modules/02-question-paper.md`

## Scope

Implement pure adapter helpers that convert existing local read models into package-1 `AiPaperSelectableQuestionDto` candidates:

- platform formal question rows from `QuestionAccessRow`;
- enterprise question-bank v1 snapshots from published organization training versions;
- redacted metadata-only outputs for selector input.

This package must not:

- execute DB runtime;
- add repository SQL;
- wire routes, Provider, or UI;
- change schema, migration, seed, package, lockfile, env, staging/prod, deploy, or Cost Calibration behavior.

## TDD Plan

RED first in `src/server/services/ai-paper-source-adapter-service.test.ts`:

- platform adapter maps only `question.status = available` rows into `platform_formal_question` candidates;
- platform adapter drops stem, answer, analysis, options, scoring points, and internal ids from output;
- enterprise adapter maps only same-organization `status = published` and not taken-down training version snapshots into `enterprise_training_snapshot` candidates;
- enterprise adapter drops full training question body, answer, analysis, material content, and internal ids from output;
- unsupported enterprise snapshot question types are skipped because organization training v1 only supports a subset.

GREEN:

- add `src/server/services/ai-paper-source-adapter-service.ts`;
- add minimal exported functions with explicit source metadata and redaction-safe outputs.

## Risk Controls

- Use existing model and contract types only.
- No DB connection or repository calls.
- No Provider execution.
- No source text, answer text, material body, raw generated output, prompt, payload, or private fixture in evidence.
- If source snapshots lack knowledge-node or difficulty metadata, map missing values to empty arrays or `null` and record the limitation for later repository/metadata enrichment.

## Validation

- `npm.cmd run test:unit -- src/server/services/ai-paper-source-adapter-service.test.ts src/server/services/ai-paper-plan-and-select-service.test.ts`
- `npm.cmd run typecheck`
- `npm.cmd run lint`
- `git diff --check`
- scoped Prettier check for changed files
- `Test-ModuleRunV2PreCommitHardening.ps1 -TaskId ai-paper-source-adapters-2026-07-06`
