# batch-119 Personal Learning AI Personal Generation Request Flow Plan

**Task id:** `batch-119-personal-learning-ai-personal-generation-request-flow`

**Branch:** `codex/batch-119-personal-learning-ai-personal-generation-request-flow`

**Task kind:** `implementation`

## Sources Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/*.md`
- `docs/04-agent-system/state/project-state.yaml`
- `docs/04-agent-system/state/task-queue.yaml`
- `docs/05-execution-logs/evidence/2026-06-12-fix-phase-71-personal-ai-generation-auto-seed-anchors.md`
- Existing personal AI generation request, AI generation task request, and personal result-reference services.

## Goal

Implement a local-only personal AI generation request flow that composes the existing redacted request contract, local
`ai_generation_task` request policy, and personal result-reference contract without provider calls or persistence.

## Implementation Plan

1. Add a focused failing unit test for the local flow service.
2. Introduce a small flow model/contract/validator/service:
   - accept one flat local input using existing request and task policy fields;
   - require personal boundaries: `personal_auth`, personal owner/quota owner, no `organizationPublicId`, actor matches `userPublicId`;
   - allow only `ai_question_generation` and `ai_paper_generation`;
   - map policy decisions to flow statuses: `accepted`, `reused`, `blocked`;
   - build a redacted result reference from the policy decision.
3. Keep output summary-only and redacted:
   - no numeric `id`;
   - no raw prompt, raw generated content, provider payload, token, plaintext `redeem_code`, or full `paper` content;
   - optional absent values remain `null`.
4. Update docs/state/evidence/audit and keep high-risk gates blocked.

## Validation Plan

- RED/GREEN focused unit: `npm.cmd run test:unit -- src/server/services/personal-ai-generation-request-flow-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `npm.cmd run test:unit`
- `npm.cmd run build`
- `git diff --check`
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1 -TaskId batch-119-personal-learning-ai-personal-generation-request-flow`

## Risk Defenses

- No provider call or provider configuration.
- No schema/migration, database write path, repository, or formal content write-path change.
- No dependency/package/lockfile changes.
- No `src/app/**`, UI, or e2e change.
- Cost Calibration Gate remains blocked.
