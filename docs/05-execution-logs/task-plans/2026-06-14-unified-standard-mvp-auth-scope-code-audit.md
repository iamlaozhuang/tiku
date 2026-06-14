# Unified Standard MVP Auth Scope Code Audit Task Plan

## Task

- Task id: `unified-standard-mvp-auth-scope-code-audit`
- Branch: `codex/unified-standard-mvp-auth-scope-code-audit`
- Date: 2026-06-14
- Scope: read-only code audit for standard account/session and personal authorization surfaces.

## Inputs Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/unified-standard-advanced-source-index.md`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/01-requirements/use-cases/use-case-catalog.md`
- `docs/01-requirements/traceability/unified-use-case-technical-matrix.md`

## Human Approval Boundary

The user approved this task as part of a two-task read-only audit batch. This task may create or update only the approved
state/queue and this task's plan/evidence/audit files. It may read only the queued read-only paths. It may not modify
source code, tests, scripts, schema, migrations, package files, lockfiles, env files, provider configuration, or any
secret-bearing file.

## Allowed Writes

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/task-plans/2026-06-14-unified-standard-mvp-auth-scope-code-audit.md`
- `docs/05-execution-logs/evidence/2026-06-14-unified-standard-mvp-auth-scope-code-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-14-unified-standard-mvp-auth-scope-code-audit.md`

## Read-Only Code Scope

- `src/app/api/v1/users/**`
- `src/server/services/user-auth/**`
- `src/server/repositories/user-auth/**`
- `src/server/validators/user-auth/**`
- `src/server/mappers/user-auth/**`
- `src/server/services/authorization/**`
- `src/server/repositories/authorization/**`
- `src/server/validators/authorization/**`
- `src/server/mappers/authorization/**`
- `src/app/(auth)/**`
- `src/app/(student)/**`

## Blocked Scope

- Code fixes or implementation.
- Auth model changes.
- Cleartext `redeem_code` handling or evidence.
- Schema/migration, provider/env/secret, payment, e2e, deploy, external-service, PR, merge, push, and Cost Calibration
  work.

## Audit Approach

1. Confirm actual files under the queued read-only scope and record missing planned modules.
2. Read only the allowed route/page files; do not chase imports into source paths outside the task's read-only scope.
3. Compare observed adapters/pages against ADR-002 layering and the standard account/session and personal authorization
   requirements.
4. Record findings as audit evidence only, including severity, traceability ids, file references, and blocked gates.
5. Update queue/state for this task only; leave the next batch task pending until its own branch and task plan.

## Validation Plan

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId unified-standard-mvp-auth-scope-code-audit`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId unified-standard-mvp-auth-scope-code-audit`

## Evidence Hygiene

Evidence must not include raw secret, provider payload, raw response, database URL, row data, prompt payload, cleartext
`redeem_code`, raw question bank content, raw paper content, student answer text, or employee subjective answer text.
