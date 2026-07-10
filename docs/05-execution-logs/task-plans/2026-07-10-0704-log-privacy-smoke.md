# 2026-07-10 0704 Log Privacy Smoke Plan

## Task

- Task id: `0704-log-privacy-smoke-2026-07-10`
- Branch: `codex/0704-log-privacy-smoke`
- Type: validation-only targeted contract smoke with redacted evidence.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- Recent learner AI privacy, account readiness, audit/ai_call_log, and organization analytics evidence.
- Relevant log, workspace, and analytics contract tests.

## Scope

Validate that current local contracts preserve:

- admin `audit_log` / `ai_call_log` views as read-only redacted metadata;
- no raw prompt, raw Provider payload, raw model output, raw answer, session, token, cookie, or internal numeric id in admin log responses;
- organization analytics remains aggregate/summary-only and blocks standard org contexts;
- organization admins do not receive employee learner AI raw results, raw generated content, or raw employee answer text.

## Non-Goals

- No source, test, package, lockfile, schema, migration, seed, or dependency change.
- No Provider execution, AI generation submit, browser runtime, screenshot, raw DOM, dev server, direct DB connection, DB mutation, staging/prod/deploy, PR, or Cost Calibration.
- No credential value, session, token, env value, DB URL, raw DB row, internal id, Provider payload, raw prompt, raw AI output, full question/paper/material/resource/chunk, or raw employee answer in evidence.

## Validation Commands

- Redacted private catalog readiness preflight for 9 core roles.
- `corepack pnpm@10.26.1 exec vitest run tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts tests/unit/phase-11-audit-log-coverage-hardening.test.ts tests/unit/phase-11-ai-call-log-visibility-fix.test.ts src/server/services/audit-ai-call-log-reference-service.test.ts src/server/validators/audit-ai-call-log-reference.test.ts src/server/services/organization-analytics-service.test.ts src/server/contracts/organization-analytics-contract.test.ts src/server/services/organization-analytics-route.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts`
- `corepack pnpm@10.26.1 exec prettier --check --ignore-unknown <scoped docs>`
- `git diff --check`
- blocked-path diff guard.
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- Module Run v2 pre-commit hardening.
- Module Run v2 pre-push readiness with remote-ahead skip.

## Adversarial Review Focus

- Role boundary: `ops_admin`, `content_admin`, `org_standard_admin`, `org_advanced_admin`, and learner roles stay separated.
- Data boundary: organization analytics remains summary-only; employee raw answer and learner AI raw output stay blocked.
- Log boundary: `audit_log` and `ai_call_log` expose public references, status, counts, and summaries only.
- Evidence boundary: committed docs contain only role labels, route labels, status categories, and command results.
