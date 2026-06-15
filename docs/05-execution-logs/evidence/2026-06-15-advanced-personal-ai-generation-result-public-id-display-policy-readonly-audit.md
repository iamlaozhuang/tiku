# Evidence: Advanced Personal AI Generation Result Public Id Display Policy Readonly Audit

result: pass_with_needs_recheck

## Task

- Task id: `advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit`
- Branch: `codex/advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit`
- Date: 2026-06-15
- Baseline: `5b3c8b0a3cafe258fe5871a8d2329b2a04d3a370`
- Batch range: strict serial approved two-task batch, task 1 of 2. Task 2 must not start until this task is committed,
  fast-forward merged to `master`, pushed to `origin/master`, short-branch cleaned, fetch-pruned, and verified clean.
- Commit: `5b3c8b0a3cafe258fe5871a8d2329b2a04d3a370` pre-closeout HEAD before the local audit commit.
- Task kind: readonly audit
- Scope: docs-only state, task plan, evidence, and audit output plus readonly source/evidence inspection.

## Approval Boundary

The user approved this as the first task in a strict serial two-task batch before
`advanced-next-implementation-queue-seeding`.

Allowed:

- task plan, evidence, audit, state, and queue metadata only;
- readonly inspection of service, route, contract, UI, tests, and recent redacted evidence/audit.

Not allowed:

- implementation or source mutation;
- `.env.local`, `.env.*`, secret, provider configuration, database URL, token, cookie, Authorization header, raw prompt,
  raw answer, provider payload, row data, private data, or raw generated content access or output;
- DB access, dev server, Browser, Playwright, e2e, provider/model calls, quota/cost measurement, Cost Calibration Gate,
  staging/prod/cloud/deploy, payment, external-service, PR, or force-push;
- schema, migration, drizzle, script, package, lockfile, dependency, formal adoption write, publicId policy change,
  route/service/UI implementation change, or authorization-model change.

## Readonly Inputs Checked

- `src/server/contracts/personal-ai-generation-result-history-contract.ts`
- `src/server/contracts/personal-ai-generation-result-persistence-contract.ts`
- `src/server/services/personal-ai-generation-result-history-service.ts`
- `src/server/services/personal-ai-generation-result-route.ts`
- `src/server/validators/personal-ai-generation-result-history.ts`
- `src/app/api/v1/personal-ai-generation-results/[publicId]/route.ts`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- recent evidence/audit for detail UI, detail-flow readonly audit, `404045` fix, and detail-flow recheck.

## Findings

- PASS: ADR-002 layering is preserved. The detail route maps route `{publicId}` to service `resultPublicId` and derives
  `ownerPublicId` from the session-owned personal user context, not from client input.
- PASS: The detail query validator requires non-empty `ownerPublicId` and `resultPublicId`; it does not accept an
  alternate client-supplied owner field.
- PASS: The history/detail contract exposes public contract identifiers and redacted metadata only. It does not expose
  internal numeric ids, raw prompt, raw answer, provider payload, database row shape, or private fields.
- PASS: The service maps detail through the same redacted mapper as history and preserves `local_contract_only`,
  `redacted_snapshot`, `redacted`, and `blocked_without_follow_up_task`.
- PASS: The student UI detail helper fetches only
  `/api/v1/personal-ai-generation-results/{encodedResultPublicId}` from the selected authorized history item. There is no
  free-form publicId input, copy/share/download/link affordance, or browser navigation surface for public identifiers.
- PASS: Focused component coverage verifies the detail route path is built from the selected result public id and that
  synthetic unsafe provider/private/generated echo fields are not rendered.
- NEEDS_RECHECK: The student UI intentionally renders public identifier metadata in authorized request/result history
  and detail views, including `resultPublicId`, `taskPublicId`, `requestPublicId`, and nullable `aiCallLogPublicId`.
  This is contract-public metadata, not row/private data, and was already flagged by the previous detail-flow readonly
  audit as a policy interpretation point. If the intended product policy is "do not show public identifier text lists to
  students", a separate scoped UX redaction or policy-decision task is required.
- PASS: No source file was modified during this readonly audit.

## RED / GREEN

- RED: The previous detail-flow readonly audit already carried a public identifier display needs_recheck, and this
  focused audit confirmed visible public identifier metadata in authorized student history/detail views.
- GREEN: Readonly review confirmed those values are contract public identifiers rather than internal numeric ids or
  private/raw/provider fields; the task records the remaining policy decision as a separate follow-up instead of changing
  UI behavior in this audit.

## Validation

| Command                                                                                                                                                                                                             | Result | Notes                                                                                               |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------- |
| `npm.cmd run test:unit -- src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`                                                                                                              | pass   | 1 file and 6 tests passed; includes redacted detail flow and unsafe echo non-rendering coverage.    |
| `git diff --check`                                                                                                                                                                                                  | pass   | No whitespace errors.                                                                               |
| `npm.cmd run lint`                                                                                                                                                                                                  | pass   | ESLint completed successfully.                                                                      |
| `npm.cmd run typecheck`                                                                                                                                                                                             | pass   | `tsc --noEmit` completed successfully.                                                              |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                                 | pass   | Repository readiness inventory completed on the task branch.                                        |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit`      | pass   | Scope scan covered the expected 5 docs/state changed files.                                         |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit` | pass   | Initial run flagged missing strict evidence anchors; rerun passed after evidence anchor correction. |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit`        | pass   | Pre-push readiness passed with master/origin/state SHA alignment at baseline.                       |

## Module Run v2 Closeout Anchors

- localFullLoopGate: pass after focused unit validation, whitespace diff check, lint, typecheck, GitCompletionReadiness,
  PreCommitHardening, ModuleCloseoutReadiness rerun after evidence anchor correction, and PrePushReadiness.
- threadRolloverGate: no rollover required for this docs-only readonly audit.
- nextModuleRunCandidate: `advanced-next-implementation-queue-seeding`, which should carry forward the public identifier
  display policy needs_recheck and seed only separately scoped, low-risk follow-up tasks.

## Blocked Remainder

- Runtime provider/model execution, provider/env/secret configuration, real DB access, schema/migration, dependency
  changes, e2e/browser/dev-server validation, quota/cost measurement, staging/prod/cloud/deploy, payment/external-service,
  formal adoption write, PR, force-push, raw prompt/raw answer/provider payload, raw audit log/AI call log viewer, row
  data, private data, publicId policy changes, route/service/UI implementation changes, and authorization-model changes
  remain blocked.

Cost Calibration Gate remains blocked.

## Evidence Redaction

This evidence records only task ids, status labels, command names, file paths, commit SHAs, response code identifiers,
and contract/state labels. It contains no secret, real token, cookie, Authorization header, password, database URL,
provider payload, raw prompt, raw answer, row data, payment data, or private data.
