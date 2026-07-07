# 2026-07-06 AI Generation DB-backed Local Runtime Replay Plan

## Task

- Task id: `ai-generation-db-backed-local-runtime-replay-2026-07-06`
- Branch: `codex/ai-generation-db-backed-local-runtime-replay-2026-07-06`
- Approval boundary: user approved `DB-backed local runtime replay` on 2026-07-06.
- Objective: replay the post-recontract AI出题 / AI组卷 local runtime contract against localhost/local DB, using redacted evidence and adversarial checks.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest AI generation final rollup, DB/Provider decision, runtime residual, and post-fix runtime evidence.

## Scope

Replay only local product runtime behavior:

- `personal_advanced_student`: AI出题 and AI组卷 generation result handoff toward learning session.
- `org_advanced_employee`: AI出题 and AI组卷 generation result handoff toward employee learning session.
- `org_advanced_admin`: AI出题 to enterprise training draft; AI组卷 to enterprise training paper draft.
- `content_admin`: AI出题 to reviewable question draft; AI组卷 to reviewable paper draft.

If normal localhost submission would require live Provider execution, the replay will use a controlled local executor through existing dependency-injection seams to exercise route/service/repository persistence. This validates DB-backed product wiring, not Provider behavior.

## Hard Boundaries

- No Provider-enabled smoke.
- No env/secret inspection or mutation.
- No raw Provider payload, raw prompt, raw AI output, full generated content, full question, answer, paper, material, resource, chunk, private fixture, DB row, internal id, credential, session, cookie, token, or header in evidence.
- No schema migration, seed, destructive DB action, package or lockfile change, dependency change, staging/prod/deploy, release readiness claim, production usability claim, or Cost Calibration.
- If a confirmed source defect is found, stop this replay and open a separate fix branch.

## Replay Strategy

1. Confirm branch/worktree state and localhost availability.
2. Run source health gates that do not require Provider or schema changes.
3. Execute DB-backed replay with controlled local AI output categories:
   - route accepts role/workspace/generation parameters;
   - structured preview is accepted;
   - DB-backed persistence occurs through real repositories;
   - AI组卷 uses plan-and-select local source resolution from formal question sources;
   - learning/training/review handoff exposes a redacted next-step status.
4. Record only aggregate role labels, route/workflow labels, stage status, count categories, and safe error categories.
5. Run scoped formatting/checks and Module Run v2 pre-commit hardening.

## Adversarial Checks

- A passed unit test or old evidence alone cannot close this task.
- A Provider-disabled block cannot be reclassified as DB-backed pass.
- Local controlled executor pass cannot be extrapolated to Provider-enabled pass.
- DB-backed replay cannot claim release readiness, production usability, staging/prod readiness, or Cost Calibration.
- Any missing local DB fixture, insufficient formal question source, route mismatch, or persistence failure must be recorded as `partial` or `blocked`.

## Planned Deliverables

- Redacted evidence: `docs/05-execution-logs/evidence/2026-07-06-ai-generation-db-backed-local-runtime-replay.md`
- Adversarial audit: `docs/05-execution-logs/audits-reviews/2026-07-06-ai-generation-db-backed-local-runtime-replay.md`
- State/queue update for the task.
- Local commit only if validation passes. Merge/push/cleanup require separate approval.
