# 2026-07-09 Learner AI Employee Privacy Boundary Plan

## Task

- Task id: `learner-ai-employee-privacy-boundary-2026-07-09`
- Branch: `codex/learner-ai-employee-privacy-boundary`
- Goal contribution: ensure organization advanced employees can only read and continue their own learner AI request, result, and learning-session source records while preserving organization ownership context.
- Scope type: source and targeted unit tests only.

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
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-01-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-acceptance-baseline-normalization.md`
- `docs/05-execution-logs/evidence/2026-07-02-ai-generation-goal-completion-audit.md`
- `docs/05-execution-logs/evidence/2026-07-08-personal-ai-question-result-fixture-contract.md`
- `docs/05-execution-logs/evidence/2026-07-09-content-ai-0704-final-role-regression.md`

## Boundaries

- No Provider execution.
- No browser automation, screenshots, raw DOM, traces, private credential files, env files, DB URLs, raw DB rows, or direct DB mutation.
- No package, lockfile, dependency, schema, migration, seed, staging, prod, deploy, Cost Calibration, PR, or force push.
- Evidence must use only file names, branch/task ids, status categories, command results, and redacted boundary descriptions.
- Do not change organization admin enterprise training, content admin AI adoption, or formal practice/answer_record/mistake_book writes.

## Implementation Plan

1. Add optional `actorPublicId` filters to personal AI request history and idempotent reuse lookups.
2. Pass the current user public id from the request route into request history count/list queries.
3. Add `actorPublicId` to personal AI result history/detail queries and repository gateways.
4. Filter persistent result list/count/detail through the linked `ai_generation_task.actor_public_id`.
5. Add `actorPublicId` to result creation lookup inputs so employee-owned result materialization cannot reuse another employee's task under the same organization owner.
6. Add `actorPublicId` to learning-session source result lookup and filter through the linked generation task before saving a session.
7. Add focused tests for:
   - employee request history query includes organization owner and current actor;
   - employee result history/detail query includes organization owner and current actor;
   - repository filters same-organization rows by actor;
   - learning-session save blocks a source result owned by the organization but created by a different actor.

## Validation

- `corepack pnpm@10.26.1 exec vitest run src/server/repositories/personal-ai-generation-request-repository.test.ts src/server/repositories/personal-ai-generation-result-repository.test.ts src/server/repositories/personal-ai-generation-learning-session-repository.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-learning-session-service.test.ts --reporter=dot`
- `corepack pnpm@10.26.1 lint`
- `corepack pnpm@10.26.1 typecheck`
- `git diff --check`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped files>`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId learner-ai-employee-privacy-boundary-2026-07-09`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId learner-ai-employee-privacy-boundary-2026-07-09 -SkipRemoteAheadCheck`

## Adversarial Review Focus

- Same-organization employee A cannot list, view, reuse, or start a session from employee B learner AI results.
- Personal users still only see their own learner AI records.
- Organization admins still do not gain employee raw learner AI result access.
- Organization ownership remains available for quota and enterprise source eligibility; only read/continue visibility is actor-isolated.
- Formal write boundaries remain blocked for `question`, `paper`, `practice`, `answer_record`, `exam_report`, and `mistake_book`.
- No sensitive material is added to tests, logs, evidence, or audit notes.
