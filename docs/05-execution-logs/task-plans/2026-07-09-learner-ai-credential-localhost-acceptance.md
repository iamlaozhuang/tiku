# 2026-07-09 Learner AI Credential Localhost Acceptance Plan

## Task

- Task id: `learner-ai-credential-localhost-acceptance-2026-07-09`
- Branch: `codex/learner-ai-credential-localhost-acceptance`
- Scope type: validation-only credential-in-memory localhost acceptance.
- Closure rule: do not assume repair. If a current real blocker is reproduced, stop after redacted evidence and open a separate `codex/*` repair branch.

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
- Latest 2026-07-09 learner AI localhost acceptance evidence and audit.

## Boundaries

- Localhost / `127.0.0.1` only.
- Private 0704 credential files may be read in memory only; no values may be printed, committed, logged in evidence, or copied into repository files.
- No Provider execution and no AI generation submit action.
- No screenshots, traces, raw DOM, browser storage capture, cookies, tokens, sessions, Authorization headers, credential values, request bodies, or response bodies in evidence.
- No direct DB connection, DB mutation, destructive DB operation, env read, schema, migration, seed, package, lockfile, dependency, staging/prod/deploy, PR, force push, or Cost Calibration.
- No source or test code changes in this validation branch.

## Validation Plan

1. Read role credentials from `D:/tiku-local-private/acceptance` in memory only.
2. Login through `/api/v1/sessions` for the target roles and retain session cookies in process memory only.
3. Probe learner AI and organization admin boundaries with status/body-shape-only checks:
   - `personal_advanced_student` can reach learner `AI训练` route and learner AI history APIs.
   - `org_advanced_employee` can reach learner `AI训练` route and learner AI history APIs under organization context.
   - `personal_standard_student` and `org_standard_employee` do not receive usable advanced learner AI access.
   - `org_advanced_admin` cannot access employee learner AI raw result APIs through learner endpoints.
4. Record only role labels, route labels, HTTP status categories, and boolean conclusions.
5. Run focused learner AI regression, `typecheck`, `lint`, scoped prettier, `git diff --check`, and Module Run v2 gates.

## Adversarial Review Focus

- Do not confuse credential-backed login proof with Provider-enabled generation proof.
- Do not treat standard role upgrade guidance as advanced capability access.
- Do not record or infer employee raw learner AI content for organization administrators.
- Do not downgrade credential-backed role checks to fixture-only coverage.
- Do not claim production readiness or final acceptance beyond this bounded localhost validation.
