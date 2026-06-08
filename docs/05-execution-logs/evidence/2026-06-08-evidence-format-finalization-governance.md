# Evidence Format Finalization Governance Evidence

## Summary

This docs/state governance task resolves the recurring formatting blocker by codifying the evidence formatting finalization order:

1. write final evidence, audit review, task plan, task queue, or project state wording;
2. run scoped `prettier --write` on exactly the changed docs/state files;
3. run scoped `prettier --check` on the same files;
4. run `git diff --check`, required anchors, and Git readiness checks.

The fix is procedural only. It does not modify product code, scripts, dependencies, package/lockfile files, schema, migration, provider, env/secret, staging/prod/cloud/deploy, payment, external-service, repository, API route, Server Action, or the real `authorization` permission model. Cost Calibration Gate remains blocked.

## Task Metadata

- task id: `evidence-format-finalization-governance`
- branch: `codex/evidence-format-finalization-governance`
- task kind: `docs_state_governance`
- baseline: `master` / `origin/master` / `HEAD` aligned at `53947f49aba3f606ab9a74c3c13dc8d63de48c38` before branch creation.

## Changed Files

- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/sop/module-lifecycle-governance.md`
- `docs/04-agent-system/sop/local-first-validation-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-08-evidence-format-finalization-governance.md`
- `docs/05-execution-logs/evidence/2026-06-08-evidence-format-finalization-governance.md`
- `docs/05-execution-logs/audits-reviews/2026-06-08-evidence-format-finalization-governance.md`

## Approval Boundary

The user explicitly requested fixing the recurring formatting blocker to avoid slowing later development. This approval covers docs/state governance only.

Blocked surfaces remain blocked:

- dependency, package, and lockfile changes;
- schema, migration, `src/db/schema/**`, and `drizzle/**`;
- `.env.local`, `.env.example`, env/secret, provider, staging/prod/cloud/deploy, payment, and external-service work;
- scripts and e2e changes;
- repository, API route, and Server Action work;
- real `authorization` permission model changes;
- Cost Calibration Gate execution.

## Validation

| Command                   | Result | Notes                                                                                                                                                                                                                                         |
| ------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| scoped `prettier --write` | pass   | Ran on the exact changed docs/state file list before scoped `prettier --check`; initial run formatted the new evidence and audit review files only.                                                                                           |
| scoped `prettier --check` | pass   | Output included `All matched files use Prettier code style!`.                                                                                                                                                                                 |
| `git diff --check`        | pass   | No whitespace errors reported.                                                                                                                                                                                                                |
| required anchor check     | pass   | Matched `Evidence Formatting Finalization Rule`, `prettier --write`, `prettier --check`, `Batch 95`, `authorization`, `personal_auth`, `org_auth`, `redeem_code`, `paper`, `mock_exam`, `audit_log`, `ai_call_log`, and blocked gate wording. |
| Git completion readiness  | pass   | `.\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master` completed inventory on branch `codex/evidence-format-finalization-governance` without modifying `scripts/**`.                                                     |

## Residual Gaps

- This task hardens the documented mechanism, but does not add automation or a hook because scripts and dependency changes are outside scope.
- Future batch closeout must follow the new order manually or through a separately approved automation task.

## Next Step

Commit this docs/state governance change and merge it back to `master`.
