# Task Plan: advanced-admin-ai-ops-model-config-public-identifier-redaction-readonly-recheck

## Scope

- Task type: readonly audit/recheck.
- Branch: `codex/advanced-admin-ai-ops-model-config-public-identifier-redaction-readonly-recheck`.
- Goal: recheck the admin AI ops page after the model-config identifier redaction affordance.
- Surfaces:
  - admin audit log row display;
  - formal adoption review affordance;
  - embedded model-config management row display;
  - readonly route/service/contract boundaries that justify the UI semantics.

## Required Reading

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- Latest related evidence/audit:
  - `2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit`
  - `2026-06-15-advanced-admin-ai-ops-model-config-public-identifier-redaction-affordance`

## Checks

Readonly checks will confirm:

- default visible text for audit log rows remains identifier-folded and summary-only;
- formal adoption review affordance remains metadata-only, redacted, and formal target write blocked;
- model-config rows fold public identifier values by default while preserving non-visible metadata/action binding;
- form inputs remain an explicit admin configuration reference boundary, not default row display;
- route handlers remain thin adapters over service/runtime boundaries under ADR-002;
- contracts use camelCase DTO fields and standard API envelopes;
- no formal adoption target write was introduced.

## Blocked Gates

- No `.env*` read/write/output.
- No DB access and no row/private data read.
- No provider/model calls or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No route, service, repository, API contract, provider, formal target write, or product implementation changes.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Validation Plan

```powershell
npm.cmd run test:unit -- "src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx"
git diff --check
npm.cmd run lint
npm.cmd run typecheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-admin-ai-ops-model-config-public-identifier-redaction-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-admin-ai-ops-model-config-public-identifier-redaction-readonly-recheck
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-admin-ai-ops-model-config-public-identifier-redaction-readonly-recheck
```
