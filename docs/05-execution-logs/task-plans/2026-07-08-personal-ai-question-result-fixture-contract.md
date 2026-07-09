# Personal AI Question Result Fixture Contract Plan

## Scope

- Branch: `codex/personal-ai-question-result-fixture-contract`
- Task id: `personal-ai-question-result-fixture-contract-2026-07-08`
- Trigger: stage 5 regression found two learner AI question route unit assertions failing after the shared question-set contract was tightened.
- Allowed change: update the affected unit test fixture so synthetic Provider-success content includes the current redacted `question_set` contract fields.
- Out of scope: production code, API/DTO/service changes, DB/schema/migration/seed/fixture data, Provider execution, env/secret access, dependency/package/lockfile changes, browser/runtime acceptance.

## Required Reading

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/evidence/2026-07-08-org-ai-generation-parameter-contract.md`
- `src/server/contracts/ai-generation-task-spec-contract.ts`
- `src/server/services/route-integrated-provider-execution-service.ts`
- `src/server/services/personal-ai-generation-request-route.ts`
- `src/server/services/personal-ai-generation-request-route.test.ts`

## Root Cause

The current `question_set` structured preview validates requested question count plus request-aligned `questionType` and `difficulty`. Two old route tests still generated synthetic questions with only stem/options/answer aliases. That fixture no longer represents a valid Provider-success result for the current contract, so result materialization is correctly blocked.

## Implementation

1. Add a local test helper that emits redacted synthetic question-set content with `questionType`, `difficulty`, stem/options/answer aliases, analysis, and knowledge-node labels.
2. Replace the two stale inline question arrays in the personal AI question request route tests.
3. Keep the malformed-output test unchanged to preserve negative coverage.

## Validation

- Run the failing unit file.
- Run the stage 5 learner/employee regression group that exposed the failure.
- Run lint, typecheck, `git diff --check`, Module Run v2 precommit and prepush readiness.

## Risk Controls

- No production source changes.
- No Provider call; synthetic fixture only.
- No raw Provider payload, prompt, raw AI output, full question, full paper, full material, credentials, env values, internal ids, cookies, sessions, tokens, or DB rows in evidence.
- Keep the failed/malformed fixture as a counterexample so parser hardening is not weakened.
