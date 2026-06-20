# Active Queue Slimming Batch 03

## Task

- Task id: `active-queue-slimming-2026-06-20-batch-03`
- Branch: `codex/active-queue-slimming-batch-03`
- Scope: docs/state-only queue archival maintenance
- User approval: fresh approval in this session for docs/state-only active queue archival maintenance, up to 50 archive
  candidates per batch, serially, up to 5 batches.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/04-agent-system/sop/active-queue-slimming-plan.md`
- `docs/04-agent-system/sop/task-queue-archival-and-index-governance.md`

## Local Baseline

- `git status --short --branch`: clean on `master...origin/master` before branch creation.
- `git rev-list --left-right --count master...origin/master`: `0 0`.
- `git log --oneline -5`: latest commit `24117be4 docs(queue): archive second slimming window`.
- `Get-TikuNextAction.ps1`: `recommendedAction: idle_no_pending_task`.
- `Get-TikuProjectStatus.ps1`: `queueSlimmingDecision: slimming_candidates`, `archiveCandidateCount: 213`.

## Exact Archive Manifest

Archive the next 50 diagnostic archive candidates only:

1. `active-queue-slimming-2026-06-20-first-window`
2. `ap-04-standard-ai-generation-scope-change-user-choice-required`
3. `ap-09-runtime-capability-implementation-exact-scope-required`
4. `ap-08-org-data-export-execution-fresh-approval-required`
5. `ap-07-ocr-auto-import-execution-fresh-approval-required`
6. `ap-06-online-payment-execution-fresh-approval-required`
7. `ap-03-provider-staging-execution-fresh-approval-required`
8. `ap-02-ops-auth-quota-cost-calibration-release-gate-fresh-approval-required`
9. `ap-02-ops-auth-quota-cost-calibration-l1-local-summary-execution`
10. `ap-02-ops-auth-quota-cost-calibration-l1-local-summary-fresh-approval-required`
11. `ap-02-ops-auth-quota-cost-calibration-l1-l2-exact-scope-package`
12. `ap-02-ops-auth-quota-cost-calibration-fresh-approval-required`
13. `ap-02-ap-11-fresh-approval-decision-pack`
14. `ap-11-source-governance-change-control-detailing`
15. `ap-10-current-checkpoint-audit-target-detailing`
16. `ap-05-standard-org-self-service-scope-decision-detailing`
17. `ap-04-standard-ai-generation-scope-decision-detailing`
18. `ap-09-runtime-capability-list-inventory-detailing`
19. `ap-08-org-data-export-boundary-detailing`
20. `ap-07-ocr-auto-import-provider-boundary-detailing`
21. `ap-06-online-payment-provider-boundary-detailing`
22. `ap-03-provider-staging-execution-approval-detailing`
23. `ap-02-ops-auth-quota-cost-calibration-approval-detailing`
24. `blocked-use-case-acceleration-governance-packet`
25. `ap-01-qwen-local-experience-merge-push-cleanup`
26. `ap-01-qwen-local-experience-closeout-audit`
27. `ap-01-qwen-user-visible-result-local-readback-closeout-execution`
28. `ap-01-qwen-user-visible-result-local-readback-closeout-approval`
29. `ap-01-qwen-user-visible-result-local-db-persistence-execution`
30. `ap-01-qwen-user-visible-result-local-db-persistence-approval`
31. `ap-01-qwen-user-visible-result-one-request-materialization-execution`
32. `ap-01-qwen-user-visible-result-one-request-materialization-approval`
33. `ap-01-qwen-route-integrated-user-visible-result-materialization-implementation`
34. `ap-01-qwen-route-integrated-user-visible-result-materialization-approval`
35. `ap-01-qwen-route-integrated-provider-one-request-execution`
36. `ap-01-qwen-route-integrated-provider-one-request-execution-approval`
37. `ap-01-qwen-route-integrated-provider-execution-implementation`
38. `ap-01-qwen-route-integrated-provider-execution-implementation-approval`
39. `ap-01-qwen-in-app-ai-one-request-execution`
40. `ap-01-qwen-in-app-ai-one-request-execution-approval`
41. `ap-01-qwen-in-app-ai-runtime-bridge-implementation`
42. `ap-01-qwen-in-app-ai-runtime-bridge-approval`
43. `ap-01-qwen-cost-calibration-and-in-app-ai-experience-approval-detailing`
44. `ap-01-qwen3-7-max-one-request-smoke-approval`
45. `ap-01-qwen-exact-model-id-and-key-permission-handoff`
46. `ap-01-qwen-console-permission-remediation-handoff`
47. `ap-01-qwen-redacted-provider-error-code-diagnostics`
48. `ap-01-qwen-provider-smoke-base-url-failure-diagnosis`
49. `ap-01-qwen-provider-smoke-runner-base-url-config`
50. `ap-01-qwen-provider-config-approval-package`

All 50 candidates are terminal `closed` entries and have existing `evidencePath` and `auditReviewPath` files. Four
active blocked tasks depend on candidate ids, and those dependencies will remain resolvable through
`task-history-index.yaml` after this batch:

- `ap-01-qwen-one-request-post-console-remediation-retry-approval`
- `ap-01-qwen-one-request-redacted-error-code-diagnostic-run`
- `ap-01-qwen-openai-compatible-one-request-isolation-smoke`
- `ap-01-qwen-provider-smoke-execution-base-url-ready`

## Allowed Files

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/04-agent-system/state/archive/task-queue-archive-2026-06.yaml`
- `docs/04-agent-system/state/task-history-index.yaml`
- `docs/05-execution-logs/task-plans/2026-06-20-active-queue-slimming-batch-03.md`
- `docs/05-execution-logs/evidence/2026-06-20-active-queue-slimming-batch-03.md`
- `docs/05-execution-logs/audits-reviews/2026-06-20-active-queue-slimming-batch-03.md`

## Hard Blocks

No source, tests, e2e, DB, env/secret, provider/model, schema/migration, dependency/package/lockfile,
staging/prod/cloud/deploy, payment, OCR, export, external-service, Cost Calibration Gate, PR, force push, destructive
DB, sensitive evidence, exact_scope_local_auto_execute, L1/L2/L3 task execution, or archived task business action.

## Implementation Plan

1. Add the batch 03 archive task to active queue with closed validation metadata.
2. Move the exact 50 closed task entries from active queue to `task-queue-archive-2026-06.yaml`.
3. Add matching `task-history-index.yaml` entries for all 50 ids.
4. Update `project-state.yaml` current task and queue slimming summary.
5. Write evidence and audit review.
6. Run scoped formatting and required local gates.
7. Commit, fast-forward merge to `master`, run master gates, push `origin/master`, and delete the merged branch.
8. Rerun `Get-TikuProjectStatus.ps1` and continue only if no stop condition is triggered.

## Risk Controls

- Preserve archived task bodies without semantic edits.
- Keep all non-terminal blocked tasks in active queue.
- Verify moved ids are absent from active queue and present in archive and history index.
- Verify active blocked dependencies remain resolvable through history index.
- Stop if validation requires source/test/e2e repair or any high-risk execution.
