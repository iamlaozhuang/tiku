# formal publish local execution for one draft paper

## Task

- Task id: `formal-publish-local-execution-one-draft-paper-2026-06-27`
- Branch: `codex/formal-publish-local-execution-20260627`
- Approval source: current user serial batch request on 2026-06-27.

## Scope

- Execute one local formal publish flow against a named draft paper.
- If no publishable existing draft is available, create the target draft by copying a named already-published local sample paper through the application service.
- Execute at most one `publishPaper` service call on that copied draft.
- Immediately archive the copied paper as the rollback/cleanup strategy.
- Record redacted evidence: public ids, statuses, counts, command pass/fail, and final archive state only.

## Target selection

- Existing local draft preflight found 5 draft papers, each with 0 questions; these are not publishable and will not be used for the publish call.
- Source local published sample: `paper-de7955bc-d827-4b23-bbf6-8bae5e14fe6b`.
- Content admin actor: `admin-dev-super-admin`.
- Target draft: created by application-service copy from the source sample, then published once, then archived.

## Explicit non-scope

- No source, test, e2e, script, schema, drizzle, package, lockfile, or env file edit.
- No Provider call, Provider credential read, Cost Calibration, staging/prod, deployment, payment, external service, PR, force push, release readiness, or final Pass claim.
- No browser/e2e/dev-server runtime and no student-visible runtime verification.
- No raw paper content, prompt, answer, Provider payload, credentials, tokens, database URL, or env contents in evidence.

## Validation plan

1. Record local DB preflight with redacted identifiers and publishable-draft decision.
2. Execute application-service copy, exactly one publish call, and archive rollback against local Docker dev DB.
3. Verify final copied paper status is archived.
4. Scoped Prettier write/check over docs/state/evidence/audit files.
5. `git diff --check`.
6. Module Run v2 pre-commit hardening, project status diagnostic, and pre-push readiness.
