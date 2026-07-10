# 2026-07-10 0704 Organization Tree Auth Inheritance Acceptance Rerun Plan

## Scope

- taskId: `0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10`
- branch: `codex/0704-org-tree-auth-inheritance-acceptance-rerun`
- mode: validation-only localhost/source/test rerun after repair

## Read Baseline

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/01-requirements/traceability/2026-07-02-role-auth-training-ops-decision-package.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-tree-auth-inheritance-acceptance-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-org-tree-auth-inheritance-acceptance-audit.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-tree-employee-transfer-fix-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-org-tree-employee-transfer-fix-audit.md`

## Private Readiness

- private index path: `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
- mode: metadata-only
- required result: 9 core role labels found
- credential values: not output, not written, not committed

## Rerun Target

The prior validation task stopped because employee transfer had only an impact-review UI surface and lacked an executable
mutation route, service action, and repository transaction. This rerun verifies that the repair closes that gap and that
the original organization tree, authorization inheritance, unbind, scoped admin, and employee lifecycle standards still
hold.

## Validation Plan

1. Inspect source/test markers for the repaired employee transfer route, service action, repository transaction, session
   revocation, old-organization in-progress training blocking, and operations UI submit behavior.
2. Re-run the original organization tree/auth inheritance targeted test pack plus the focused repair tests.
3. Record redacted evidence only: role labels, route/control labels, status categories, command results, and test counts.
4. Perform adversarial review for role boundary, data boundary, standard/advanced scope, organization inheritance,
   employee transfer convergence, historical snapshot behavior, privacy, and cross-organization isolation.

## Boundaries

- Validation-only: no source or test changes.
- No dependency, package, lockfile, schema, migration, seed, direct DB command, destructive DB operation, Provider,
  env/secret, staging/prod/deploy, screenshot, raw DOM, or Cost Calibration action.
- No account, password, plaintext `redeem_code`, cookie, session, token, env value, DB URL, raw DB row, internal numeric
  id, Provider payload, raw Prompt, raw AI output, full question, paper, material, resource, chunk, or employee raw answer
  in evidence.

## Validation Commands

- metadata-only private credential index preflight
- static source marker inspection using `rg`
- `corepack pnpm@10.26.1 vitest run tests/unit/phase-11-system-ops-organization-management-loop.test.ts tests/unit/phase-11-system-ops-org-auth-management-loop.test.ts tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-01-10-organization-disable-termination.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts tests/unit/organization/organization-auth-layering-lifecycle.test.ts src/server/services/organization-auth-service.test.ts src/server/services/effective-authorization-service.test.ts src/server/auth/local-session-runtime.test.ts tests/unit/admin-workspace-role-guard-contract.test.ts tests/unit/organization-portal-admin-entry-surface.test.ts`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-tree-auth-inheritance-acceptance-rerun-2026-07-10 -SkipRemoteAheadCheck`
