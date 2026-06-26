# Admin AI Generation Shared Runtime Bridge Contract TDD Plan

Task ID: `admin-ai-generation-shared-runtime-bridge-contract-tdd-2026-06-26`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Advanced AI task domain requires trackable tasks and redacted operational evidence without exposing prompt, Provider payload, secret, token, or raw AI output.
- Organization AI generation requires organization-owned generated output to remain separate from platform formal `question`, `paper`, `practice`, `mock_exam`, `exam_report`, and `mistake_book`.
- Advanced AI generation scope clarification requires content admin output to remain in an isolated review domain until governed formal adoption.
- The previous runtime bridge decision selected a shared Provider execution core plus admin-specific runtime bridge adapter, and rejected direct personal Provider bridge reuse.

## Requirement Mapping

- This task creates only contracts, shared Provider execution primitives, admin adapter logic, and focused unit tests.
- Default admin runtime bridge behavior remains provider-disabled.
- The task does not create formal `question` or `paper` records and does not approve formal adoption.
- The task does not perform Provider calls, credential reads, cost calibration, route smoke, live DB work, staging/prod, payment, external service, deployment, or release readiness.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-diagnostic-or-integration-plan.md`
- Existing source tests around personal route-integrated Provider execution and runtime bridge behavior.

## Conflict Check

No conflict found. Requirements allow admin AI generation task tracking and redacted evidence, while explicitly blocking Provider execution and formal content adoption. The previous decision package supplies the architecture direction for this implementation task.

## Scope

Allowed files:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-shared-runtime-bridge-contract-tdd.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-shared-runtime-bridge-contract-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-shared-runtime-bridge-contract-tdd.md`
- `src/server/contracts/route-integrated-provider-execution-contract.ts`
- `src/server/services/route-integrated-provider-execution-service.ts`
- `src/server/services/route-integrated-provider-execution-service.test.ts`
- `src/server/contracts/admin-ai-generation-runtime-bridge-contract.ts`
- `src/server/services/admin-ai-generation-runtime-bridge-service.ts`
- `src/server/services/admin-ai-generation-runtime-bridge-service.test.ts`
- `src/server/services/personal-ai-generation-route-integrated-provider-execution-service.ts`

Blocked files and actions:

- DB/schema/migration/seed files.
- Package/lockfile/env files.
- Provider credential reads, Provider calls, cost calibration, route smoke, browser smoke, live DB connections, account mutation, staging/prod, payment, external-service, deployment, release readiness, and formal question/paper writes.

## TDD Plan

1. RED: add focused tests for shared Provider execution primitives: default blocked outcome, redaction summary guard, metadata/limits.
2. RED: add focused tests for admin runtime bridge adapter: maps admin content/org context, defaults to provider-disabled, preserves redaction, and does not execute Provider/env/cost paths.
3. GREEN: introduce shared Provider execution contract/service and admin runtime bridge contract/service.
4. GREEN: refactor the personal route-integrated Provider service to use shared primitive types/functions while preserving existing tests.
5. REFACTOR: keep names explicit, avoid direct admin import of personal runtime bridge, and avoid route wiring in this task.

## Validation Commands

- `npx.cmd vitest run src/server/services/route-integrated-provider-execution-service.test.ts src/server/services/admin-ai-generation-runtime-bridge-service.test.ts src/server/services/personal-ai-generation-route-integrated-provider-execution-service.test.ts src/server/services/personal-ai-generation-runtime-bridge-service.test.ts`
- `npm run typecheck`
- `npm run lint`
- `npx.cmd prettier --write --ignore-unknown <changed-files>`
- `npx.cmd prettier --check --ignore-unknown <changed-files>`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-shared-runtime-bridge-contract-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-shared-runtime-bridge-contract-tdd-2026-06-26 -SkipRemoteAheadCheck`

## Stop Conditions

Stop before continuing if implementation requires Provider credentials, real Provider execution, env edits, schema/migration changes, route smoke, live DB access, formal generated content adoption, staging/prod, payment, external-service, deployment, or release readiness work.
