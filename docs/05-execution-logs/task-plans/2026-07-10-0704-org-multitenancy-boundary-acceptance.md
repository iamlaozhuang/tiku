# 2026-07-10 0704 Org Multitenancy Boundary Acceptance Plan

## Task

- Task id: `0704-org-multitenancy-boundary-acceptance-2026-07-10`
- Branch: `codex/0704-org-multitenancy-boundary-acceptance`
- Mode: validation-only localhost acceptance plus targeted contract smoke.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/05-organization-analytics.md`
- `docs/01-requirements/advanced-edition/modules/07-retention-log-governance.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-06-21-org-auth-scope-product-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-log-privacy-smoke-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-log-privacy-smoke-audit.md`
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-employee-privacy-boundary-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-05-organization-ai-training-auth-lineage.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-12-advanced-org-admin-analytics-training-rerun-after-activity-provisioning.md`
- `docs/05-execution-logs/evidence/2026-07-05-full-chain-scenario-11-advanced-employee-affected-node-rerun-after-question-count-boundary-repair.md`
- Private lookup source read in-memory only:
  `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
  and its canonical catalog.

## Acceptance Focus

- Organization admin route/service checks use scoped `organization` context instead of menu-only filtering.
- `org_standard_admin` remains limited to organization overview, roster/status, authorization/status, and support surfaces.
- `org_advanced_admin` can use enterprise training, organization analytics, and organization AI only inside service-computed advanced `org_auth` scope.
- Organization admins cannot view employee learner AI raw results, raw answers, global AI logs, Provider payloads, raw prompts, raw AI output, raw task payloads, or unscoped employee details.
- Cross-organization training, analytics, roster, and employee records are denied or reduced to empty/status categories.
- Employee-facing enterprise training uses the employee's own organization context and does not expose another employee's answers.
- Organization analytics remains aggregate or summary-only and keeps enterprise-training metrics separate from formal-learning signals.

## Execution Steps

1. Confirm branch, origin alignment, and clean working tree.
2. Read required docs and targeted code/test entry points.
3. Run redacted readiness preflight for the in-scope roles.
4. Run targeted contract tests for organization workspace, training, analytics, employee account, learner AI privacy, and log redaction boundaries.
5. Record only role labels, route labels, status categories, command status, and aggregate test counts.
6. Perform adversarial review against permissions, tenant scope, sensitive evidence, standard/advanced edition, and employee/admin separation.
7. Update roadmap, coverage ledger, state, queue, evidence, and audit.
8. Run scoped formatting, `git diff --check`, lint, typecheck, and Module Run v2 gates.
9. Commit, fast-forward merge to `master`, rerun master gates, push `origin/master`, delete the short branch, and confirm clean/aligned.

## Blocked Actions

- No source or test edits.
- No package or lockfile changes.
- No schema, migration, seed, or DB mutation.
- No destructive DB operation.
- No Provider execution.
- No screenshot, raw DOM, trace, cookie, token, session, localStorage, Authorization header, env, DB URL, raw row, internal id, raw prompt, raw AI output, full content, employee raw answer, private fixture value, or plaintext `redeem_code` in evidence.
- No staging, production, deploy, payment, external service, PR, force push, or Cost Calibration.

## Targeted Validation Commands

```powershell
corepack pnpm@10.26.1 exec vitest run tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-admin-standard-advanced-workspace-source-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts tests/unit/organization-analytics-admin-entry-surface.test.ts src/server/services/organization-training-service.test.ts src/server/services/organization-training-route.test.ts src/server/repositories/organization-training-repository.test.ts src/server/services/org-auth-training-scope-summary-service.test.ts src/server/services/organization-analytics-service.test.ts src/server/services/organization-analytics-route.test.ts src/server/repositories/organization-analytics-repository.test.ts src/server/contracts/organization-analytics-contract.test.ts src/server/services/employee-account-service.test.ts src/server/services/employee-account-route.test.ts src/server/services/personal-ai-generation-result-route.test.ts src/server/services/personal-ai-generation-result-history-service.test.ts src/server/services/personal-ai-generation-result-reference-service.test.ts src/server/services/personal-ai-generation-ai-call-log-reference-service.test.ts src/server/services/audit-ai-call-log-reference-service.test.ts src/server/validators/audit-ai-call-log-reference.test.ts tests/unit/admin-ai-audit-log-ops-baseline.test.ts tests/unit/phase-11-ai-call-log-coverage-hardening.test.ts tests/unit/phase-11-audit-log-coverage-hardening.test.ts tests/unit/phase-11-ai-call-log-visibility-fix.test.ts
corepack pnpm@10.26.1 exec prettier --check --ignore-unknown docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/project-state.yaml docs/05-execution-logs/task-plans/2026-07-10-0704-org-multitenancy-boundary-acceptance.md docs/05-execution-logs/evidence/2026-07-10-0704-org-multitenancy-boundary-acceptance-evidence.md docs/05-execution-logs/audits-reviews/2026-07-10-0704-org-multitenancy-boundary-acceptance-audit.md docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md
git diff --check
corepack pnpm@10.26.1 run lint
corepack pnpm@10.26.1 run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-multitenancy-boundary-acceptance-2026-07-10
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-multitenancy-boundary-acceptance-2026-07-10 -SkipRemoteAheadCheck
```
