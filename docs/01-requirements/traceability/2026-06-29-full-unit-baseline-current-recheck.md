# Full Unit Baseline Current Recheck Traceability

- Task id: `full-unit-baseline-current-recheck-2026-06-29`
- Branch: `codex/full-unit-current-recheck-20260629`
- Status: in progress
- Date: `2026-06-29`

## Objective

Re-prove the current `master` full unit baseline after the latest organization analytics local repair closeout. This is
a local-only quality gate for the durable goal: full acceptance matrix plus full unit baseline repair.

This task does not claim the full acceptance matrix is complete. The durable goal remains incomplete until every
applicable owner-facing role/workflow/function row in
`docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md` has redacted pass evidence or an
approved blocked-gate record.

## Source Of Truth Read Before Execution

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/01-requirements/traceability/2026-06-28-full-acceptance-matrix-unit-baseline-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-full-unit-baseline-current-recheck-and-repair.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-db-alignment-repair.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`

## Requirement Mapping

| Requirement                                                                | Current task coverage                                                                                                  |
| -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Full unit baseline must be green before continuing acceptance runtime work | Run `npm.cmd run test:unit` against the current repository state.                                                      |
| Full unit repair must be durable after latest closeout                     | Recheck after `org-advanced-analytics-db-alignment-repair-2026-06-28` was merged and pushed.                           |
| If unit baseline is red, repair narrowly                                   | Source/test changes are allowed only after current full unit recheck fails and only in the materialized allowed files. |
| Owner-facing role checklist remains mandatory                              | No role row is closed here; later acceptance tasks must re-read the checklist and map coverage back to it.             |
| Evidence must stay redacted                                                | Evidence records command/status/test-count/failure-class/commit summary only.                                          |

## Boundaries

Allowed execution:

- Local repository only: `D:\tiku`.
- Full unit command: `npm.cmd run test:unit`.
- Focused unit reruns only if a failure is produced.
- Local lint/typecheck/format/diff and Module Run v2 closeout gates.
- Local commit, fast-forward merge to `master`, push `origin/master`, and short-branch cleanup after gates pass.

Blocked without fresh approval:

- Browser, Playwright, dev server, e2e, screenshots, traces, raw DOM.
- DB connection/read/write, schema/migration/seed, destructive operations, `drizzle-kit push`.
- AI/Provider execution, Provider config/credential read, prompt/payload/raw AI input/output.
- Package or lockfile changes.
- Env/secret reads or edits.
- `D:\tiku-local-private` account/fixture reads.
- Staging/prod/cloud/deploy, payment, OCR, export, external service.
- PR, force-push, release readiness, final Pass, Cost Calibration Gate.

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/task-plans/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/evidence/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/audits-reviews/2026-06-29-full-unit-baseline-current-recheck.md`
- `docs/05-execution-logs/acceptance/2026-06-29-full-unit-baseline-current-recheck.md`
- `src/app/**`, `src/components/**`, `src/features/**`, `src/hooks/**`, `src/lib/**`, `src/server/**`, `tests/unit/**`
  only if the current full unit recheck fails.

## Blocked Files

- `.env*`
- `package.json`, `package-lock.yaml`, `package-lock.json`, `pnpm-lock.yaml`
- `src/db/schema/**`, `drizzle/**`, `migrations/**`, `seed/**`, `scripts/**`
- `e2e/**`, `playwright-report/**`, `test-results/**`, `.next/**`
- `D:/tiku-local-private/**`, `D:\tiku-local-private\**`

## Evidence Redaction

Allowed evidence:

- command name
- pass/fail status
- test file count and test count
- redacted failure class
- redacted assertion summary
- commit SHA and branch summary

Forbidden evidence:

- credentials, cookies, tokens, sessions, localStorage, Authorization headers
- env contents, connection strings, secrets, API keys
- raw DB rows, internal ids, email, phone, plaintext `redeem_code`
- raw DOM, screenshots, traces, HTML reports
- Provider payloads, prompts, raw AI input/output
- complete question, paper, material, resource, chunk, answer, or employee subjective answer content

## Completion Rule

This task is complete only when the current full unit baseline is green, validation evidence is recorded, Module Run v2
closeout/pre-push gates pass, and the task is committed, fast-forward merged to `master`, pushed to `origin/master`, and
the short branch is cleaned up. This task still cannot claim final Pass for the durable goal.
