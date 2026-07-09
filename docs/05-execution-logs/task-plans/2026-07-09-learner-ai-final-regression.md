# 2026-07-09 Learner AI Final Regression Plan

## Task

- Task id: `learner-ai-final-regression-2026-07-09`
- Branch: `codex/learner-ai-final-regression`
- Goal contribution: close out the approved learner AI repair sequence with local targeted regression and redacted evidence.
- Scope type: validation/evidence only; no production code changes.

## SSOT Read List

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Learner AI branch evidence written on 2026-07-09 for privacy, parameters, paper session container, server session questions, paper container history, and paper preview state.

## Boundaries

- No Provider execution.
- No browser screenshots, raw DOM, traces, storage reads, private credential files, env files, DB URLs, raw DB rows, or destructive DB operations.
- No package, lockfile, dependency, schema, migration, seed, staging, prod, deploy, Cost Calibration, PR, or force push.
- No production code changes in this branch.

## Validation Plan

1. Run focused learner AI regression unit suites covering UI, parameter validator, request/result history, result materialization, runtime bridge, learning sessions, and paper source resolver.
2. Run `typecheck`, `lint`, scoped prettier, and `git diff --check`.
3. Check localhost route availability using status-only HTTP checks, without capturing DOM, cookies, tokens, storage, credentials, or screenshots.
4. Run Module Run v2 pre-commit and pre-push readiness for evidence closeout.
5. Write redacted evidence/audit and close the goal only after master merge, push, short branch cleanup, and clean/aligned verification.

## Adversarial Review Focus

- Personal advanced user AI出题 and AI组卷 remain isolated self-practice, not formal practice/answer_record/mistake_book writes.
- Organization advanced employee AI组卷 may use enterprise visible sources but employee learner results remain employee-scoped.
- Organization administrators do not gain visibility into employee learner AI raw results.
- Content admin and organization admin AI generation/training flows are not modified by final regression.
