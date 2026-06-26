# Admin AI generation formal draft adapter contract TDD plan

Task id: `admin-ai-generation-formal-draft-adapter-contract-tdd-2026-06-26`

Branch: `codex/admin-ai-formal-draft-adapter-contract-tdd-20260626`

Task kind: `implementation_tdd`

## SSOT Read List

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/`
- `docs/04-agent-system/operating-manual.md`
- `docs/04-agent-system/sop/requirement-ssot-reading-governance.md`
- `docs/04-agent-system/sop/task-lifecycle-governance.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/01-requirements/00-index.md`
- `docs/01-requirements/modules/02-question-paper.md`
- `docs/01-requirements/advanced-edition/00-index.md`
- `docs/01-requirements/advanced-edition/modules/02-ai-task-domain.md`
- `docs/01-requirements/advanced-edition/modules/08-organization-ai-generation.md`
- `docs/01-requirements/advanced-edition/stories/epic-05-formal-content-separation.md`
- `docs/01-requirements/traceability/2026-06-23-advanced-ai-generation-scope-clarification.md`

## Requirement Decision Map

- Content admin AI generated content may become formal `question` or `paper` only through governed review and an
  explicit adoption path.
- The adapter must reuse existing formal content service boundaries instead of direct DB row insertion.
- This task defines and tests the adapter contract only. Route integration, live DB write, adoption metadata update, and
  local route smoke are later tasks.
- Provider/Cost, staging/prod, payment, external service, deployment/release readiness, and final Pass remain blocked.

## Requirement Mapping

- Formal content separation requires human-reviewed payloads before formal draft creation.
- The adapter input is an existing adoption DTO plus a reviewer-approved draft payload.
- The adapter output is redacted: adoption public id, source result public id, target type, formal draft public id, write
  status, and redaction status only.
- The adapter must not return raw generated result content, raw prompt, provider payload, or full formal draft content.

## Evidence-Only Sources

- `docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md`
- `docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-adoption-local-route-smoke-execution.md`

## Conflict Check

- Existing formal adoption metadata currently records `blocked_without_follow_up_task`; this task may widen type support
  for adapter output but must not change the DB adapter to accept draft-created rows.
- Existing `question` and `paper` services already validate formal content input. The adapter should call those service
  ports and avoid duplicating validators.
- If route integration or metadata update becomes necessary, stop at the next approval package.

## Implementation Approach

1. Write focused failing tests for question and paper draft adapter behavior.
2. Add a contract file for adapter input/output and writer ports.
3. Add a service implementation that validates adoption scope, target match, blocked write status, and writer response.
4. Map writer success to redacted draft-created output.
5. Keep route integration and live DB writes out of scope.

## Risk Defenses

- TDD: verify RED before implementation and GREEN after implementation.
- Return only identifiers/status, never full formal content.
- Inject writer ports so unit tests do not connect DB.
- Preserve route and DB metadata boundaries for later approval.

## Validation Commands

- `npm.cmd run test:unit -- src/server/services/admin-ai-generation-formal-draft-adapter.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npx.cmd prettier --write --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md src/server/contracts/admin-ai-generation-formal-draft-adapter-contract.ts src/server/services/admin-ai-generation-formal-draft-adapter.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/models/admin-ai-generation-formal-adoption.ts`
- `npx.cmd prettier --check --ignore-unknown docs/04-agent-system/state/project-state.yaml docs/04-agent-system/state/task-queue.yaml docs/05-execution-logs/task-plans/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md docs/05-execution-logs/evidence/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md docs/05-execution-logs/audits-reviews/2026-06-26-admin-ai-generation-formal-draft-adapter-contract-tdd.md src/server/contracts/admin-ai-generation-formal-draft-adapter-contract.ts src/server/services/admin-ai-generation-formal-draft-adapter.ts src/server/services/admin-ai-generation-formal-draft-adapter.test.ts src/server/models/admin-ai-generation-formal-adoption.ts`
- `git diff --check`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PreCommitHardening.ps1 -TaskId admin-ai-generation-formal-draft-adapter-contract-tdd-2026-06-26`
- `powershell.exe -NoProfile -ExecutionPolicy Bypass -File .\scripts\agent-system\Test-ModuleRunV2PrePushReadiness.ps1 -TaskId admin-ai-generation-formal-draft-adapter-contract-tdd-2026-06-26 -SkipRemoteAheadCheck`
