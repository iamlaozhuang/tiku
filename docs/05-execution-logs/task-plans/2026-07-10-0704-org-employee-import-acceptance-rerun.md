# 2026-07-10 0704 Org Employee Import Acceptance Rerun Plan

## Scope

- taskId: `0704-org-employee-import-acceptance-rerun-2026-07-10`
- branch: `codex/0704-org-employee-import-acceptance-rerun`
- mode: validation-only rerun after `0704-org-employee-import-template-fix-2026-07-10`

## Read Baseline

- `AGENTS.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- `docs/01-requirements/modules/01-user-auth.md`
- `docs/01-requirements/modules/06-admin-ops.md`
- `docs/01-requirements/advanced-edition/edition-aware-authorization-requirements.md`
- `docs/05-execution-logs/evidence/2026-07-10-0704-org-employee-import-template-fix-evidence.md`
- `docs/05-execution-logs/audits-reviews/2026-07-10-0704-org-employee-import-template-fix-audit.md`

## Private Readiness

- private index path: `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
- mode: metadata-only
- required result: 9 core role labels found
- credential values: not output, not written, not committed

## Validation Plan

1. Re-check source markers for roster file upload, template download, inherited authorization preview, quota-impact preview, safe reason categories, forbidden authorization fields, and 500-row ceiling.
2. Run the targeted employee import and adjacent account tests.
3. Record redacted evidence only: role labels, status categories, file paths, command results, and test counts.
4. Perform adversarial review for role ownership, data boundary, authorization inheritance, standard/advanced boundary, and sensitive information.

## Boundaries

- Validation-only: no source or test changes.
- No dependency, package, lockfile, schema, migration, seed, DB, Provider, env/secret, staging/prod/deploy, screenshot, raw DOM, or Cost Calibration action.
- No credential, password, session, token, DB row, internal numeric id, raw employee row, plaintext `redeem_code`, raw Prompt, Provider payload, raw AI output, full question, paper, material, resource, or chunk in evidence.

## Validation Commands

- static source marker inspection using `rg`
- `corepack pnpm@10.26.1 vitest run tests/unit/admin-user-org-auth-ops-baseline.test.ts tests/unit/phase-20-ra-01-04-employee-import.test.ts tests/unit/phase-20-ra-01-03-employee-account-runtime.test.ts src/server/validators/employee-account.test.ts src/server/services/employee-account-service.test.ts src/server/services/employee-account-route.test.ts`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-org-employee-import-acceptance-rerun-2026-07-10`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-org-employee-import-acceptance-rerun-2026-07-10 -SkipRemoteAheadCheck`
