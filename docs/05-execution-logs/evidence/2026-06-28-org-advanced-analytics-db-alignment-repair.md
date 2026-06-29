# Org Advanced Analytics DB Alignment Repair Evidence

## Status

- Task: `org-advanced-analytics-db-alignment-repair-2026-06-28`
- Branch: `codex/org-advanced-analytics-db-alignment-repair-20260628`
- Status: in progress
- Result: pass
- Scoped row: `org_advanced_admin.organization_analytics`
- Pre-task master checkpoint: `84d7a006843e84446b487fd0108183de695aaed9`
- Batch range: single task, `org-advanced-analytics-db-alignment-repair-2026-06-28`
- Commit: pending

## Boundary Confirmation

- Approval materialized before DB/source/browser execution: pass.
- Code-taste, ADR, mandatory owner-facing checklist, and prior diagnostic evidence read: pass.
- Local repository only: `D:\tiku`.
- Local DB only: localhost/127.0.0.1 Docker dev database.
- DB/source/browser execution started: true.
- Provider/config/prompt/raw AI IO executed: false.
- Dependency/package/lockfile changed: false.
- Destructive DB operation executed: false.
- Sensitive evidence captured: false.
- Release readiness/final Pass/Cost Calibration claimed: false.

## Root Cause Summary

- Prior diagnostic finding: organization analytics runtime summary load was blocked by missing local analytics source
  table/data.
- Schema inspection: required organization training analytics source tables were absent from the local app-config DB
  target before repair.
- Non-destructive schema alignment: required organization training source migrations were applied to the local Docker dev
  DB; no drop/truncate/reset was executed.
- Seed/runtime finding after schema alignment: app-config DB contained organization training source tables and aggregate
  source counts, but the test-owned `org_advanced_admin` account fixture's organization had zero submitted answers in
  the page default analytics window.
- Control comparison: the repository dev seed `org_advanced_admin` scope had dashboard-eligible submitted data, while
  the private test-owned acceptance account scope did not.
- Root cause: local test-owned account fixture and organization training analytics fixture were not aligned for
  `org_advanced_admin.organization_analytics`.

## Local DB Alignment Evidence

All evidence below is aggregate/status-only. No raw rows, internal ids, credential material, env contents, or connection
strings were recorded.

| Check                                                  | Result                                                                                                  |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| Docker dev DB service                                  | local service healthy                                                                                   |
| Required training answer table before repair           | missing in direct local target; app-config target aligned after repair                                  |
| Required source schema repair                          | pass; non-destructive migration/source table alignment                                                  |
| Dev seed execution                                     | pass; returned seeded table/count summary only                                                          |
| App-config DB table presence                           | version table present; answer table present                                                             |
| App-config DB aggregate after seed                     | version count 22; answer count 22; submitted count 21; analytics-window count 1                         |
| Visible organization scope aggregate                   | visible scope count 2; joined answer count 22; scoped-window count 1                                    |
| Test-owned org_advanced_admin fixture before alignment | scope 1; employee 1; active org auth 1; training version 1; submitted answer 0; default-window answer 0 |
| Test-owned org_advanced_admin seed alignment           | pass; upserted by business key                                                                          |
| Test-owned org_advanced_admin fixture after alignment  | default-window answer 1; dashboard-eligible answer 1                                                    |

## Runtime/API Evidence

| Runtime check                                | Result                                                                 |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| Test-owned org_advanced_admin session        | login code 0; session code 0; role matched; organization scope present |
| Dashboard summary before fixture alignment   | code 403185; data absent                                               |
| Employee statistics before fixture alignment | code 0; data present; employee count 0                                 |
| Dashboard summary after fixture alignment    | code 0; data present; submitted employee count 1                       |
| Employee statistics after fixture alignment  | code 0; data present; employee count 1                                 |

## Browser Evidence

| Browser route                                                         | Status summary                                                                                                                                                                  |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/organization/organization-analytics` before final fixture alignment | scope context 1; export readiness 1; summary card 0; employee statistics 0; summary failure 1                                                                                   |
| `/organization/organization-analytics` after final fixture alignment  | scope context 1; export readiness 1; summary card 1; employee statistics 1; redacted boundary 1; summary failure 0; employee failure 0; loaded message 1; console error count 0 |

## RED

RED: pass.

- Failure class before final local fixture alignment: dashboard summary returned access-denied style runtime code while
  the test-owned role and organization scope were valid.
- Evidence: dashboard summary before fixture alignment had code 403185 and data absent.

## GREEN

GREEN: pass.

- Repair summary: local test-owned analytics seed data was aligned by business key so the private acceptance
  `org_advanced_admin` organization has a submitted answer in the page default analytics window.
- Evidence: dashboard summary after fixture alignment had code 0, data present, and submitted employee count 1.
- Browser evidence: summary card 1, employee statistics 1, redacted boundary 1, failure prompts 0.

## Validation Results

- Scoped governance materialization check: pass.
- Code-taste, ADR, and owner-facing checklist read confirmation: pass.
- Local schema/migration/source inspection with redacted status/count evidence only: pass.
- Local DB schema/seed alignment: pass.
  Command: `local_db_schema_migration_and_test_owned_seed_alignment_redacted_counts`.
- Focused organization analytics unit test: pass; 5 files, 58 tests.
  Command:
  `npm.cmd run test:unit -- tests/unit/organization-analytics-admin-entry-surface.test.ts src/server/repositories/organization-analytics-repository.test.ts src/server/services/organization-analytics-route.test.ts src/server/services/organization-analytics-service.test.ts src/db/schema/organization-training.test.ts`.
- Redacted browser verification for role `org_advanced_admin`, route `/organization/organization-analytics`: pass.
  Command: `redacted_browser_org_advanced_admin_organization_analytics_runtime_verification`.
- Scoped prettier check: pass.
  Command:
  `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/01-requirements/traceability/2026-06-28-org-advanced-analytics-db-alignment-repair.md docs/05-execution-logs/task-plans/2026-06-28-org-advanced-analytics-db-alignment-repair.md docs/05-execution-logs/evidence/2026-06-28-org-advanced-analytics-db-alignment-repair.md docs/05-execution-logs/audits-reviews/2026-06-28-org-advanced-analytics-db-alignment-repair.md docs/05-execution-logs/acceptance/2026-06-28-org-advanced-analytics-db-alignment-repair.md`.
- `git diff --check`: pass.
  Command: `git diff --check`.
- Module Run v2 precommit hardening: pass.
  Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId org-advanced-analytics-db-alignment-repair-2026-06-28`.
- Module Run v2 closeout readiness: pending final post-commit rerun.
  Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId org-advanced-analytics-db-alignment-repair-2026-06-28`.
- Module Run v2 prepush readiness: pending final post-commit rerun.
  Command:
  `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId org-advanced-analytics-db-alignment-repair-2026-06-28 -SkipRemoteAheadCheck`.

## Evidence Boundary

Allowed evidence: role labels, route labels, workflow/status labels, aggregate counts, table-presence counts, migration
status labels, command names, test counts, failure classes, and commit SHA.

Forbidden evidence: credentials, cookies, tokens, sessions, localStorage, Authorization headers, env contents, connection
strings, raw DOM, screenshots, traces, raw DB rows, internal ids, PII, email, phone, plaintext `redeem_code`, Provider
payloads, prompts, raw AI input/output, and complete question/paper/material/resource/chunk content.

## Closeout Controls

- localFullLoopGate: this task may close the scoped org analytics runtime repair only; it cannot claim final Pass or
  durable-goal completion.
- threadRolloverGate: not required before this scoped repair closes.
- nextModuleRunCandidate: continue full acceptance matrix / full unit baseline queue after this scoped repair closes.
- Cost Calibration Gate remains blocked.
