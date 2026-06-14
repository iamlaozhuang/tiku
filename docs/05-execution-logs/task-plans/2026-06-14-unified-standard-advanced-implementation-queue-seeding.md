# Unified Standard Advanced Implementation Queue Seeding Task Plan

## Task

- Task id: `unified-standard-advanced-implementation-queue-seeding`
- Branch: `codex/unified-standard-advanced-implementation-queue-seeding`
- Date: 2026-06-14
- Scope: docs-only implementation queue seeding from approved traceability artifacts.

## Inputs To Re-Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-edition-delta-matrix.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-consistency-and-risk-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-consistency-and-risk-audit.md`

## Human Approval Boundary

The user approved only this implementation queue seeding task. This approval permits scoped updates to
`project-state.yaml`, `task-queue.yaml`, and this task's plan/evidence/audit files. It does not approve code audit
execution, code fixes, implementation, schema/migration, provider/env, e2e, deploy, payment, external-service, PR,
force-push, fast-forward merge, push, cleanup, or follow-up task claiming.

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-advanced-implementation-queue-seeding.md`

## Blocked Scope

- Code audit execution.
- Code fixes or runtime implementation.
- `src/**`, `tests/**`, `e2e/**`, `scripts/**`, `src/db/schema/**`, `drizzle/**`, schema/migration, package, and lockfile
  edits.
- `.env.local`, `.env.*`, real secret files, provider configuration files, provider calls, model requests, quota use,
  staging/prod/cloud/deploy/payment/external-service operations.
- PR, force-push, merge, push, branch cleanup, and Cost Calibration work.

## Approach

1. Treat the source index, capability catalog, use case catalog, edition delta matrix, technical landing matrix, and
   consistency/risk audit as the only authoritative planning inputs.
2. Split mixed standard/advanced landing rows before queue seeding; do not seed whole mixed rows as executable
   implementation tasks.
3. Seed later tasks as pending, explicit, redacted, and approval-bounded work packages:
   - standard-only read-only code-audit candidates that may later inspect implementation surfaces but cannot modify code.
   - advanced blocked planning candidates that preserve provider/schema/deploy/privacy gates.
   - audit-only and future non-goal guard tasks that prevent excluded rows from drifting into implementation.
   - blocked-gate guard tasks for provider/staging and checkpoint references.
4. For every seeded task, record `landingIds`, `sourceIds`, `capabilityIds`, `useCaseIds`, `deltaIds`, `allowedFiles`,
   `blockedFiles`, `validationCommands`, `blockedGates`, and the human approval boundary.
5. Update state to close this seeding task only after validation evidence and audit review are written.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-advanced-implementation-queue-seeding`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-advanced-implementation-queue-seeding`

## Risk Controls

- Do not convert `implementationEligible: blocked_until_gate_approved` into implementation approval.
- Do not allow `auditUseOnly: true` or `implementationEligible: false` rows to seed implementation tasks.
- Carry unresolved `CFX-*` conflicts forward without adjudication.
- Keep future tasks pending and require fresh user instruction before any one is claimed.
- Evidence must not include raw secret, provider payload, raw response, database URL, row data, prompt payload, cleartext
  `redeem_code`, raw question bank content, raw paper content, student answer text, or employee subjective answer text.
