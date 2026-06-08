# Module Run v2 Pre-Commit Scan Hardening Plan

## Scope

- task id: `module-run-v2-pre-commit-scan-hardening`
- branch: `codex/module-run-v2-pre-commit-scan-hardening`
- task kind: `implementation`
- purpose: add a Module Run v2 pre-commit hard-block scan before the existing lint-staged, lint, and typecheck gates.

## Read Context

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/state/advanced-edition-domain-module-run-matrix.yaml`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-08-module-run-v2-hook-automation-readiness.md`
- `docs/05-execution-logs/evidence/2026-06-08-module-run-v2-pre-work-pre-edit-advisory.md`

## Implementation Plan

1. Add a RED smoke test for the future pre-commit hardening script.
2. Implement a focused PowerShell script that scans changed or staged files for:
   - queue blocked-file violations;
   - sensitive evidence patterns;
   - banned business terminology.
3. Wire `.husky/pre-commit` to run the hardening script before the existing quality commands.
4. Update state and queue for this implementation task.
5. Write evidence and audit review after verification.

## Boundaries

Allowed surfaces:

- `.husky/pre-commit`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.ps1`
- `scripts/agent-system/Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan, evidence, and audit review

Forbidden surfaces:

- package and lockfiles
- product code
- schema or migration files
- `src/db/schema/**`
- `drizzle/**`
- `.env.local`
- `.env.example`
- `e2e/**`
- provider, env/secret, staging/prod/cloud/deploy, payment, external-service configuration
- Cost Calibration Gate execution

## TDD Target

The smoke test must first fail because the pre-commit hardening script is missing or incomplete. After implementation it
must prove:

- allowed staged files pass;
- blocked staged files fail;
- sensitive evidence patterns fail;
- banned business terminology fails;
- the real repository pre-commit path reports `Module Run v2` anchors.

## Validation Matrix

- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.Smoke.ps1`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId module-run-v2-pre-commit-scan-hardening`
- `git diff --check`
- scoped `prettier --write`
- scoped `prettier --check`
- required anchor check for `Module Run v2`, `pre-commit`, `HARD_BLOCK_BLOCKED_FILE`,
  `HARD_BLOCK_SENSITIVE_EVIDENCE`, `Cost Calibration Gate remains blocked`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`

## Stop Conditions

Stop and report if any of these are required:

- dependency or package script changes;
- schema, migration, repository, API route, Server Action, product code, or e2e changes;
- env/secret/provider/staging/prod/cloud/deploy/payment/external-service access;
- Cost Calibration Gate execution;
- hook false positives that would block normal evidence redaction or this task's own allowed files.
