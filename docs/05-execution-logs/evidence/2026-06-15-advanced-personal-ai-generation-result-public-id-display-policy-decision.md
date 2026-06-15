# Evidence: Advanced Personal AI Generation Result Public Id Display Policy Decision

result: pass

## Task

- Task id: `advanced-personal-ai-generation-result-public-id-display-policy-decision`
- Branch: `codex/advanced-personal-ai-generation-result-public-id-display-policy-decision`
- Date: 2026-06-15
- Baseline: `d5d82b6f57ca2965f8b64724283e620ef10199fa`
- Batch range: single docs-only policy decision selected from the pending advanced queue.
- Commit: `d5d82b6f57ca2965f8b64724283e620ef10199fa` pre-closeout HEAD before the local policy decision commit.
- Task kind: docs-only policy decision

## Approval Boundary

The user explicitly requested execution of `advanced-personal-ai-generation-result-public-id-display-policy-decision` to
settle publicId display policy before deciding whether to execute the follow-up UI redaction task.

Allowed:

- task plan, evidence, audit, state, and queue metadata only;
- readonly inspection of UI, tests, contracts, and recent redacted evidence/audit.

Not allowed:

- implementation or source mutation;
- `.env.local`, `.env.*`, secret, provider configuration, database URL, token, cookie, Authorization header, raw prompt,
  raw answer, provider payload, row data, private data, or raw generated content access or output;
- DB access, dev server, Browser, Playwright, e2e, provider/model calls, quota/cost measurement, Cost Calibration Gate,
  staging/prod/cloud/deploy, payment, external-service, PR, or force-push;
- schema, migration, drizzle, script, package, lockfile, dependency, formal adoption write, route/service/UI/test
  implementation change, or authorization-model change.

## Inputs Reviewed

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx` readonly scan
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx` readonly scan
- `src/server/contracts/personal-ai-generation-result-persistence-contract.ts` readonly scan
- `src/server/contracts/personal-ai-generation-result-history-contract.ts` readonly scan
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-next-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-next-implementation-queue-seeding.md`

## Decision

Student-facing advanced AI generation result history/detail UI should hide or collapse public identifier text lists by
default.

The decision is intentionally narrow:

- Keep public identifiers in DTOs and route mechanics as contract identifiers.
- Keep using selected `resultPublicId` internally to open the readonly detail route.
- Do not show lists of `resultPublicId`, `taskPublicId`, `requestPublicId`, or `aiCallLogPublicId` as default visible
  student UI metadata.
- Do not add copy, share, link, download, browser navigation, or free-form publicId lookup affordances.
- Support/debug identifier visibility, if needed later, requires a separate role/scope decision.
- Do not change service/route/API contract in this policy-only task.

## Rationale

- The readonly audit found visible public identifier metadata in authorized history/detail views.
- The same audit confirmed these identifiers are contract public ids, not internal numeric ids, row/private data, raw
  prompt, raw answer, or provider payload.
- Student-facing product value does not require dumping machine identifiers by default; redacted state, status,
  timestamps, content digest/masked preview, evidence status, citation count, and formal adoption blocked markers are
  sufficient for the current UI.
- ADR-002 is preserved by keeping the REST route and DTO contract unchanged while deferring any UI display redaction to a
  separate task.

## Downstream Queue Decision

- `advanced-student-ai-generation-result-public-id-display-ux-redaction` remains pending.
- Its approval is narrowed to `blocked_until_fresh_user_approval`.
- Recommended next action is to execute that UI/test-only task only after fresh user approval.

## RED / GREEN

- RED: Before this task, the queue carried a `needs_recheck` because student UI visibly displayed public identifier
  fields while policy had not decided whether that was acceptable.
- GREEN: This task records the decision to hide/collapse public identifier text lists by default while preserving DTO and
  route mechanics, and keeps implementation blocked for a separate approved task.

## Validation

| Command                                                                                                                                                                                                       | Result | Notes                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ----------------------------------------------------------------- |
| `git diff --check`                                                                                                                                                                                            | pass   | No whitespace errors.                                             |
| `npm.cmd run lint`                                                                                                                                                                                            | pass   | ESLint completed successfully.                                    |
| `npm.cmd run typecheck`                                                                                                                                                                                       | pass   | `tsc --noEmit` completed successfully.                            |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`                                                                           | pass   | Repository readiness inventory completed on the task branch.      |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-decision`      | pass   | Scope scan covered the expected 5 docs/state changed files.       |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-decision` | pass   | Evidence/audit anchors and Module Run v2 strict evidence passed.  |
| `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-decision`        | pass   | Pre-push readiness passed with master/origin/state SHA alignment. |

## Module Run v2 Closeout Anchors

- localFullLoopGate: pass after whitespace diff check, lint, typecheck, GitCompletionReadiness, PreCommitHardening,
  ModuleCloseoutReadiness, and PrePushReadiness.
- threadRolloverGate: no rollover required for this docs-only policy decision.
- nextModuleRunCandidate: `advanced-student-ai-generation-result-public-id-display-ux-redaction`, blocked until fresh
  user approval.

## Blocked Remainder

- Follow-up UI redaction execution, runtime provider/model execution, provider/env/secret configuration, real DB access,
  schema/migration, dependency changes, e2e/browser/dev-server validation, quota/cost measurement,
  staging/prod/cloud/deploy, payment/external-service, formal adoption write, PR, force-push, raw prompt/raw answer/
  provider payload, raw audit log/AI call log viewer, row data, private data, route/service/API contract changes, source
  implementation changes, and authorization-model changes remain blocked.

Cost Calibration Gate remains blocked.

## Evidence Redaction

This evidence records only task ids, status labels, command names, file paths, commit SHAs, and policy metadata. It
contains no secret, real token, cookie, Authorization header, password, database URL, provider payload, raw prompt, raw
answer, row data, payment data, or private data.
