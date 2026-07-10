# 2026-07-10 0704 Authorization Lifecycle Acceptance Plan

## Task

- Task id: `0704-authorization-lifecycle-acceptance-2026-07-10`
- Branch: `codex/0704-authorization-lifecycle-acceptance`
- Mode: validation-only localhost acceptance plus targeted contract smoke.

## Read Gate

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/advanced-edition/modules/01-authorization-context.md`
- `docs/01-requirements/advanced-edition/modules/03-personal-ai-generation.md`
- `docs/01-requirements/advanced-edition/modules/04-organization-training.md`
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/traceability/2026-07-02-ai-generation-requirements-ssot-alignment.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/01-requirements/traceability/2026-07-02-current-thread-requirement-reconciliation-ledger.md`
- `docs/01-requirements/traceability/2026-07-05-ai-generation-closed-loop-target-alignment.md`
- `docs/01-requirements/traceability/2026-07-06-ai-generation-recontract-requirements-materialization.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md`
- `docs/05-execution-logs/handoffs/2026-07-10-0704-private-account-usage-guide.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-role-credential-catalog-consolidation-evidence.md`
- `docs/05-execution-logs/evidence/2026-07-09-learner-ai-0704-account-readiness-evidence.md`
- Private lookup source read in-memory only:
  `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
  and its canonical catalog.

## Acceptance Focus

- Standard personal and standard organization contexts reject advanced AI and enterprise-training capabilities.
- Advanced personal and advanced organization contexts expose eligible advanced capabilities.
- Employee capability comes from current valid `org_auth` context, not personal authorization or stale UI state.
- Organization admins and employees cannot use personal `edition_upgrade` semantics to alter `org_auth`.
- Missing, expired, cancelled, revoked, or out-of-scope authorization produces denied or unavailable status categories.
- `redeem_code` evidence remains redacted; no plaintext values or internal ids are recorded.

## Execution Steps

1. Confirm branch, origin alignment, and clean working tree.
2. Read the required docs and targeted code/test entry points.
3. Run redacted readiness preflight for the 9 core roles.
4. Run targeted contract tests for authorization lifecycle, role boundary, standard/advanced AI gate, and organization training gate.
5. Record only role labels, route labels, status categories, command status, and aggregate test counts.
6. Perform adversarial review against permissions, data boundary, sensitive evidence, standard/advanced edition, and employee/admin separation.
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
corepack pnpm@10.26.1 exec vitest run src/server/services/effective-authorization-service.test.ts src/server/services/effective-authorization-route.test.ts src/server/services/edition-aware-authorization-service.test.ts src/server/services/edition-aware-authorization-route.test.ts src/server/repositories/edition-aware-authorization-repository.test.ts src/server/mappers/effective-authorization-mapper.test.ts src/server/mappers/edition-aware-authorization-mapper.test.ts src/server/validators/edition-aware-authorization.test.ts src/server/services/redeem-code-authorization-service.test.ts src/server/services/redeem-code-route.test.ts src/server/services/organization-auth-service.test.ts src/server/services/organization-auth-route.test.ts src/server/services/personal-ai-generation-request-route.test.ts src/server/services/organization-training-route.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/student-personal-ai-generation-ui.test.ts tests/unit/organization-training-admin-entry-surface.test.ts tests/unit/organization-training-employee-entry-surface.test.ts
corepack pnpm@10.26.1 exec prettier --check --ignore-unknown docs/04-agent-system/state/task-queue.yaml docs/04-agent-system/state/project-state.yaml docs/05-execution-logs/task-plans/2026-07-10-0704-authorization-lifecycle-acceptance.md docs/05-execution-logs/evidence/2026-07-10-0704-authorization-lifecycle-acceptance-evidence.md docs/05-execution-logs/audits-reviews/2026-07-10-0704-authorization-lifecycle-acceptance-audit.md docs/05-execution-logs/acceptance/2026-07-10-0704-post-ai-acceptance-roadmap.md docs/05-execution-logs/acceptance/2026-07-10-0704-acceptance-coverage-ledger.md
git diff --check
corepack pnpm@10.26.1 run lint
corepack pnpm@10.26.1 run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-authorization-lifecycle-acceptance-2026-07-10
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-authorization-lifecycle-acceptance-2026-07-10 -SkipRemoteAheadCheck
```
