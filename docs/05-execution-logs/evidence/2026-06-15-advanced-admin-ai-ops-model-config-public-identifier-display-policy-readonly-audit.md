# Evidence: advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit

## Module Run V2 Anchors

- Task: readonly audit and policy decision for same-page admin AI ops model-config public identifier display.
- Batch range: single user-approved follow-up after
  `advanced-admin-ai-audit-log-public-identifier-redaction-readonly-recheck`.
- Branch: `codex/advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit`.
- Baseline: `master == origin/master == 974f46f0c718f432b7c44963b727fa53ece822f4` before branch creation.
- Commit: `974f46f0c718f432b7c44963b727fa53ece822f4` accepted baseline before the local closeout commit; the task
  commit is recorded by Git history after closeout gates.
- Approval: user approved execution on 2026-06-15.
- localFullLoopGate: scoped unit test, diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this branch.
- nextModuleRunCandidate: TDD UI-only model-config identifier collapse/redaction affordance, only after fresh approval.

## Readiness

- Ran `git switch master`.
- Deleted the empty residual local short branch from the interrupted prior attempt.
- Ran `git fetch --prune origin`.
- Confirmed clean worktree before creating the task branch.
- Confirmed `HEAD == master == origin/master` at the baseline SHA above.
- Confirmed no local or remote `codex/*` residual branches before creating this task branch.

## Scope Reviewed

- `src/app/(admin)/ops/ai-audit-logs/page.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.tsx`
- `src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx`
- `src/features/admin/model-config-management/AdminModelConfigManagement.tsx`
- `src/server/contracts/admin-ai-audit-log-ops-contract.ts`
- `src/server/services/admin-ai-audit-log-runtime.ts`
- `src/server/services/admin-ai-audit-log-ops-route.ts`
- `src/server/services/admin-ai-audit-log-ops-service.ts`
- `src/server/services/model-config-runtime.ts`
- `src/app/api/v1/model-providers/**`
- `src/app/api/v1/model-configs/**`
- `src/app/api/v1/prompt-templates/**`

## Findings

- The prior audit-log-row redaction remains scoped to audit log summary rows and the formal adoption review affordance:
  visible row text shows `metadata-only`, `redacted`, and `summary_only` semantics instead of identifier values.
- The same admin AI ops page embeds model configuration management before the audit log panels.
- The model-config management component uses public identifiers as admin configuration references for provider selection,
  fallback relationships, row actions, and REST path parameters. This is not an internal auto-increment id exposure.
- Model-config form labels and row summaries still make public-identifier-oriented fields visible, including provider and
  fallback references. Row elements also carry non-visible `data-public-id` metadata for interaction/test surfaces.
- ADR-002 layering remains intact for the inspected route surface: route handlers are thin adapters over service/runtime
  logic, contracts use camelCase DTO fields, and route paths use public identifiers rather than database ids.
- The contract/runtime carries `snapshotPolicy: "redacted_metadata"` and redacted prompt-template preview/digest fields,
  but the model-config public identifier fields are not themselves redacted in the current UI.
- The page-level copy says identifier values are folded by default for the page. That statement is accurate for audit log
  rows after the UI affordance, but too broad for the embedded model-config management surface.

## Policy Decision

result: pass_with_needs_recheck

Model-config public identifier fields are allowed as admin-only configuration primitives when they are needed to bind
providers, model configs, fallback relationships, and REST actions. They should not be treated as secrets, raw provider
payloads, row data, or private data, and the current route shape avoids exposing internal database ids.

However, this is not a blanket page-level diagnostics exception. Default visible model-config row/display text should not
contradict the page-level "identifier values folded" policy. The safer policy is:

- form inputs may accept public identifier references where required for configuration;
- non-visible DOM metadata may remain narrowly justified for interaction/test targeting;
- default row/display surfaces should collapse or redact public identifier values unless an explicit admin diagnostics
  affordance reveals them;
- page copy must either be narrowed to audit-log/formal-review rows or the model-config surface must implement matching
  collapse/redaction behavior.

Recommended next task: `advanced-admin-ai-ops-model-config-public-identifier-redaction-affordance`, TDD UI-only, scoped to
the admin model-config management surface and its tests, with no route/service/repository/schema/provider/formal-write
changes.

## RED / GREEN

- RED: not applicable for this readonly audit; no product source or test implementation was changed.
- GREEN: readonly policy audit completed; validation results are recorded below.

## Validation

```powershell
npm.cmd run test:unit -- "src/app/(admin)/ops/ai-audit-logs/AdminAiAuditLogOpsBaseline.test.tsx"
```

Result: pass, 1 test file, 6 tests.

```powershell
git diff --check
```

Result: pass.

```powershell
npm.cmd run lint
```

Result: pass.

```powershell
npm.cmd run typecheck
```

Result: pass.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master
```

Result: pass.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit
```

Result: pass.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit
```

Result: pass.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-admin-ai-ops-model-config-public-identifier-display-policy-readonly-audit
```

Result: pass.

## Blocked Gates Preserved

- No `.env*` read/write/output.
- No DB access and no direct row/private data read.
- No provider/model call or provider configuration.
- No provider payload, raw prompt, or raw answer inspection.
- No quota/cost measurement and no Cost Calibration Gate work.
- Cost Calibration Gate remains blocked.
- No dev server, Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, dependency, route, service, repository, UI, test, or API contract changes.
- No formal adoption target write.
- No public identifier value list exposure in evidence.
- No PR and no force push.

## Evidence Redaction

This evidence records file paths, field names, policy status, command results, and redacted conclusions only. It does not
record secret, token, cookie, Authorization header, database URL, provider payload, raw prompt, raw answer, row data,
private data, or public identifier value lists.
