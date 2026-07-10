# 2026-07-10 0704 Organization Tree Employee Transfer Fix Plan

## Scope

- taskId: `0704-org-tree-employee-transfer-fix-2026-07-10`
- branch: `codex/0704-org-tree-employee-transfer-fix`
- mode: targeted source repair after validation-only gap

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
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-tree-auth-inheritance-acceptance-evidence.md`

## Private Readiness

- private index path: `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
- mode: metadata-only
- required result: 9 core role labels found
- credential values: not output, not written, not committed

## Defect

`0704-org-tree-auth-inheritance-acceptance-2026-07-10` confirmed that employee transfer has an impact-review UI surface
but no executable mutation route, service action, or repository transaction. The missing path blocks proof of target
quota, old organization access revocation, session revocation, and historical training snapshot behavior.

## Implementation Plan

1. Add failing focused tests for employee transfer route, service action, repository scoping/quota/session markers, UI
   submit behavior, and denial for non-operations roles.
2. Extend admin employee contracts with a redacted transfer DTO.
3. Add `POST /api/v1/employees/{publicId}/transfer` as a thin route handler.
4. Extend the admin organization runtime service and repository with a minimal employee transfer mutation:
   - `ops_admin` / `super_admin` only;
   - target organization required;
   - target organization must differ from previous organization;
   - target organization must have an active authorization capacity category;
   - update the employee organization binding;
   - return old/new organization labels and session/training convergence status categories only;
   - write redacted `audit_log` metadata.
5. Wire the existing operations UI transfer review panel to submit selected employee/target organization rows and display
   redacted transfer results.
6. Run focused tests, lint, typecheck, diff check, Module Run v2, and adversarial review.

## Boundaries

- No package or lockfile changes.
- No schema, migration, seed, direct DB command, destructive DB operation, Provider, env/secret, staging/prod/deploy,
  screenshot, raw DOM, or Cost Calibration action.
- Evidence remains redacted: no credentials, password, plaintext `redeem_code`, cookie, session, token, env value, DB URL,
  raw DB row, internal numeric id, Provider payload, raw Prompt, raw AI output, full question, paper, material, resource,
  chunk, or employee raw answer.

## Validation Commands

- TDD red: targeted transfer tests before implementation
- `corepack pnpm@10.26.1 vitest run tests/unit/phase-20-ra-01-12-employee-transfer-unbind.test.ts tests/unit/phase-20-ra-06-03-organization-employee-management-completion.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-8-admin-organization-org-auth-runtime.test.ts src/server/services/effective-authorization-service.test.ts`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-tree-employee-transfer-fix-2026-07-10`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-tree-employee-transfer-fix-2026-07-10 -SkipRemoteAheadCheck`
