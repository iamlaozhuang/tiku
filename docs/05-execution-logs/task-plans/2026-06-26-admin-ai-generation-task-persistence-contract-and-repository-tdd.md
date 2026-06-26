# Admin AI Generation Task Persistence Contract And Repository TDD Plan

Task id: `admin-ai-generation-task-persistence-contract-and-repository-tdd-2026-06-26`

## Scope

Add a local source TDD task for the admin AI generation task persistence contract and repository port.

Allowed implementation:

- Define a redacted admin AI generation task persistence contract for accepted admin local contracts.
- Add a repository over an injected fake gateway that can create or reuse pending admin AI generation task metadata.
- Preserve platform ownership for content admin and organization ownership for organization advanced admin.
- Keep result metadata server-owned: `resultPublicId: null`, `evidenceStatus: none`, `citationCount: 0`, and no `aiCallLogPublicId`.

Blocked implementation:

- No real DB adapter, connection, write, seed, schema, or migration.
- No Provider call, Provider configuration read, env/secret access, Cost Calibration, or credential read.
- No formal `question` or `paper` write.
- No package/lockfile change, browser/e2e/dev-server, staging/prod, payment, external service, PR, force push, release readiness, or final Pass claim.

## Read Governance

- `AGENTS.md`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`
- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`

## TDD Plan

1. RED: add a focused repository unit test that imports the not-yet-implemented admin persistence contract/repository.
2. GREEN: add the minimal contract and repository port to satisfy the focused tests.
3. REFACTOR: align naming and redaction shape with existing personal AI generation repository patterns.
4. Verify with focused unit, lint, typecheck, scoped prettier, `git diff --check`, and Module Run v2 gates.

## Risk Controls

- The repository is gateway-injected and does not import `src/db/schema`.
- Persistence input records admin owner, quota owner, idempotency, runtime bridge boundary, and formal content boundary only.
- Unsafe local contracts are rejected before gateway calls if Provider execution, env/secret access, Cost Calibration, or formal write status is detected.
- Existing `ai_generation_task` schema compatibility is not asserted by this task; DB adapter/schema mapping remains a follow-up decision.
