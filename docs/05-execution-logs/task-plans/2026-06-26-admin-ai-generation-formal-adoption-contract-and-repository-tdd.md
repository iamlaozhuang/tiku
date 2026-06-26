# Admin AI generation formal adoption contract and repository TDD

Task id: `admin-ai-generation-formal-adoption-contract-and-repository-tdd-2026-06-26`

## Fresh approval

- Approval source: current user message, `批准并开：admin-ai-generation-formal-adoption-contract-and-repository-tdd-2026-06-26`.
- Approval scope: contract, model, repository port, and focused unit tests for explicit backend admin AI generated-result adoption planning.
- Not approved in this task: live DB adoption mutation, schema or migration changes, route integration, browser/runtime smoke, Provider call, credential access, staging/prod/deployment/release readiness, payment, or external-service work.

## Required reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/advanced-edition/stories/epic-07-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/01-requirements/traceability/2026-06-24-role-separated-mvp-requirement-alignment.md`
- `docs/05-execution-logs/acceptance/2026-06-26-formal-question-paper-adoption-approval-package.md`
- `docs/05-execution-logs/acceptance/2026-06-26-provider-cost-gate-closeout-review.md`

## Implementation plan

1. Add focused RED tests for a backend admin AI formal adoption repository contract.
2. Add a small model/contract surface for explicit reviewed adoption commands and redacted adoption DTOs.
3. Add a repository factory over a gateway port that:
   - accepts only explicit reviewer-confirmed adoption commands;
   - allows content workspace platform generated results to enter a formal adoption plan;
   - blocks automatic Provider-to-formal-content writes;
   - blocks organization workspace results from platform formal adoption, preserving a separate organization-scoped decision boundary;
   - preserves provenance to generated result, task, and request public ids;
   - deduplicates by generated result and target type;
   - returns redacted metadata only and no raw prompt, raw output, payload, secret, token, cookie, Authorization header, internal id, or formal content body.
4. Keep all DB schema, migration, live DB adapter, route integration, and browser smoke work out of scope.
5. Record evidence and audit review after local validation.

## Allowed files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md`
- `src/server/models/admin-ai-generation-formal-adoption.ts`
- `src/server/contracts/admin-ai-generation-formal-adoption-contract.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.ts`
- `src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`

## Blocked files and actions

- `.env*`
- `package.json`, package lockfiles
- `src/db/schema/**`
- `drizzle/**`
- `e2e/**`
- `playwright-report/**`, `test-results/**`, `.next/**`
- live database connection, seed, migration, route smoke, Provider call, credential access, staging/prod/deploy/payment/external-service work, Cost Calibration, final Pass declaration

## Validation commands

- `npm.cmd run test:unit -- src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-contract-and-repository-tdd.md src/server/models/admin-ai-generation-formal-adoption.ts src/server/contracts/admin-ai-generation-formal-adoption-contract.ts src/server/repositories/admin-ai-generation-formal-adoption-repository.ts src/server/repositories/admin-ai-generation-formal-adoption-repository.test.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-adoption-contract-and-repository-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-adoption-contract-and-repository-tdd-2026-06-26 -SkipRemoteAheadCheck`

## Risk controls

- No schema/migration or live DB adapter is introduced; repository behavior is port-level TDD.
- The adoption DTO uses public ids only and keeps formal target ids `null` until a separately approved live DB adoption task exists.
- Organization workspace adoption is explicitly separated from platform formal adoption and remains blocked here.
- Evidence must summarize commands and outcomes only; no generated raw content or provider payload is recorded.
