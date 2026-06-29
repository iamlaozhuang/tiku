# Org Advanced Analytics DB Alignment Repair Plan

## Task

- Task id: `org-advanced-analytics-db-alignment-repair-2026-06-28`
- Branch: `codex/org-advanced-analytics-db-alignment-repair-20260628`
- Goal: repair the local-only `org_advanced_admin.organization_analytics` runtime summary load failure by aligning the
  missing organization training analytics source schema/data and any required source/test fixtures.
- Module run version: 2

## Materialized Approval

- Approval source: current user fresh-approved local-only DB/schema/test-owned data alignment for organization analytics
  runtime repair.
- Local scope: repository `D:\tiku`; localhost/127.0.0.1 Docker dev DB only.
- Allowed: inspect local schema/migration state; add or repair source/schema/migration/test-owned seed fixtures only if
  required for organization analytics runtime; run non-destructive local migration/seed against local dev DB; use
  test-owned synthetic organization training answer data only; focused unit, local runtime, and redacted browser checks.
- Forbidden: staging/prod/cloud/deploy, PR, force-push, release readiness/final Pass, Cost Calibration, Provider
  execution/configuration, production-like data, destructive DB drop/truncate/reset without separate fresh approval.

## Evidence Boundary

Allowed evidence: role labels, route labels, workflow/status labels, aggregate counts, table-presence counts, migration
status labels, command names, test counts, failure classes, and commit SHA.

Forbidden evidence: credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, connection
strings, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`, Provider
payloads, prompts, raw AI input/output, and complete question/paper/material/resource/chunk content.

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/**`
- `docs/01-requirements/traceability/2026-06-28-owner-facing-role-gap-capture-scope.md`
- `docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-runtime-summary-load-diagnostic.md`
- Relevant organization analytics source/schema/migration/test files discovered under the allowed read scope.

## Execution Steps

1. Confirm governance materialization with scoped formatting, diff, and pre-commit hardening.
2. Read code-taste, ADRs, mandatory owner-facing checklist, and prior diagnostic evidence.
3. Inspect organization analytics runtime source, schema definitions, migration history, and local Docker dev DB schema
   state using redacted aggregate/status evidence only.
4. Choose the smallest required repair: schema/migration/test-owned seed fixture alignment and/or source empty-state
   handling if the source table/data alignment proves insufficient.
5. Run only non-destructive local migration/seed actions if required and record status/count summaries only.
6. Validate with focused unit tests, relevant local runtime checks, and redacted browser verification for
   `/organization/organization-analytics`.
7. Update evidence/audit/acceptance, run Module Run v2 closeout gates, commit, fast-forward merge to `master`, push
   `origin/master`, and clean up the short branch.

## Risk Controls

- No Provider execution, Provider configuration, prompt payload, raw AI input, or raw AI output.
- No account credential/session/token/localStorage/Auth header evidence.
- No raw DB rows or internal IDs.
- No destructive DB operations.
- No dependency/package/lockfile changes unless a separate Stage E task is approved.
- No final Pass or release readiness claim.

## Current Status

- Plan materialized: pending validation.
- DB/source/browser execution: not started.
- Cost Calibration Gate remains blocked.
