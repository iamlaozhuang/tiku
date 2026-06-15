# advanced-student-ai-generation-request-history-public-id-redaction-readonly-audit evidence

## Scope

- Task: readonly audit of student AI generation request history public identifier redaction coverage.
- Batch range: single task `advanced-student-ai-generation-request-history-public-id-redaction-readonly-audit`.
- Branch: `codex/advanced-student-ai-generation-request-history-public-id-redaction-readonly-audit`.
- Commit: `96e7dc7a1c5a8cbcb0420724cff7e0f3b577c95d` pre-task base commit; final docs-only audit commit is recorded in
  closeout handoff after local commit.
- Approval: fresh user approval on 2026-06-15 for task execution and local closeout.
- localFullLoopGate: request-history service and student page unit tests, diff check, lint, typecheck,
  GitCompletionReadiness, PreCommitHardening, ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required; task is scoped to this thread and branch.
- nextModuleRunCandidate: narrow TDD task to add explicit request-history publicId redaction UI test coverage.

## Readiness

- Started from `master` after `git fetch --prune origin`.
- Confirmed clean worktree before creating the task branch.
- Confirmed `HEAD == master == origin/master` at `96e7dc7a1c5a8cbcb0420724cff7e0f3b577c95d`.
- Confirmed no local or remote `codex/*` residual branches before creating this task branch.

## Readonly Audit

RED: not applicable for this readonly audit; no product code or test code was changed.

GREEN: readonly audit completed; source code currently keeps request-history public identifiers out of student-facing
visible fields.

Findings:

- `PersonalAiGenerationRequestHistoryItemDto` still carries `requestPublicId`, `taskPublicId`, `resultPublicId`, and
  `aiCallLogPublicId` as DTO fields. This remains an internal/local-contract surface rather than a visible student UI
  guarantee.
- `buildPersonalAiGenerationRequestHistoryReadModel` maps request history rows into camelCase DTOs and sets
  `redactionStatus: redacted`; existing service tests guard against numeric id, provider payload, generated content,
  and full paper content leakage.
- `StudentPersonalAiGenerationHistorySummary` uses `historyRow.requestPublicId` only as a React key and renders visible
  fields for `status`, `requestedAt`, `evidenceStatus`, `citationCount`, and `redactionStatus`.
- Source scan found no visible `ContractField` labels for `requestPublicId`, `taskPublicId`, `resultPublicId`,
  `aiCallLogPublicId`, or `contextPublicId`.
- Current `StudentPersonalAiGenerationPage.test.tsx` public identifier negative assertions cover result history/detail
  fixture values, not a non-empty request-history fixture. The default request-history mock returns `data: []`, so
  request-history publicId redaction lacks explicit UI fixture coverage.

Needs recheck:

- Add a narrow TDD follow-up that supplies a non-empty request-history fixture and asserts request/task/result/ai-call
  public identifier values are not rendered while visible request-history metadata remains visible.

## Validation

```powershell
npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-history-service.test.ts src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx
```

Result: pass, 2 test files, 9 tests.

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
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-student-ai-generation-request-history-public-id-redaction-readonly-audit
```

Result: pass.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-student-ai-generation-request-history-public-id-redaction-readonly-audit
```

Result: pass after evidence is written.

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-student-ai-generation-request-history-public-id-redaction-readonly-audit
```

Result: pass.

## Blocked Gates Preserved

- Cost Calibration Gate remains blocked.
- No `.env*` read/write/output.
- No source implementation edits.
- No DB access and no row/private data inspection.
- No provider/model calls, provider payload inspection, raw prompt inspection, or raw answer inspection.
- No quota/cost measurement or Cost Calibration Gate execution.
- No dev server.
- No Browser, Playwright, or e2e.
- No staging/prod/cloud/deploy/payment/external-service access.
- No schema, drizzle, scripts, package, lockfile, or dependency changes.
- No formal adoption write.
- No service/route/API contract changes.
- No PR and no force push.
- Blocked remainder: implementation, provider, DB, schema, dependency, e2e/browser/dev-server, staging/prod/cloud,
  deploy, payment, external-service, formal adoption write, raw/private data, PR, and force-push work remain blocked.

## Result

result: pass_with_needs_recheck

Readonly audit passed for current source behavior and identified a focused UI test coverage gap.
