# Task Plan: advanced-admin-ai-generation-formal-adoption-review-ui-affordance

## Scope

- Task type: local admin UI implementation.
- Goal: add a narrow admin-side formal adoption review affordance to the AI audit log operations page.
- Branch: `codex/advanced-admin-ai-generation-formal-adoption-review-ui-affordance`.
- Baseline: `master == origin/master == 981143d50549cc365e22bd6570f442059fbf8836` before task branch creation.

## Inputs Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-admin-ai-generation-formal-adoption-review-ui-boundary-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-admin-ai-generation-formal-adoption-review-ui-boundary-readonly-audit.md`
- Existing admin UI component and nearby Testing Library test style.

## TDD Plan

1. RED: add focused component tests first for the formal adoption review affordance covering entry, loading, error, success, blocked status, redaction, and non-leakage.
2. Verify RED with the scoped unit command and confirm failure is caused by the missing affordance.
3. GREEN: implement the smallest admin UI change in `AdminAiAuditLogOpsBaseline.tsx`.
4. Keep implementation UI-only: consume the existing local readonly formal adoption review route/contract; do not change route, service, repository, schema, provider, or formal target write behavior.
5. Verify GREEN with the scoped unit command, then run diff check, lint, typecheck, and Module Run v2 gates.

## Risk Controls

- No `.env*` read/write/output.
- No DB access or direct row/private data inspection.
- No provider/model call, provider configuration, provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement or Cost Calibration Gate execution.
- No dev server, Browser, Playwright, or e2e, per the batch blocked gates.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, student UI, API contract, or formal adoption write changes.
- UI must show metadata-only/redacted/formal target write blocked semantics and must not display publicId lists or raw generated content.

## Validation

- `npm.cmd run test:unit -- src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx src/server/services/personal-ai-generation-formal-adoption-service.test.ts src/server/services/personal-ai-generation-formal-adoption-runtime.test.ts`
- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-admin-ai-generation-formal-adoption-review-ui-affordance`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-admin-ai-generation-formal-adoption-review-ui-affordance`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-admin-ai-generation-formal-adoption-review-ui-affordance`
