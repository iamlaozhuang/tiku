# advanced-personal-ai-generation-result-public-id-display-policy-decision

## Task

Docs-only policy decision for student-facing advanced personal AI generation result public identifier display.

Decision question:

- May student-facing advanced AI result history/detail views continue displaying contract public identifiers as visible
  metadata?
- Or should public identifier text lists be hidden/collapsed while preserving the selected-detail affordance and route
  contract?

## Read Before Work

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/traceability/capability-catalog.md`
- `docs/04-agent-system/state/advanced-edition-code-stage-seeding-plan.yaml`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-readonly-audit.md`
- `docs/05-execution-logs/evidence/2026-06-15-advanced-next-implementation-queue-seeding.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-next-implementation-queue-seeding.md`

## Context

The readonly audit found:

- current UI displays contract public identifiers in authorized history/detail metadata;
- these values are not internal numeric ids, row/private data, raw prompt, raw answer, or provider payload;
- there is no copy/share/download/link/free-form lookup affordance;
- the remaining question is product/governance policy, not an observed secret or private data leak.

## Scope

Allowed writes:

- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- this task plan
- `docs/05-execution-logs/evidence/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-decision.md`
- `docs/05-execution-logs/audits-reviews/2026-06-15-advanced-personal-ai-generation-result-public-id-display-policy-decision.md`

Readonly references:

- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.tsx`
- `src/features/student/ai-generation/StudentPersonalAiGenerationPage.test.tsx`
- `src/server/contracts/personal-ai-generation-result-persistence-contract.ts`
- `src/server/contracts/personal-ai-generation-result-history-contract.ts`

## Blocked Gates

- no `.env*` read/write/output
- no DB access or row/private data inspection
- no provider/model call or provider payload/raw prompt/raw answer inspection
- no quota/cost/Cost Calibration
- no dev server
- no Browser/Playwright/e2e
- no staging/prod/cloud/deploy/payment/external-service
- no schema/drizzle/scripts/package/lockfile/dependency changes
- no formal adoption write
- no implementation
- no route/service/UI/source/test changes
- no PR or force push

## Decision Criteria

- Safety: avoid unnecessary identifier exposure in student-facing UI.
- Debuggability: keep enough metadata for support and local contract verification when needed.
- ADR-002: preserve route/service contract and avoid changing REST boundary in a policy-only task.
- UX: student UI should remain understandable without dumping machine identifiers by default.
- Scope: any code change must be a separate task after this docs-only decision.

## Planned Decision

Default to a conservative student-facing display policy:

- Do not show public identifier text lists by default in student-facing advanced AI result history/detail UI.
- Keep public identifiers in DTOs and route mechanics as contract identifiers.
- Allow using the selected `resultPublicId` internally for opening detail, but hide/collapse the textual metadata in UI.
- No copy/share/free-form lookup affordance should be added.
- Support/debug views, if needed later, require a separate role/scope decision.

## Validation

- `git diff --check`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-GitCompletionReadiness.ps1 -BaseBranch master`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-decision`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-decision`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId advanced-personal-ai-generation-result-public-id-display-policy-decision`
