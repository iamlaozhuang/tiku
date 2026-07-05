# 2026-07-04 Full-Chain Scenario 11 DB Target Alignment Provisioning Plan

Status: closed with pass

## Task

- Task id: `full-chain-scenario-11-db-target-alignment-provisioning-2026-07-04`
- Branch: `codex/full-chain-scenario-11-db-target-alignment-provisioning-2026-07-04`
- Target DB label: `tiku_full_chain_acceptance_20260704_001`
- Restart node after closeout: `s11_browser_login_advanced_employee_learning_and_enterprise_training_boundary`

## Read Gate

Read before task materialization:

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-db-selector-and-provisioning-approval.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-runbook-and-stop-rules.md`
- `docs/05-execution-logs/acceptance/2026-07-04-full-chain-acceptance-account-provisioning-order.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-isolated-db-bootstrap-seed-execution.md`
- `docs/05-execution-logs/evidence/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun.md`
- `docs/05-execution-logs/audits-reviews/2026-07-04-full-chain-scenario-11-advanced-employee-affected-node-rerun.md`
- `src/server/repositories/runtime-database.ts`

## Boundary

This task only provisions and proves a process-scoped runtime DB target alignment path for the next S11 affected-node
rerun. It may read `.env.local` in process memory only to construct the local connection alias, then override
`DATABASE_URL` in that process before any app runtime starts. It must not write `.env*`, source, tests, schema,
migration, seed, dependency, private fixture, runtime, browser, Provider, staging/prod, Cost, or release-readiness files.

## Execution Plan

1. Align `project-state.yaml`, `task-queue.yaml`, plan, evidence, and audit to this provisioning task.
2. Run a redacted process-scoped DB target probe:
   - read `.env.local` in process memory only;
   - confirm the existing host label is local/loopback;
   - construct a target alias for `tiku_full_chain_acceptance_20260704_001`;
   - set `DATABASE_URL` in process memory only;
   - connect read-only and verify the target label matches without printing connection details.
3. Record only DB target label, command label, pass/block, and counts.
4. Run scoped Prettier, whitespace, blocked-path diff, Module Run v2 pre-commit, and pre-push readiness.
5. Commit, fast-forward merge to `master`, push `origin/master`, delete the short branch, then rerun S11 from the
   affected node.

## Stop Rules

Stop and split if `.env.local` is missing, the parsed runtime host is not local/loopback, the process-scoped target alias
cannot be constructed, the target DB label does not match, read-only DB probe fails, any `.env*` write is needed, product
source/test/schema/migration/seed/dependency changes are needed, browser/runtime is needed, Provider/staging/prod/Cost is
needed, destructive DB action is needed, or any redaction boundary is at risk.

## Evidence Rules

Allowed: task id, branch, DB target label, selector/scope labels, aggregate counts, command name, pass/fail/block, and
redacted summary.

Forbidden: credentials, phone, email, password, connection string, token, session, cookie, localStorage, Authorization
header, raw DB rows, internal ids, screenshots, raw DOM, traces, Provider payload, raw Prompt, raw AI I/O, complete
material/question/paper/resource/chunk content, private fixture contents, employee answers, plaintext card values, and
raw `.env*` values.

## Current Status

Target probe passed using a process-scoped override. The first strict parser attempt stopped before alias construction
because it required the key at column 1; the corrected parser accepted the existing key shape, constructed the target
alias in memory, and verified the target DB label with a read-only probe. Closeout gates passed after repository
checkpoint alignment.
