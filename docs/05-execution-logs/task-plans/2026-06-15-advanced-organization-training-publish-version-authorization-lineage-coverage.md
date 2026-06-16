# Task Plan: advanced-organization-training-publish-version-authorization-lineage-coverage

## Module Run V2 Anchors

- Task: `advanced-organization-training-publish-version-authorization-lineage-coverage`
- Branch: `codex/advanced-organization-training-publish-version-authorization-lineage-coverage`
- Baseline: `master == origin/master == 22686782b79a20fe5bf39c926ab37a20bf0d136a`
- Task kind: TDD implementation coverage
- Human approval: current 2026-06-15 Codex thread, user approved execution.
- Closeout approval: task-scoped local commit, fast-forward merge to `master`, push `origin/master`, delete short branch, fetch prune.

## Read Before Edit

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-authorization-lineage-coverage-seeding.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-organization-training-publish-version-service-readonly-recheck.md`
- `src/server/services/organization-training-service.ts`
- `src/server/services/organization-training-service.test.ts`

## Scope

- Add RED-first unit coverage proving publish-version writes preserve authorization lineage before repository/schema/route persistence.
- Add minimal service implementation so internal `OrganizationTrainingPublishedVersionWrite` carries `authorizationSource: "org_auth"` and a normalized `authorizationPublicId`.
- Keep `OrganizationTrainingPublishedVersionDto` output free of authorization lineage fields.
- Keep repository, schema, route, UI, provider, dependency, and formal target writes blocked.

## Implementation Plan

1. Add failing service tests:
   - Success path asserts the internal store write includes authorization lineage.
   - Invalid path blocks publish when authorization lineage is missing.
   - Public result DTO does not expose authorization lineage.
2. Run the scoped service unit test and record the expected RED failure.
3. Extend service-local metadata normalization and write type only.
4. Run focused GREEN, scoped unit tests, diff/lint/typecheck, and Module Run v2 closeout gates.
5. Record evidence/audit/state/queue, commit, fast-forward merge, push, and clean the short branch.

## Validation Plan

- `npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts"` for RED and focused GREEN.
- `npm.cmd run test:unit -- "src/server/services/organization-training-service.test.ts" "src/server/validators/organization-training.test.ts" "src/server/services/effective-authorization-service.test.ts"`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-coverage`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-coverage`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-organization-training-publish-version-authorization-lineage-coverage`

## Risk Controls

- No `.env*` read/write/output.
- No DB access, direct row/private data access, provider/model call, provider configuration, quota/cost measurement, Cost Calibration Gate, dev server, Browser, Playwright, e2e, staging/prod/cloud/deploy/payment/external-service, schema/drizzle/scripts/package/lockfile/dependency change, formal content write, formal target write, PR, or force push.
- Evidence records file paths, field names, command names, and redacted conclusions only.
