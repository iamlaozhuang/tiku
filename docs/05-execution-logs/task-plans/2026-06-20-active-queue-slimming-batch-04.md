# Active Queue Slimming Batch 04

## Task

- Task id: `active-queue-slimming-2026-06-20-batch-04`
- Branch: `codex/active-queue-slimming-batch-04`
- Scope: docs/state-only queue archival maintenance
- User approval: fresh approval for serial active queue archival maintenance, up to 50 candidates per batch and up to 5 batches.

## Exact Archive Manifest

1. `active-queue-slimming-2026-06-20-second-window`
2. `ap-01-provider-smoke-execution-qwen-approval`
3. `ap-01-provider-smoke-execution-deepseek-env-local-ready`
4. `ap-01-deepseek-env-local-prep`
5. `ap-01-provider-smoke-harness-token-cap-hardening`
6. `ap-01-provider-smoke-execution-approval-detailing`
7. `local-machine-unit-failure-repair-before-full-phase-1`
8. `local-machine-fresh-db-phase-1-validation-rerun`
9. `local-machine-phase-0-1-validation`
10. `phase-1-api-contract-baseline`
11. `phase-1-design-token-baseline`
12. `phase-1-env-logging-baseline`
13. `phase-2-user-auth-planning`
14. `phase-2-auth-schema-and-permission-model-approval`
15. `phase-18-prerequisite-local-role-account-fixture-baseline`
16. `fix-student-login-local-session-token`
17. `batch-188-organization-analytics-audit-log-redacted-reference`
18. `advanced-organization-analytics-post-batch-readonly-rollup-seeding`
19. `advanced-organization-analytics-repository-read-model-boundary-readonly-audit`
20. `advanced-organization-analytics-repository-read-model-contract-tdd`
21. `advanced-organization-analytics-repository-read-model-contract-readonly-recheck`
22. `advanced-organization-analytics-repository-service-wiring-boundary-readonly-audit`
23. `advanced-organization-analytics-repository-service-wiring-tdd`
24. `advanced-organization-analytics-post-service-wiring-recheck-seeding`
25. `advanced-organization-analytics-repository-service-wiring-readonly-recheck`
26. `advanced-organization-analytics-route-runtime-boundary-readonly-audit-seeding`
27. `advanced-organization-analytics-route-runtime-boundary-readonly-audit`
28. `advanced-organization-analytics-mapper-validator-route-contract-tdd-seeding`
29. `standing-autonomy-docs-fast-lane-and-current-tdd-closeout-upgrade`
30. `advanced-organization-analytics-mapper-validator-route-contract-tdd`
31. `advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd-seeding`
32. `advanced-organization-analytics-dashboard-summary-route-runtime-wiring-tdd`
33. `advanced-organization-analytics-dashboard-summary-runtime-boundary-audit-seeding`
34. `advanced-organization-analytics-dashboard-summary-real-runtime-boundary-readonly-audit`
35. `advanced-organization-analytics-dashboard-summary-admin-context-route-contract-tdd`
36. `advanced-organization-analytics-dashboard-summary-runtime-wiring-decision-seeding`
37. `advanced-organization-analytics-dashboard-summary-runtime-composition-contract-tdd`
38. `advanced-organization-analytics-repository-factory-boundary-tdd-seeding`
39. `advanced-organization-analytics-postgres-repository-factory-boundary-tdd`
40. `advanced-organization-analytics-postgres-gateway-source-input-decision-seeding`
41. `advanced-organization-analytics-postgres-gateway-source-input-decision`
42. `advanced-organization-analytics-postgres-gateway-training-answer-source-gap-decision`
43. `advanced-organization-analytics-training-answer-source-schema-migration-planning`
44. `advanced-organization-analytics-training-answer-source-schema-migration`
45. `advanced-organization-analytics-gateway-query-task-seeding`
46. `advanced-organization-analytics-postgres-gateway-training-answer-source-query-tdd`
47. `advanced-organization-analytics-post-query-gateway-composition-task-seeding`
48. `advanced-organization-analytics-postgres-gateway-visible-scope-composition-tdd`
49. `advanced-organization-analytics-post-visible-scope-source-reader-seeding`
50. `advanced-organization-analytics-postgres-gateway-source-readers-tdd`

## Evidence Eligibility Notes

Registered legacy-unavailable evidence debt:

- `phase-1-api-contract-baseline`
- `phase-1-design-token-baseline`
- `phase-1-env-logging-baseline`
- `phase-2-user-auth-planning`
- `phase-2-auth-schema-and-permission-model-approval`

Closure evidence recovered:

- `phase-18-prerequisite-local-role-account-fixture-baseline`

Legacy audit gaps retained as metadata:

- `phase-1-api-contract-baseline`
- `phase-1-design-token-baseline`
- `phase-1-env-logging-baseline`
- `phase-2-user-auth-planning`
- `phase-2-auth-schema-and-permission-model-approval`
- `phase-18-prerequisite-local-role-account-fixture-baseline`

Active blocked dependents kept resolvable through history index:

- `ap-01-provider-smoke-execution-qwen-env-local-ready`
- `ap-01-provider-smoke-execution`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-20-active-queue-slimming-batch-04.md`
- `docs/05-execution-logs/evidence/2026-06-20-active-queue-slimming-batch-04.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-active-queue-slimming-batch-04.md`

## Hard Blocks

No archived task business action, source, tests, e2e, DB, env/secret, provider/model, schema/migration, dependency/package/lockfile, staging/prod/cloud/deploy, payment, OCR, export, external-service, Cost Calibration Gate, PR, force push, destructive DB, L1/L2/L3 execution, or sensitive evidence work was performed.

## Plan

1. Move exactly 50 terminal task blocks to archive.
2. Add matching history index entries.
3. Update project-state current task and summary.
4. Run scoped formatting, diagnostics, lint, typecheck, and Module Run v2 gates.
5. Commit, fast-forward merge, push, cleanup, then re-check project status.
