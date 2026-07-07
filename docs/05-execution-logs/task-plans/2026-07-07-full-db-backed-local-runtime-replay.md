# Full DB-backed local runtime replay task plan

## Task metadata

- Task id: `full-db-backed-local-runtime-replay-2026-07-07`
- Branch: `codex/full-db-backed-local-runtime-replay-2026-07-07`
- Scope: local 0704 DB-backed runtime replay only.
- Non-goals: Provider-enabled calls, browser replay, staging/prod/deploy, schema migration, seed scripts, destructive DB operation, Cost Calibration, release readiness, production usability.

## Read gate

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-phase4-requirements-agent-baseline-alignment.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- Latest local runtime evidence:
  - `docs/05-execution-logs/evidence/2026-07-06-ai-generation-db-backed-local-runtime-replay.md`
  - `docs/05-execution-logs/evidence/2026-07-06-0704-local-db-backed-replay-after-clean-migration-baseline.md`
  - `docs/05-execution-logs/evidence/2026-07-06-0704-local-org-enterprise-fixture-materialization-replay.md`
  - `docs/05-execution-logs/evidence/2026-07-07-post-recontract-local-adversarial-acceptance-consolidation.md`

## Replay target

Use the configured local 0704 DB and localhost-compatible server contracts only. Re-run the DB-backed runtime slices that determine whether the previous `dbBackedRuntime: partial` can be tightened:

1. AI组卷 plan/select source availability:
   - `personal_advanced_student`: authorized platform question source.
   - `org_advanced_employee`: authorized platform question source plus published organization training snapshot question source.
   - `org_advanced_admin`: authorized platform question source plus published organization training snapshot question source.
   - `content_admin`: platform question source.
2. Learning-session materialization:
   - paper assembly container to learning session.
   - answer submission.
   - progress/readback.
3. Organization training runtime:
   - admin draft or persisted version availability.
   - publish/visible-list/employee answer/readonly summary, where the local fixture supports non-destructive replay.
4. Content admin runtime:
   - AI result or assembled paper output remains draft/review-oriented and does not directly publish formal content.

## Evidence rules

Record only aggregate states, command status, role labels, workflow stages, safe counts, safe error codes, and safe failure categories. Do not record credentials, tokens, sessions, cookies, env values, connection strings, raw DB rows, internal ids, Provider payloads, raw prompts, raw AI outputs, full question/paper/material/resource/chunk content, employee raw answers, screenshots, DOM, traces, or private fixture values.

## Validation

- `npm.cmd run lint`
- `npm.cmd run typecheck`
- Focused unit/source gate for AI paper/source/session/organization training contracts.
- Local DB-backed replay harness with redacted output.
- `git diff --check`
- Scoped Prettier check for changed docs/state files.
- Module Run v2 pre-commit hardening.
- After merge to `master`: Module Run v2 pre-push readiness.

## Adversarial checks

- Do not reuse old evidence as this task's conclusion.
- Treat any unsupported extrapolation as partial.
- If the harness cannot prove a closed loop against local 0704 DB, keep that bucket partial and record the gap.
- If a code defect is found, stop this replay branch and open a separate fix branch before changing code.
