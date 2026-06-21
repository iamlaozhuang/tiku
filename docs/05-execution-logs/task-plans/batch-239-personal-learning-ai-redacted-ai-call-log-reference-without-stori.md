# Task Plan: batch-239-personal-learning-ai-redacted-ai-call-log-reference-without-stori

## Scope

- Module: `personal-learning-ai`
- Branch: `codex/batch-239-personal-learning-ai-redacted-ai-call-log`
- Task: validate redacted `ai_call_log` reference behavior without storing raw generated AI content.
- Allowed source surfaces: `src/server/models/**`, `src/server/contracts/**`, `src/server/validators/**`, `src/server/services/**`.
- Planned docs/state surfaces: `docs/04-agent-system/state/project-state.yaml`, `docs/04-agent-system/state/task-queue.yaml`, this plan, task evidence, and task audit review.

## Standards Read

- `AGENTS.md`
- `docs/03-standards/code-taste-ten-commandments.md`
- `docs/02-architecture/adr/adr-001-tech-stack-selection.md`
- `docs/02-architecture/adr/adr-002-runtime-architecture-and-multi-client-contract.md`
- `docs/02-architecture/adr/adr-003-workplace-desktop-web-compatibility.md`
- `docs/02-architecture/adr/adr-004-environment-isolation-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-005-staging-architecture-and-release-boundaries.md`
- `docs/02-architecture/adr/adr-006-runtime-dependency-alignment.md`
- `docs/02-architecture/adr/adr-007-edition-aware-authorization-source-of-truth.md`

## Implementation Approach

- Use the current local source as the source of truth.
- Prefer no source change if `personal-ai-generation-ai-call-log-reference-service` already validates redacted references and non-storage of raw content.
- Run the focused unit target first: `src/server/services/personal-ai-generation-ai-call-log-reference-service.test.ts`.
- If a real gap is found, keep the fix inside the allowed `personal-learning-ai` model/contract/validator/service surfaces and avoid schema, dependency, provider, env, deploy, payment, PR, force-push, and Cost Calibration Gate work.

## Validation Plan

- `Test-ModuleRunV2ImplementationAutoSeedReadiness.ps1`
- `Test-ModuleRunV2UnattendedReadiness.ps1`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-work`
- `Test-ModuleRunV2WorkReadiness.ps1 -Mode pre-edit`
- `npm.cmd run test:unit -- src/server/services/personal-ai-generation-ai-call-log-reference-service.test.ts`
- `npm.cmd run lint`
- `npm.cmd run typecheck`
- `git diff --check`
- `Test-ModuleRunV2PreCommitHardening.ps1`
- `Test-ModuleRunV2ModuleCloseoutReadiness.ps1`
- `Test-ModuleRunV2PrePushReadiness.ps1`

## Risk Controls

- Evidence records only command names, pass/fail results, task ids, file paths, and redacted behavior summaries.
- No secrets, tokens, database URLs, raw prompts, raw generated content, provider payloads, raw answer text, full paper content, internal DB rows, or plaintext `redeem_code` values.
- No local DB migration apply and no destructive local DB action.
- High-risk gates remain blocked unless a later fresh approval explicitly expands scope.
