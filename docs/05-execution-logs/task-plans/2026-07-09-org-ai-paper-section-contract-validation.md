# 2026-07-09 Organization AI Paper Section Contract Validation Task Plan

## Scope

- Branch: `codex/org-ai-paper-section-contract-validation`
- Goal: strengthen AI组卷 section-level validation so `questionTypeDistribution` and `paperStructure` cannot pass only by matching top-level fields.
- In scope files:
  - `src/server/services/route-integrated-provider-execution-service.ts`
  - `src/server/services/route-integrated-provider-execution-service.test.ts`
  - `src/server/services/ai-paper-route-assembly-service.ts`
  - `src/server/services/ai-paper-route-assembly-service.test.ts`
  - `src/server/services/admin-ai-generation-local-contract-route.test.ts`
  - `docs/04-agent-system/state/project-state.yaml`
- Out of scope: Provider execution, prompt/payload logging, DB connection or mutation, DB/schema/migration/seed/fixture, dependency/package/lockfile, organization training publish logic, UI, browser runtime, staging/prod/deploy, Cost Calibration.

## SSOT Read List

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
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-generation-parameter-contract.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-paper-to-training-draft.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-training-loop-regression.md`

## Implementation Plan

1. Add RED tests for paper structured preview and route plan assembly:
   - a balanced distribution whose section counts do not match the expected ratio must fail;
   - `paperStructure = by_question_type` must require homogeneous question type sections;
   - `paperStructure = by_knowledge_node` must require explicit per-section knowledge-node coverage;
   - route assembly must reject the same invalid plans before local selection.
2. Implement minimal pure validation helpers in the existing AI paper plan/preview services.
3. Adjust the existing local-contract fake Provider test fixture so it produces section-valid paper plans under the stricter contract.
4. Keep failure categories within the existing contract where possible: `question_type_distribution_mismatch`, `paper_structure_mismatch`, or `invalid_plan_shape`.
5. Run targeted tests, adjacent AI paper tests, local-contract regression, typecheck, lint, diff check, Module Run v2 precommit and prepush checks.
6. Write redacted evidence and adversarial audit.

## Risk Controls

- No new dependencies.
- No schema or migration.
- No Provider call and no env/secret read.
- No raw prompt, raw AI output, Provider payload, raw DB rows, internal ids, full question/paper/material/resource/chunk content in evidence.
- No change to selected question source policy or organization training publish semantics.

## Requirement Mapping Result

- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md` requires AI组卷 to be a plan-only contract with local selection from allowed formal sources.
- This task strengthens the contract validation for that plan before local selection.
- Standard role denial, formal content separation, and organization training publish boundaries remain unchanged.
