# 2026-07-10 0704 Personal Redeem Code Acceptance Plan

## Scope

- taskId: `0704-personal-redeem-code-acceptance-2026-07-10`
- branch: `codex/0704-personal-redeem-code-acceptance`
- mode: validation-only localhost/source/test acceptance

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
- `docs/01-requirements/advanced-edition/modules/06-ops-authorization-quota.md`
- `docs/01-requirements/advanced-edition/stories/epic-04-ops-authorization-quota-governance.md`
- `docs/01-requirements/traceability/2026-07-02-redeem-code-edition-and-plaintext-ops-decision.md`
- `docs/05-execution-logs/acceptance/2026-07-10-0704-post-peripheral-acceptance-ledger.md`
- latest employee import rerun evidence and audit

## Private Readiness

- private index path: `D:\tiku-local-private\acceptance\0704-role-credential-index.private.md`
- mode: metadata-only
- required result: 9 core role labels found
- credential values: not output, not written, not committed

## Validation Plan

1. Inspect source/test markers for `personal_standard_activation`, `personal_advanced_activation`, `edition_upgrade`,
   `auth_upgrade`, used/expired rejection, explicit generation type selection, and eligible-role plaintext boundaries.
2. Run targeted redeem-code, authorization-context, and admin operations tests.
3. Record redacted evidence only: role labels, route/control labels, status categories, command results, and test counts.
4. Perform adversarial review for role boundary, data boundary, upgrade semantics, plaintext exception containment, and
   standard/advanced authorization behavior.

## Boundaries

- Validation-only: no source or test changes.
- No dependency, package, lockfile, schema, migration, seed, DB, Provider, env/secret, staging/prod/deploy, screenshot,
  raw DOM, or Cost Calibration action.
- No account, password, plaintext `redeem_code`, cookie, session, token, env value, DB URL, raw DB row, internal numeric
  id, Provider payload, raw Prompt, raw AI output, full question, paper, material, resource, chunk, or employee raw answer
  in evidence.

## Validation Commands

- static source marker inspection using `rg`
- `corepack pnpm@10.26.1 vitest run tests/unit/phase-8-student-authorization-redeem-runtime.test.ts src/server/services/redeem-code-authorization-service.test.ts src/server/validators/redeem-code.test.ts src/db/schema/auth.test.ts tests/unit/phase-11-redeem-code-batch-management-loop.test.ts tests/unit/admin-user-org-auth-ops-baseline.test.ts src/server/services/edition-aware-authorization-service.test.ts src/server/services/effective-authorization-service.test.ts`
- `corepack pnpm@10.26.1 run lint`
- `corepack pnpm@10.26.1 run typecheck`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId 0704-personal-redeem-code-acceptance-2026-07-10`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId 0704-personal-redeem-code-acceptance-2026-07-10 -SkipRemoteAheadCheck`
