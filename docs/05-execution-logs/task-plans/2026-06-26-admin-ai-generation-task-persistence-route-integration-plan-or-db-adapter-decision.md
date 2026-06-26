# Admin AI Generation Task Persistence Route Integration Plan Or DB Adapter Decision Plan

Task id: `admin-ai-generation-task-persistence-route-integration-plan-or-db-adapter-decision`

## SSOT Read List

- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Admin AI generation must create trackable tasks and redacted operational evidence.
- Organization admin output is organization-owned and must not write platform formal `question` or `paper`.
- Content admin output stays in platform content operations review domain until governed adoption.
- Task evidence must not expose provider payloads, prompts, secrets, tokens, or raw generated content.
- Provider, env/secret, Cost Calibration, staging/prod, payment, and external service remain blocked.

## Requirement Mapping

- AI task tracking maps to `modules/02-ai-task-domain.md`.
- Organization admin AI ownership and formal content separation map to `modules/08-organization-ai-generation.md` and the 2026-06-23 scope clarification.
- This task is docs-only; it does not claim runtime behavior or DB persistence.

## Evidence-Only Sources

- `docs/05-execution-logs/acceptance/2026-06-26-admin-ai-generation-runtime-bridge-and-persistence-plan.md`
- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-task-persistence-contract-and-repository-tdd.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-task-persistence-contract-and-repository-tdd.md`
- Static source read of current admin AI local route, persistence contract/repository port, personal AI repository, and `ai_generation_task` schema.

## Conflict Check

No SSOT conflict found. Requirements ask for trackable tasks; prior source task added only a gateway-injected repository
port. Current schema and route implementation do not yet prove durable admin task persistence.

## Scope

Allowed:

- Decide the next implementation path.
- Record a docs-only decision package and seed the next recommended task.
- Update `project-state.yaml`, `task-queue.yaml`, evidence, and audit review.

Blocked:

- No source, tests, DB schema, migration, seed, package/lockfile, env, script, or e2e changes.
- No database connection or write.
- No Provider call or Provider configuration.
- No formal `question` or `paper` write.
- No staging/prod, payment, external-service, release readiness, or final Pass claim.

## Decision Approach

Compare two candidate paths:

1. Wire route to fake/local persistence now.
2. First prepare approval for real `ai_generation_task` DB adapter and schema mapping.

Decision criteria:

- whether the path creates durable, reviewable task tracking;
- whether it avoids misleading product behavior;
- whether it preserves redaction and formal content boundaries;
- whether existing schema can represent the current repository port without lossy mapping.

## Validation

- Scoped prettier write/check for changed docs/state files.
- `git diff --check`.
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness with remote ahead check skipped before push.
