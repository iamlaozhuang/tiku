# Task Plan: advanced-next-implementation-queue-seeding-post-model-config-redaction

## Scope

- Task type: docs-only queue seeding.
- Branch: `codex/advanced-next-implementation-queue-seeding-post-model-config-redaction`.
- Goal: restore an explicit advanced queue after the admin AI ops model-config identifier redaction chain closed.
- Output:
  - one task plan;
  - one redacted evidence record;
  - one audit review;
  - project-state handoff update;
  - task-queue entries for the current seeding task and the next strictly serial advanced candidates.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/superpowers/specs/2026-06-06-advanced-edition-mvp-requirements.md`
- `docs/superpowers/plans/2026-06-06-advanced-edition-organization-training-implementation-plan.md`
- Latest model-config redaction recheck evidence/audit.

## Seeding Decision

The previous model-config public identifier redaction chain is closed with `pass` and no immediate repair remains.
The active queue currently has no `pending` or `in_progress` task. The next advanced line should move to organization
training because it is part of the advanced MVP main loop and still lacks an isolated local contract/validation domain.

Seed three strictly serial tasks:

1. `advanced-organization-training-boundary-readonly-audit`
2. `advanced-organization-training-contract-validation-scaffold`
3. `advanced-organization-training-contract-validation-readonly-recheck`

## Blocked Gates

- No `.env*` read/write/output.
- No DB access and no row/private data read.
- No provider/model calls or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, UI, or API contract changes.
- No formal adoption target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Validation Plan

```powershell
npm.cmd run test:unit -- "src/server/services/organization-auth-service.test.ts" "src/server/services/employee-account-service.test.ts" "src/server/services/personal-ai-generation-result-reference-service.test.ts"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-next-implementation-queue-seeding-post-model-config-redaction
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-next-implementation-queue-seeding-post-model-config-redaction
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-next-implementation-queue-seeding-post-model-config-redaction
```
